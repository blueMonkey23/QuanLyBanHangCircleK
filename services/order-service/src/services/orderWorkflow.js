const repository = require('../db/OrderDataAccess');
const {
  getStaffSnapshot,
  getCustomerSnapshot,
  createInventoryReservation,
  confirmInventoryReservation,
  releaseInventoryReservation,
  publishOrderCreatedEvent,
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
    await publishOrderCreatedEvent(
      {
        eventId: String(outboxEvent.eventId),
        eventType: outboxEvent.eventType,
        payload: outboxEvent.payload,
      },
      requestId,
    );
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

module.exports = {
  createOrder,
};
