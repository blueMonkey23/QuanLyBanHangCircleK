const { createHash } = require('crypto');
const { AppError, signAuthToken, requireAuth } = require('circlek-core');
const repository = require('../db/UserDataAccess');

function parseRequiredText(value, field) {
  const parsed = String(value || '').trim();
  if (!parsed) {
    throw new AppError('VALIDATION_ERROR', `${field} is required`, 400);
  }

  return parsed;
}

function hashPassword(value) {
  return createHash('sha256').update(value).digest('hex');
}

function normalizeDatabaseError(error) {
  if (error instanceof AppError) {
    return error;
  }

  return error;
}

async function login(req, res, next) {
  try {
    const username = parseRequiredText(req.body.username, 'username');
    const password = parseRequiredText(req.body.password, 'password');
    const account = await repository.findAccountForLogin(username);

    if (!account || account.passwordHash !== hashPassword(password)) {
      throw new AppError('UNAUTHORIZED', 'Invalid username or password', 401);
    }

    const token = signAuthToken({
      maTaiKhoan: account.maTaiKhoan,
      maNhanVien: account.maNhanVien,
      username: account.username,
      hoTen: account.hoTen,
      maVaiTro: account.maVaiTro,
      tenVaiTro: account.tenVaiTro,
      permissions: account.permissions.map((permission) => permission.tenQuyen),
    });

    res.json({
      token,
      user: {
        maTaiKhoan: account.maTaiKhoan,
        maNhanVien: account.maNhanVien,
        username: account.username,
        hoTen: account.hoTen,
        dienThoai: account.dienThoai,
        maVaiTro: account.maVaiTro,
        tenVaiTro: account.tenVaiTro,
        permissions: account.permissions,
      },
    });
  } catch (error) {
    next(normalizeDatabaseError(error));
  }
}

async function me(req, res, next) {
  try {
    const profile = await repository.getAuthProfileById(req.auth.maTaiKhoan);

    if (!profile) {
      throw new AppError('NOT_FOUND', 'Account not found', 404);
    }

    res.json(profile);
  } catch (error) {
    next(normalizeDatabaseError(error));
  }
}

module.exports = {
  login,
  me,
  requireAuth,
};
