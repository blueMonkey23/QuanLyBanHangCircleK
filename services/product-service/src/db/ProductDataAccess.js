const { getPool } = require('./pool');
const {
  toNumberOrNull,
  toBooleanFlag,
  mapMessageRow,
} = require('circlek-core');

function mapProductRow(row) {
  if (!row) {
    return null;
  }

  return {
    maSanPham: toNumberOrNull(row.MaSanPham),
    tenSanPham: row.TenSanPham,
    gia: toNumberOrNull(row.Gia),
    soLuong: toNumberOrNull(row.SoLuong),
    maDanhMuc: toNumberOrNull(row.MaDanhMuc),
    maNCC: toNumberOrNull(row.MaNCC),
    isDeleted: toBooleanFlag(row.IsDeleted),
  };
}

function mapCategoryRow(row) {
  if (!row) {
    return null;
  }

  return {
    maDanhMuc: toNumberOrNull(row.MaDanhMuc),
    tenDanhMuc: row.TenDanhMuc,
    isDeleted: toBooleanFlag(row.IsDeleted),
  };
}

function mapSupplierRow(row) {
  if (!row) {
    return null;
  }

  return {
    maNCC: toNumberOrNull(row.MaNCC),
    tenCongTy: row.TenCongTy,
    dienThoai: row.DienThoai,
    isDeleted: toBooleanFlag(row.IsDeleted),
  };
}

async function getProducts(filters) {
  const pool = getPool();
  const [rows] = await pool.query(
    'SELECT * FROM SanPham WHERE (? IS NULL OR MaDanhMuc = ?) AND (? IS NULL OR IsDeleted = ?)',
    [
      filters.maDanhMuc,
      filters.maDanhMuc,
      filters.isDeleted,
      filters.isDeleted,
    ]
  );
  return rows.map(mapProductRow);
}

async function getProductById(maSanPham) {
  const pool = getPool();
  const [rows] = await pool.query(
    'SELECT * FROM SanPham WHERE MaSanPham = ? AND IsDeleted = 0 LIMIT 1',
    [maSanPham]
  );
  return mapProductRow(rows[0]) || null;
}

async function createProduct(data) {
  const pool = getPool();
  const [result] = await pool.query(
    'INSERT INTO SanPham (TenSanPham, Gia, SoLuong, MaDanhMuc, MaNCC, IsDeleted) VALUES (?, ?, ?, ?, ?, 0)',
    [
      data.tenSanPham,
      data.gia,
      data.soLuong,
      data.maDanhMuc,
      data.maNCC,
    ]
  );
  const [rows] = await pool.query(
    'SELECT * FROM SanPham WHERE MaSanPham = ? LIMIT 1',
    [result.insertId]
  );
  return mapProductRow(rows[0]) || null;
}

async function updateProduct(maSanPham, data) {
  const pool = getPool();
  const [result] = await pool.query(
    'UPDATE SanPham SET TenSanPham = ?, Gia = ?, SoLuong = ?, MaDanhMuc = ?, MaNCC = ? WHERE MaSanPham = ? AND IsDeleted = 0',
    [
      data.tenSanPham,
      data.gia,
      data.soLuong,
      data.maDanhMuc,
      data.maNCC,
      maSanPham,
    ]
  );
  if (!result.affectedRows) {
    return null;
  }
  return mapMessageRow(result, 'Updated');
}

async function softDeleteProduct(maSanPham) {
  const pool = getPool();
  const [result] = await pool.query(
    'UPDATE SanPham SET IsDeleted = 1 WHERE MaSanPham = ? AND IsDeleted = 0',
    [maSanPham]
  );
  if (!result.affectedRows) {
    return null;
  }
  return mapMessageRow(result, 'Deleted');
}

async function listCategories(isDeleted) {
  const pool = getPool();
  const [rows] = await pool.query(
    'SELECT * FROM DanhMucSanPham WHERE (? IS NULL OR IsDeleted = ?)',
    [isDeleted, isDeleted]
  );
  return rows.map(mapCategoryRow);
}

async function listSuppliers(isDeleted) {
  const pool = getPool();
  const [rows] = await pool.query(
    'SELECT * FROM NhaCungCap WHERE (? IS NULL OR IsDeleted = ?)',
    [isDeleted, isDeleted]
  );
  return rows.map(mapSupplierRow);
}

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  softDeleteProduct,
  listCategories,
  listSuppliers,
};
