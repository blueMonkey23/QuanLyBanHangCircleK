const { getPool } = require('./pool');

function firstResult(rows) {
  if (Array.isArray(rows) && Array.isArray(rows[0])) {
    return rows[0];
  }

  return rows;
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
  return firstResult(rows);
}

async function getProductById(maSanPham) {
  const rows = await callProcedure('sp_product_get_by_id', [maSanPham]);
  const result = firstResult(rows);
  return result[0] || null;
}

async function createProduct(data) {
  const rows = await callProcedure('sp_product_create', [
    data.tenSanPham,
    data.gia,
    data.soLuong,
    data.maDanhMuc,
    data.maNCC,
  ]);
  const result = firstResult(rows);
  return result[0] || null;
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
  const result = firstResult(rows);
  return result[0] || { message: 'Updated' };
}

async function softDeleteProduct(maSanPham) {
  const rows = await callProcedure('sp_product_soft_delete', [maSanPham]);
  const result = firstResult(rows);
  return result[0] || { message: 'Deleted' };
}

async function listCategories(isDeleted) {
  const rows = await callProcedure('sp_category_list', [isDeleted]);
  return firstResult(rows);
}

async function listSuppliers(isDeleted) {
  const rows = await callProcedure('sp_supplier_list', [isDeleted]);
  return firstResult(rows);
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
