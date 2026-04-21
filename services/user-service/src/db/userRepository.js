const { getPool } = require('./pool');

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

async function createAccount(data) {
  const rows = await callProcedure('sp_user_create_account', [
    data.username,
    data.password,
    data.maVaiTro,
    data.hoTen,
    data.dienThoai,
  ]);
  const resultSets = getResultSets(rows);
  return resultSets[0]?.[0] || null;
}

async function updateAccount(maTaiKhoan, data) {
  const rows = await callProcedure('sp_user_update_account', [
    maTaiKhoan,
    data.maVaiTro,
    data.hoTen,
    data.dienThoai,
  ]);
  const resultSets = getResultSets(rows);
  return resultSets[0]?.[0] || { message: 'Updated' };
}

async function changePassword(maTaiKhoan, data) {
  const rows = await callProcedure('sp_user_change_password', [
    maTaiKhoan,
    data.oldPassword,
    data.newPassword,
  ]);
  const resultSets = getResultSets(rows);
  return resultSets[0]?.[0] || { message: 'Password changed' };
}

async function softDeleteAccount(maTaiKhoan) {
  const rows = await callProcedure('sp_user_soft_delete_account', [maTaiKhoan]);
  const resultSets = getResultSets(rows);
  return resultSets[0]?.[0] || { message: 'Deleted' };
}

async function listAccounts(filters) {
  const rows = await callProcedure('sp_user_get_accounts', [
    filters.maVaiTro,
    filters.isDeleted,
  ]);
  const resultSets = getResultSets(rows);
  return resultSets[0] || [];
}

async function listRoles() {
  const rows = await callProcedure('sp_user_list_roles', []);
  const resultSets = getResultSets(rows);
  return resultSets[0] || [];
}

async function listPermissions() {
  const rows = await callProcedure('sp_user_list_permissions', []);
  const resultSets = getResultSets(rows);
  return resultSets[0] || [];
}

module.exports = {
  createAccount,
  updateAccount,
  changePassword,
  softDeleteAccount,
  listAccounts,
  listRoles,
  listPermissions,
};
