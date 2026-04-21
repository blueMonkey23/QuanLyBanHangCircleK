const { getPool } = require('./pool');
const {
  toNumberOrNull,
  toBooleanFlag,
  mapMessageRow,
} = require('circlek-core');

function getResultSets(rows) {
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows.filter(Array.isArray);
}

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

async function callProcedure(name, params) {
  const pool = getPool();
  const placeholders = params.map(() => '?').join(', ');
  const sql = `CALL ${name}(${placeholders})`;
  const [rows] = await pool.query(sql, params);
  return rows;
}

async function getProducts(filters) {
  const rows = await callProcedure('sp_product_get_list', [
    filters.maDanhMuc,
    filters.isDeleted,
  ]);
  const resultSets = getResultSets(rows);
  return (resultSets[0] || []).map(mapProductRow);
}

async function getProductById(maSanPham) {
  const rows = await callProcedure('sp_product_get_by_id', [maSanPham]);
  const resultSets = getResultSets(rows);
  return mapProductRow(resultSets[0]?.[0]) || null;
}

async function createProduct(data) {
  const rows = await callProcedure('sp_product_create', [
    data.tenSanPham,
    data.gia,
    data.soLuong,
    data.maDanhMuc,
    data.maNCC,
  ]);
  const resultSets = getResultSets(rows);
  return mapProductRow(resultSets[0]?.[0]) || null;
}

async function updateProduct(maSanPham, data) {
  const rows = await callProcedure('sp_product_update', [
    maSanPham,
    data.tenSanPham,
    data.gia,
    data.soLuong,
    data.maDanhMuc,
    data.maNCC,
  ]);
  const resultSets = getResultSets(rows);
  return mapMessageRow(resultSets[0]?.[0], 'Updated');
}

async function softDeleteProduct(maSanPham) {
  const rows = await callProcedure('sp_product_soft_delete', [maSanPham]);
  const resultSets = getResultSets(rows);
  return mapMessageRow(resultSets[0]?.[0], 'Deleted');
}

async function listCategories(isDeleted) {
  const rows = await callProcedure('sp_category_list', [isDeleted]);
  const resultSets = getResultSets(rows);
  return (resultSets[0] || []).map(mapCategoryRow);
}

async function listSuppliers(isDeleted) {
  const rows = await callProcedure('sp_supplier_list', [isDeleted]);
  const resultSets = getResultSets(rows);
  return (resultSets[0] || []).map(mapSupplierRow);
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
