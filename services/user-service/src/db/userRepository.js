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

async function callProcedure(name, params) {
  const pool = getPool();
  const placeholders = params.map(() => '?').join(', ');
  const sql = `CALL ${name}(${placeholders})`;
  const [rows] = await pool.query(sql, params);
  return rows;
}

function mapCreateAccountRow(row) {
  if (!row) {
    return null;
  }

  return {
    maTaiKhoan: toNumberOrNull(row.maTaiKhoan ?? row.MaTaiKhoan),
    maNhanVien: toNumberOrNull(row.maNhanVien ?? row.MaNhanVien),
    message: row.message || row.Message || 'Created',
  };
}

function mapAccountRow(row) {
  if (!row) {
    return null;
  }

  return {
    maTaiKhoan: toNumberOrNull(row.MaTaiKhoan),
    username: row.Username,
    password: row.Password,
    maVaiTro: toNumberOrNull(row.MaVaiTro),
    isDeleted: toBooleanFlag(row.IsDeleted),
    maNhanVien: toNumberOrNull(row.MaNhanVien),
    hoTen: row.HoTen,
    dienThoai: row.DienThoai,
  };
}

function mapRoleRow(row) {
  if (!row) {
    return null;
  }

  return {
    maVaiTro: toNumberOrNull(row.MaVaiTro),
    tenVaiTro: row.TenVaiTro,
  };
}

function mapPermissionRow(row) {
  if (!row) {
    return null;
  }

  return {
    maQuyen: toNumberOrNull(row.MaQuyen),
    tenQuyen: row.TenQuyen,
  };
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
  return mapCreateAccountRow(resultSets[0]?.[0]) || null;
}

async function updateAccount(maTaiKhoan, data) {
  const rows = await callProcedure('sp_user_update_account', [
    maTaiKhoan,
    data.maVaiTro,
    data.hoTen,
    data.dienThoai,
  ]);
  const resultSets = getResultSets(rows);
  return mapMessageRow(resultSets[0]?.[0], 'Updated');
}

async function changePassword(maTaiKhoan, data) {
  const rows = await callProcedure('sp_user_change_password', [
    maTaiKhoan,
    data.oldPassword,
    data.newPassword,
  ]);
  const resultSets = getResultSets(rows);
  return mapMessageRow(resultSets[0]?.[0], 'Password changed');
}

async function softDeleteAccount(maTaiKhoan) {
  const rows = await callProcedure('sp_user_soft_delete_account', [maTaiKhoan]);
  const resultSets = getResultSets(rows);
  return mapMessageRow(resultSets[0]?.[0], 'Deleted');
}

async function listAccounts(filters) {
  const rows = await callProcedure('sp_user_get_accounts', [
    filters.maVaiTro,
    filters.isDeleted,
  ]);
  const resultSets = getResultSets(rows);
  return (resultSets[0] || []).map(mapAccountRow);
}

async function listRoles() {
  const rows = await callProcedure('sp_user_list_roles', []);
  const resultSets = getResultSets(rows);
  return (resultSets[0] || []).map(mapRoleRow);
}

async function listPermissions() {
  const rows = await callProcedure('sp_user_list_permissions', []);
  const resultSets = getResultSets(rows);
  return (resultSets[0] || []).map(mapPermissionRow);
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
