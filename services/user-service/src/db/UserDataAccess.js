const { getPool } = require('./pool');
const {
  toNumberOrNull,
  toBooleanFlag,
  mapMessageRow,
} = require('circlek-core');

function createSqlStateError(message) {
  const error = new Error(message);
  error.sqlState = '45000';
  error.message = message;
  return error;
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
    maVaiTro: toNumberOrNull(row.MaVaiTro),
    isDeleted: toBooleanFlag(row.IsDeleted),
    maNhanVien: toNumberOrNull(row.MaNhanVien),
    hoTen: row.HoTen,
    dienThoai: row.DienThoai,
    tenVaiTro: row.TenVaiTro,
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

function mapStaffSnapshotRow(row) {
  if (!row) {
    return null;
  }

  return {
    maNhanVien: toNumberOrNull(row.MaNhanVien),
    hoTen: row.HoTen,
    dienThoai: row.DienThoai,
    username: row.Username || null,
  };
}

function mapAuthProfile(row, permissions) {
  if (!row) {
    return null;
  }

  return {
    maTaiKhoan: toNumberOrNull(row.MaTaiKhoan),
    username: row.Username,
    maVaiTro: toNumberOrNull(row.MaVaiTro),
    tenVaiTro: row.TenVaiTro,
    maNhanVien: toNumberOrNull(row.MaNhanVien),
    hoTen: row.HoTen,
    dienThoai: row.DienThoai,
    permissions,
  };
}

async function getPermissionsForRole(maVaiTro, executor = getPool()) {
  const [rows] = await executor.query(
    `SELECT q.MaQuyen, q.TenQuyen
     FROM VaiTro_Quyen vq
     JOIN Quyen q ON q.MaQuyen = vq.MaQuyen
     WHERE vq.MaVaiTro = ?
     ORDER BY q.TenQuyen ASC`,
    [maVaiTro],
  );

  return rows.map(mapPermissionRow);
}

async function createAccount(data) {
  const pool = getPool();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [accountResult] = await connection.query(
      'INSERT INTO TaiKhoan (Username, Password, MaVaiTro, IsDeleted) VALUES (?, ?, ?, 0)',
      [data.username, data.password, data.maVaiTro],
    );

    const maTaiKhoan = accountResult.insertId;

    const [employeeResult] = await connection.query(
      'INSERT INTO NhanVien (HoTen, DienThoai, MaTaiKhoan, IsDeleted) VALUES (?, ?, ?, 0)',
      [data.hoTen, data.dienThoai, maTaiKhoan],
    );

    await connection.commit();

    return mapCreateAccountRow({
      maTaiKhoan,
      maNhanVien: employeeResult.insertId,
      message: 'Created',
    });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function updateAccount(maTaiKhoan, data) {
  const pool = getPool();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [accountResult] = await connection.query(
      'UPDATE TaiKhoan SET MaVaiTro = ? WHERE MaTaiKhoan = ? AND IsDeleted = 0',
      [data.maVaiTro, maTaiKhoan],
    );

    if (!accountResult.affectedRows) {
      throw createSqlStateError('ACCOUNT_NOT_FOUND');
    }

    const [employeeResult] = await connection.query(
      'UPDATE NhanVien SET HoTen = ?, DienThoai = ? WHERE MaTaiKhoan = ? AND IsDeleted = 0',
      [data.hoTen, data.dienThoai, maTaiKhoan],
    );

    if (!employeeResult.affectedRows) {
      throw createSqlStateError('ACCOUNT_NOT_FOUND');
    }

    await connection.commit();
    return mapMessageRow(null, 'Updated');
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function changePassword(maTaiKhoan, data) {
  const pool = getPool();
  const [rows] = await pool.query(
    'SELECT Password FROM TaiKhoan WHERE MaTaiKhoan = ? AND IsDeleted = 0 LIMIT 1',
    [maTaiKhoan],
  );

  if (rows.length === 0) {
    throw createSqlStateError('ACCOUNT_NOT_FOUND');
  }

  if (rows[0].Password !== data.oldPassword) {
    throw createSqlStateError('INVALID_PASSWORD');
  }

  await pool.query(
    'UPDATE TaiKhoan SET Password = ? WHERE MaTaiKhoan = ? AND IsDeleted = 0',
    [data.newPassword, maTaiKhoan],
  );

  return mapMessageRow(null, 'Password changed');
}

async function softDeleteAccount(maTaiKhoan) {
  const pool = getPool();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [accountResult] = await connection.query(
      'UPDATE TaiKhoan SET IsDeleted = 1 WHERE MaTaiKhoan = ?',
      [maTaiKhoan],
    );

    if (!accountResult.affectedRows) {
      throw createSqlStateError('ACCOUNT_NOT_FOUND');
    }

    const [employeeResult] = await connection.query(
      'UPDATE NhanVien SET IsDeleted = 1 WHERE MaTaiKhoan = ?',
      [maTaiKhoan],
    );

    if (!employeeResult.affectedRows) {
      throw createSqlStateError('ACCOUNT_NOT_FOUND');
    }

    await connection.commit();
    return mapMessageRow(null, 'Deleted');
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function listAccounts(filters) {
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT tk.MaTaiKhoan, tk.Username, tk.Password, tk.MaVaiTro, tk.IsDeleted,
            nv.MaNhanVien, nv.HoTen, nv.DienThoai, nv.MaTaiKhoan AS NhanVien_MaTaiKhoan,
            nv.IsDeleted AS NhanVien_IsDeleted,
            vt.TenVaiTro
     FROM TaiKhoan tk
     JOIN NhanVien nv ON nv.MaTaiKhoan = tk.MaTaiKhoan
     JOIN VaiTro vt ON vt.MaVaiTro = tk.MaVaiTro
     WHERE (? IS NULL OR tk.MaVaiTro = ?)
       AND (? IS NULL OR tk.IsDeleted = ?)
     ORDER BY tk.MaTaiKhoan DESC`,
    [
      filters.maVaiTro,
      filters.maVaiTro,
      filters.isDeleted,
      filters.isDeleted,
    ],
  );
  return rows.map(mapAccountRow);
}

async function getAccountById(maTaiKhoan) {
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT tk.MaTaiKhoan, tk.Username, tk.Password, tk.MaVaiTro, tk.IsDeleted,
            nv.MaNhanVien, nv.HoTen, nv.DienThoai, nv.MaTaiKhoan AS NhanVien_MaTaiKhoan,
            nv.IsDeleted AS NhanVien_IsDeleted,
            vt.TenVaiTro
     FROM TaiKhoan tk
     JOIN NhanVien nv ON nv.MaTaiKhoan = tk.MaTaiKhoan
     JOIN VaiTro vt ON vt.MaVaiTro = tk.MaVaiTro
     WHERE tk.MaTaiKhoan = ?
       AND tk.IsDeleted = 0
       AND nv.IsDeleted = 0
     LIMIT 1`,
    [maTaiKhoan],
  );
  return mapAccountRow(rows[0]) || null;
}

async function findAccountForLogin(username) {
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT tk.MaTaiKhoan, tk.Username, tk.Password, tk.MaVaiTro,
            nv.MaNhanVien, nv.HoTen, nv.DienThoai,
            vt.TenVaiTro
     FROM TaiKhoan tk
     JOIN NhanVien nv ON nv.MaTaiKhoan = tk.MaTaiKhoan
     JOIN VaiTro vt ON vt.MaVaiTro = tk.MaVaiTro
     WHERE tk.Username = ?
       AND tk.IsDeleted = 0
       AND nv.IsDeleted = 0
     LIMIT 1`,
    [username],
  );

  if (rows.length === 0) {
    return null;
  }

  const row = rows[0];
  const permissions = await getPermissionsForRole(row.MaVaiTro, pool);

  return {
    ...mapAuthProfile(row, permissions),
    passwordHash: row.Password,
  };
}

async function getAuthProfileById(maTaiKhoan) {
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT tk.MaTaiKhoan, tk.Username, tk.MaVaiTro,
            nv.MaNhanVien, nv.HoTen, nv.DienThoai,
            vt.TenVaiTro
     FROM TaiKhoan tk
     JOIN NhanVien nv ON nv.MaTaiKhoan = tk.MaTaiKhoan
     JOIN VaiTro vt ON vt.MaVaiTro = tk.MaVaiTro
     WHERE tk.MaTaiKhoan = ?
       AND tk.IsDeleted = 0
       AND nv.IsDeleted = 0
     LIMIT 1`,
    [maTaiKhoan],
  );

  if (rows.length === 0) {
    return null;
  }

  const row = rows[0];
  const permissions = await getPermissionsForRole(row.MaVaiTro, pool);

  return mapAuthProfile(row, permissions);
}

async function listRoles() {
  const pool = getPool();
  const [rows] = await pool.query('SELECT * FROM VaiTro ORDER BY MaVaiTro ASC');
  return rows.map(mapRoleRow);
}

async function listPermissions() {
  const pool = getPool();
  const [rows] = await pool.query('SELECT * FROM Quyen ORDER BY MaQuyen ASC');
  return rows.map(mapPermissionRow);
}

async function getStaffSnapshot(maNhanVien) {
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT nv.MaNhanVien, nv.HoTen, nv.DienThoai, tk.Username
     FROM NhanVien nv
     JOIN TaiKhoan tk ON tk.MaTaiKhoan = nv.MaTaiKhoan
     WHERE nv.MaNhanVien = ?
       AND nv.IsDeleted = 0
       AND tk.IsDeleted = 0
     LIMIT 1`,
    [maNhanVien],
  );

  return mapStaffSnapshotRow(rows[0]) || null;
}

module.exports = {
  createAccount,
  updateAccount,
  changePassword,
  softDeleteAccount,
  listAccounts,
  getAccountById,
  findAccountForLogin,
  getAuthProfileById,
  listRoles,
  listPermissions,
  getStaffSnapshot,
};
