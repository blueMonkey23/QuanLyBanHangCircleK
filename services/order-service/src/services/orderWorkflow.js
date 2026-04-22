const { AppError } = require('circlek-core');
const repository = require('../db/OrderDataAccess');
const {
  getStaffSnapshot,
  getCustomerSnapshot,
  createInventoryReservation,
  confirmInventoryReservation,
  releaseInventoryReservation,
  publishOrderCreatedEvent,
  publishOrderCancelledEvent,
} = require('../clients/internalServices');

function roundMoney(value) {
  return Math.round(Number(value) * 100) / 100;
}

function generateOrderRequestId() {
  const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `ORD-${timestamp}-${randomPart}`;
}

function mapReservationItemsToOrderItems(items) {
  return items.map((item) => {
    const donGia = Number(item.donGiaSnapshot);
    const giaSauGiam = Number(item.giaSauGiamSnapshot);
    const soLuong = Number(item.soLuong);
    const giamGia = roundMoney((donGia - giaSauGiam) * soLuong);

    return {
      maSanPham: item.maSanPham,
      tenSanPham: item.tenSanPhamSnapshot,
      soLuong,
      donGia,
      phanTramGiam: Number(item.phanTramGiamSnapshot || 0),
      giaSauGiam,
      giamGia,
    };
  });
}

async function safeReleaseReservation(reservationId, reason, requestId) {
  if (!reservationId) {
    return;
  }

  try {
    await releaseInventoryReservation(reservationId, reason, requestId);
  } catch (error) {
    // Do not mask the original failure if compensation also fails.
  }
}

async function publishOutboxEvent(outboxEvent, requestId) {
  if (outboxEvent.eventType === 'OrderCreated') {
    await publishOrderCreatedEvent(
      {
        eventId: String(outboxEvent.eventId),
        eventType: outboxEvent.eventType,
        payload: outboxEvent.payload,
      },
      requestId,
    );
    return;
  }

  if (outboxEvent.eventType === 'OrderCancelled') {
    await publishOrderCancelledEvent(
      {
        eventId: String(outboxEvent.eventId),
        eventType: outboxEvent.eventType,
        payload: outboxEvent.payload,
      },
      requestId,
    );
    return;
  }

  throw new AppError('INTERNAL_ERROR', `Unsupported outbox event: ${outboxEvent.eventType}`, 500);
}

async function createOrder(data, context = {}) {
  const requestId = context.requestId;
  const staffSnapshot = await getStaffSnapshot(data.maNhanVien, requestId);
  const customerSnapshot = data.maKhachHang
    ? await getCustomerSnapshot(data.maKhachHang, requestId)
    : null;
  const reservation = await createInventoryReservation(
    {
      orderRequestId: generateOrderRequestId(),
      items: data.items,
    },
    requestId,
  );

  let pendingOrder;
  try {
    pendingOrder = await repository.createPendingOrder({
      maNhanVien: data.maNhanVien,
      tenNhanVienSnapshot: staffSnapshot.hoTen,
      usernameNhanVienSnapshot: staffSnapshot.username,
      maKhachHang: customerSnapshot?.maKhachHang || null,
      tenKhachHangSnapshot: customerSnapshot?.tenKhachHang || null,
      phuongThucThanhToan: data.phuongThucThanhToan,
      tongTien: reservation.tongTienTamTinh,
      reservationId: reservation.reservationId,
      items: mapReservationItemsToOrderItems(reservation.items),
    });
  } catch (error) {
    await safeReleaseReservation(reservation.reservationId, 'Order persistence failed', requestId);
    throw error;
  }

  try {
    await confirmInventoryReservation(
      reservation.reservationId,
      pendingOrder.hoaDon.maHoaDon,
      requestId,
    );
  } catch (error) {
    await repository.markOrderFailed(pendingOrder.hoaDon.maHoaDon);
    await safeReleaseReservation(reservation.reservationId, 'Inventory confirmation failed', requestId);
    throw error;
  }

  const outboxEvent = await repository.confirmOrderAndCreateOutbox(pendingOrder.hoaDon.maHoaDon);
  let reportSyncStatus = 'SYNCED';

  try {
    await publishOutboxEvent(outboxEvent, requestId);
    await repository.markOutboxPublished(outboxEvent.eventId);
  } catch (error) {
    reportSyncStatus = 'PENDING';
  }

  return {
    ...outboxEvent.orderDetail,
    reservationId: reservation.reservationId,
    reportSyncStatus,
    message: reportSyncStatus === 'SYNCED' ? 'Created' : 'Created; report sync pending',
  };
}

async function cancelOrder(data, context = {}) {
  const requestId = context.requestId;
  const orderDetail = await repository.getOrderDetail(data.maHoaDon);

  if (!orderDetail.hoaDon) {
    throw new AppError('NOT_FOUND', 'Order not found', 404);
  }

  if (orderDetail.hoaDon.status === 'CANCELLED') {
    return {
      ...orderDetail,
      reportSyncStatus: 'SYNCED',
      message: 'Already cancelled',
    };
  }

  if (orderDetail.hoaDon.status !== 'CONFIRMED') {
    throw new AppError('CONFLICT', 'Only confirmed orders can be cancelled', 409);
  }

  const marked = await repository.markOrderCancelling(data.maHoaDon);
  if (!marked) {
    throw new AppError('CONFLICT', 'Order is not in a cancellable state', 409);
  }

  try {
    if (orderDetail.hoaDon.reservationId) {
      await releaseInventoryReservation(
        orderDetail.hoaDon.reservationId,
        data.reason || 'Order cancelled',
        requestId,
      );
    }
  } catch (error) {
    await repository.restoreOrderToConfirmed(data.maHoaDon);
    throw error;
  }

  const outboxEvent = await repository.cancelOrderAndCreateOutbox(data.maHoaDon, data.reason);
  let reportSyncStatus = 'SYNCED';

  try {
    await publishOutboxEvent(outboxEvent, requestId);
    await repository.markOutboxPublished(outboxEvent.eventId);
  } catch (error) {
    reportSyncStatus = 'PENDING';
  }

  return {
    ...outboxEvent.orderDetail,
    reportSyncStatus,
    message: reportSyncStatus === 'SYNCED' ? 'Cancelled' : 'Cancelled; report sync pending',
  };
}

module.exports = {
  createOrder,
  cancelOrder,
};
