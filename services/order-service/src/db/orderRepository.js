const { getPool } = require('./pool');
const {
  toNumberOrNull,
  toDateTimeValue,
} = require('circlek-core');

function getResultSets(rows) {
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows.filter(Array.isArray);
}

async function callProcedure(name, params) {
  const pool = getPool();
  const placeholders = params.map(() => '?').join(', ');
  const sql = `CALL ${name}(${placeholders})`;
  const [rows] = await pool.query(sql, params);
  return rows;
}

function mapInvoiceRow(row) {
  if (!row) {
    return null;
  }

  return {
    maHoaDon: toNumberOrNull(row.MaHoaDon),
    maNhanVien: toNumberOrNull(row.MaNhanVien),
    ngayTao: toDateTimeValue(row.NgayTao),
    tongTien: toNumberOrNull(row.TongTien),
    phuongThucThanhToan: row.PhuongThucThanhToan,
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
    giamGia: toNumberOrNull(row.GiamGia),
  };
}

async function createOrder(data) {
  const rows = await callProcedure('sp_order_create', [
    data.maNhanVien,
    data.phuongThucThanhToan,
    JSON.stringify(data.items),
  ]);
  const resultSets = getResultSets(rows);

  return {
    hoaDon: mapInvoiceRow(resultSets[0]?.[0]),
    chiTiet: (resultSets[1] || []).map(mapOrderDetailRow),
    message: 'Created',
  };
}

async function validateOrderReferences(maNhanVien, productIds) {
  const pool = getPool();
  const [employeeRows] = await pool.query(
    'SELECT MaNhanVien FROM NhanVien WHERE MaNhanVien = ? AND IsDeleted = 0 LIMIT 1',
    [maNhanVien]
  );

  const placeholders = productIds.map(() => '?').join(', ');
  const [productRows] = await pool.query(
    `SELECT MaSanPham FROM SanPham WHERE IsDeleted = 0 AND MaSanPham IN (${placeholders})`,
    productIds
  );

  const existingProductIds = new Set(productRows.map((row) => Number(row.MaSanPham)));
  const missingProductIds = productIds.filter((productId) => !existingProductIds.has(productId));

  return {
    employeeExists: employeeRows.length > 0,
    missingProductIds,
  };
}

async function listOrders(filters) {
  const rows = await callProcedure('sp_order_get_list', [
    filters.fromDate,
    filters.toDate,
    filters.maNhanVien,
  ]);
  const resultSets = getResultSets(rows);
  return (resultSets[0] || []).map(mapInvoiceRow);
}

async function getOrderDetail(maHoaDon) {
  const rows = await callProcedure('sp_order_get_detail', [maHoaDon]);
  const resultSets = getResultSets(rows);

  return {
    hoaDon: mapInvoiceRow(resultSets[0]?.[0]),
    chiTiet: (resultSets[1] || []).map(mapOrderDetailRow),
  };
}

module.exports = {
  createOrder,
  validateOrderReferences,
  listOrders,
  getOrderDetail,
};
