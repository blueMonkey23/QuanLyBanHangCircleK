const { getPool } = require('./pool');
const {
  toNumberOrNull,
  toDateTimeValue,
} = require('circlek-core');

function mapInvoiceRow(row) {
  if (!row) {
    return null;
  }

  return {
    maHoaDon: toNumberOrNull(row.MaHoaDon),
    maNhanVien: toNumberOrNull(row.MaNhanVien),
    tenNhanVien: row.TenNhanVienSnapshot || null,
    usernameNhanVien: row.UsernameNhanVienSnapshot || null,
    maKhachHang: toNumberOrNull(row.MaKhachHang),
    tenKhachHang: row.TenKhachHangSnapshot || null,
    ngayTao: toDateTimeValue(row.NgayTao),
    tongTien: toNumberOrNull(row.TongTien),
    phuongThucThanhToan: row.PhuongThucThanhToan,
    status: row.TrangThai,
    reservationId: toNumberOrNull(row.ReservationId),
  };
}

function mapOrderDetailRow(row) {
  if (!row) {
    return null;
  }

  return {
    maChiTiet: toNumberOrNull(row.MaChiTiet),
    maHoaDon: toNumberOrNull(row.MaHoaDon),
    maSanPham: toNumberOrNull(row.MaSanPham),
    tenSanPham: row.TenSanPham,
    soLuong: toNumberOrNull(row.SoLuong),
    donGia: toNumberOrNull(row.DonGia),
    phanTramGiam: toNumberOrNull(row.PhanTramGiam) || 0,
    giaSauGiam: toNumberOrNull(row.GiaSauGiam),
    giamGia: toNumberOrNull(row.GiamGia),
  };
}

async function getInvoiceById(maHoaDon, executor = getPool()) {
  const [rows] = await executor.query(
    `SELECT MaHoaDon, MaNhanVien, TenNhanVienSnapshot, UsernameNhanVienSnapshot, MaKhachHang,
            TenKhachHangSnapshot, NgayTao, TongTien, PhuongThucThanhToan, TrangThai, ReservationId
     FROM HoaDon
     WHERE MaHoaDon = ?
     LIMIT 1`,
    [maHoaDon],
  );

  return mapInvoiceRow(rows[0]) || null;
}

async function getOrderDetail(maHoaDon, executor = getPool()) {
  const hoaDon = await getInvoiceById(maHoaDon, executor);
  const [detailRows] = await executor.query(
    `SELECT MaChiTiet, MaHoaDon, MaSanPham, TenSanPham, SoLuong, DonGia, PhanTramGiam, GiaSauGiam, GiamGia
     FROM ChiTietHoaDon
     WHERE MaHoaDon = ?
     ORDER BY MaChiTiet ASC`,
    [maHoaDon],
  );

  return {
    hoaDon,
    chiTiet: detailRows.map(mapOrderDetailRow),
  };
}

async function listOrders(filters) {
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT MaHoaDon, MaNhanVien, TenNhanVienSnapshot, UsernameNhanVienSnapshot, MaKhachHang,
            TenKhachHangSnapshot, NgayTao, TongTien, PhuongThucThanhToan, TrangThai, ReservationId
     FROM HoaDon
     WHERE (? IS NULL OR NgayTao >= ?)
       AND (? IS NULL OR NgayTao <= ?)
       AND (? IS NULL OR MaNhanVien = ?)
       AND (? IS NULL OR TrangThai = ?)
     ORDER BY NgayTao DESC`,
    [
      filters.fromDate,
      filters.fromDate,
      filters.toDate,
      filters.toDate,
      filters.maNhanVien,
      filters.maNhanVien,
      filters.status,
      filters.status,
    ],
  );

  return rows.map(mapInvoiceRow);
}

async function createPendingOrder(data) {
  const pool = getPool();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [invoiceResult] = await connection.query(
      `INSERT INTO HoaDon
        (MaNhanVien, TenNhanVienSnapshot, UsernameNhanVienSnapshot, MaKhachHang, TenKhachHangSnapshot, NgayTao, TongTien, PhuongThucThanhToan, TrangThai, ReservationId)
       VALUES (?, ?, ?, ?, ?, UTC_TIMESTAMP(), ?, ?, 'PENDING', ?)`,
      [
        data.maNhanVien,
        data.tenNhanVienSnapshot,
        data.usernameNhanVienSnapshot || null,
        data.maKhachHang || null,
        data.tenKhachHangSnapshot || null,
        data.tongTien,
        data.phuongThucThanhToan,
        data.reservationId,
      ],
    );

    const maHoaDon = invoiceResult.insertId;
    const insertPlaceholders = data.items.map(() => '(?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
    const insertValues = [];

    data.items.forEach((item) => {
      insertValues.push(
        maHoaDon,
        item.maSanPham,
        item.tenSanPham,
        item.soLuong,
        item.donGia,
        item.phanTramGiam,
        item.giaSauGiam,
        item.giamGia,
      );
    });

    await connection.query(
      `INSERT INTO ChiTietHoaDon
        (MaHoaDon, MaSanPham, TenSanPham, SoLuong, DonGia, PhanTramGiam, GiaSauGiam, GiamGia)
       VALUES ${insertPlaceholders}`,
      insertValues,
    );

    await connection.commit();
    return getOrderDetail(maHoaDon, pool);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function confirmOrderAndCreateOutbox(maHoaDon) {
  const pool = getPool();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    await connection.query(
      `UPDATE HoaDon
       SET TrangThai = 'CONFIRMED'
       WHERE MaHoaDon = ?`,
      [maHoaDon],
    );

    const orderDetail = await getOrderDetail(maHoaDon, connection);
    const payloadJson = JSON.stringify(orderDetail);
    const [outboxResult] = await connection.query(
      `INSERT INTO OrderOutbox
        (EventType, AggregateId, PayloadJson, CreatedAt)
       VALUES ('OrderCreated', ?, ?, UTC_TIMESTAMP())`,
      [maHoaDon, payloadJson],
    );

    await connection.commit();
    return {
      eventId: outboxResult.insertId,
      eventType: 'OrderCreated',
      payload: orderDetail,
      orderDetail,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function markOrderFailed(maHoaDon) {
  const pool = getPool();
  await pool.query(
    `UPDATE HoaDon
     SET TrangThai = 'FAILED'
     WHERE MaHoaDon = ?
       AND TrangThai = 'PENDING'`,
    [maHoaDon],
  );
}

async function markOutboxPublished(eventId) {
  const pool = getPool();
  await pool.query(
    `UPDATE OrderOutbox
     SET PublishedAt = UTC_TIMESTAMP()
     WHERE MaEvent = ?`,
    [eventId],
  );
}

module.exports = {
  listOrders,
  getOrderDetail,
  createPendingOrder,
  confirmOrderAndCreateOutbox,
  markOrderFailed,
  markOutboxPublished,
};
