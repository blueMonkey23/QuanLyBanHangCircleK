const { getPool } = require('./pool');
const { toNumberOrNull, toBooleanFlag, mapMessageRow } = require('circlek-core');

function mapCustomerRow(row) {
  if (!row) {
    return null;
  }

  return {
    maKhachHang: toNumberOrNull(row.MaKhachHang),
    maKhachHangCode: row.MaKhachHangCode,
    tenKhachHang: row.TenKhachHang,
    soDienThoai: row.SoDienThoai,
    diaChi: row.DiaChi,
    diemTichLuy: toNumberOrNull(row.DiemTichLuy) || 0,
    isDeleted: toBooleanFlag(row.IsDeleted),
  };
}

function createCustomerCode(id) {
  return `KH${String(id).padStart(3, '0')}`;
}

function mapCustomerSnapshotRow(row) {
  if (!row) {
    return null;
  }

  return {
    maKhachHang: toNumberOrNull(row.MaKhachHang),
    tenKhachHang: row.TenKhachHang,
    soDienThoai: row.SoDienThoai,
  };
}

async function listCustomers(filters) {
  const pool = getPool();
  const keyword = filters.search ? `%${filters.search}%` : null;
  const [rows] = await pool.query(
    `SELECT *
     FROM KhachHang
     WHERE (? IS NULL OR IsDeleted = ?)
       AND (
         ? IS NULL
         OR TenKhachHang LIKE ?
         OR SoDienThoai LIKE ?
         OR MaKhachHangCode LIKE ?
       )
     ORDER BY MaKhachHang DESC`,
    [
      filters.isDeleted,
      filters.isDeleted,
      keyword,
      keyword,
      keyword,
      keyword,
    ],
  );

  return rows.map(mapCustomerRow);
}

async function createCustomer(data) {
  const pool = getPool();
  const [result] = await pool.query(
    `INSERT INTO KhachHang
      (MaKhachHangCode, TenKhachHang, SoDienThoai, DiaChi, DiemTichLuy, IsDeleted)
     VALUES (?, ?, ?, ?, ?, 0)`,
    [
      data.maKhachHangCode || null,
      data.tenKhachHang,
      data.soDienThoai,
      data.diaChi || null,
      data.diemTichLuy,
    ],
  );

  const maKhachHang = result.insertId;
  if (!data.maKhachHangCode) {
    await pool.query(
      'UPDATE KhachHang SET MaKhachHangCode = ? WHERE MaKhachHang = ?',
      [createCustomerCode(maKhachHang), maKhachHang],
    );
  }

  const [rows] = await pool.query(
    'SELECT * FROM KhachHang WHERE MaKhachHang = ? LIMIT 1',
    [maKhachHang],
  );

  return mapCustomerRow(rows[0]) || null;
}

async function updateCustomer(maKhachHang, data) {
  const pool = getPool();
  const [result] = await pool.query(
    `UPDATE KhachHang
     SET MaKhachHangCode = ?,
         TenKhachHang = ?,
         SoDienThoai = ?,
         DiaChi = ?,
         DiemTichLuy = ?
     WHERE MaKhachHang = ?
       AND IsDeleted = 0`,
    [
      data.maKhachHangCode || createCustomerCode(maKhachHang),
      data.tenKhachHang,
      data.soDienThoai,
      data.diaChi || null,
      data.diemTichLuy,
      maKhachHang,
    ],
  );

  if (!result.affectedRows) {
    return null;
  }

  const [rows] = await pool.query(
    'SELECT * FROM KhachHang WHERE MaKhachHang = ? LIMIT 1',
    [maKhachHang],
  );

  return mapCustomerRow(rows[0]) || null;
}

async function softDeleteCustomer(maKhachHang) {
  const pool = getPool();
  const [result] = await pool.query(
    'UPDATE KhachHang SET IsDeleted = 1 WHERE MaKhachHang = ? AND IsDeleted = 0',
    [maKhachHang],
  );

  if (!result.affectedRows) {
    return null;
  }

  return mapMessageRow(null, 'Deleted');
}

async function getCustomerSnapshot(maKhachHang) {
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT MaKhachHang, TenKhachHang, SoDienThoai
     FROM KhachHang
     WHERE MaKhachHang = ?
       AND IsDeleted = 0
     LIMIT 1`,
    [maKhachHang],
  );

  return mapCustomerSnapshotRow(rows[0]) || null;
}

module.exports = {
  listCustomers,
  createCustomer,
  updateCustomer,
  softDeleteCustomer,
  getCustomerSnapshot,
};
