const { createHash } = require('crypto');
const { AppError } = require('circlek-core');
const repository = require('../db/userRepository');

function parseRequiredInt(value, field) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new AppError('VALIDATION_ERROR', `${field} must be a positive integer`, 400);
  }

  return parsed;
}

function parseOptionalInt(value, field) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  return parseRequiredInt(value, field);
}

function parseOptionalBit(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  if (value === '0' || value === 0 || value === false || value === 'false') {
    return 0;
  }

  if (value === '1' || value === 1 || value === true || value === 'true') {
    return 1;
  }

  throw new AppError('VALIDATION_ERROR', 'isDeleted must be 0 or 1', 400);
}

function requireBodyFields(body, fields) {
  for (const field of fields) {
    if (body[field] === undefined || body[field] === null || body[field] === '') {
      throw new AppError('VALIDATION_ERROR', `${field} is required`, 400);
    }
  }
}

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

  if (error && error.code === 'ER_DUP_ENTRY') {
    return new AppError('CONFLICT', 'Username already exists', 409, [
      { field: 'username', reason: 'DUPLICATE' },
    ]);
  }

  if (error && error.code === 'ER_NO_REFERENCED_ROW_2') {
    return new AppError('VALIDATION_ERROR', 'Referenced record does not exist', 400);
  }

  if (error && error.sqlState === '45000' && error.message === 'ACCOUNT_NOT_FOUND') {
    return new AppError('NOT_FOUND', 'Account not found', 404);
  }

  if (error && error.sqlState === '45000' && error.message === 'INVALID_PASSWORD') {
    return new AppError('VALIDATION_ERROR', 'Old password is incorrect', 400, [
      { field: 'oldPassword', reason: 'INVALID_PASSWORD' },
    ]);
  }

  return error;
}

async function listAccounts(req, res, next) {
  try {
    const maVaiTro = parseOptionalInt(req.query.maVaiTro, 'maVaiTro');
    const isDeleted = parseOptionalBit(req.query.isDeleted);
    const accounts = await repository.listAccounts({ maVaiTro, isDeleted });
    res.json(accounts);
  } catch (error) {
    next(normalizeDatabaseError(error));
  }
}

async function getAccountById(req, res, next) {
  try {
    const maTaiKhoan = parseRequiredInt(req.params.maTaiKhoan, 'maTaiKhoan');
    const account = await repository.getAccountById(maTaiKhoan);

    if (!account) {
      throw new AppError('NOT_FOUND', 'Account not found', 404);
    }

    res.json(account);
  } catch (error) {
    next(normalizeDatabaseError(error));
  }
}

async function createAccount(req, res, next) {
  try {
    requireBodyFields(req.body, ['username', 'password', 'maVaiTro', 'hoTen', 'dienThoai']);

    const data = {
      username: parseRequiredText(req.body.username, 'username'),
      password: hashPassword(parseRequiredText(req.body.password, 'password')),
      maVaiTro: parseRequiredInt(req.body.maVaiTro, 'maVaiTro'),
      hoTen: parseRequiredText(req.body.hoTen, 'hoTen'),
      dienThoai: parseRequiredText(req.body.dienThoai, 'dienThoai'),
    };

    const result = await repository.createAccount(data);
    res.status(201).json(result || { message: 'Created' });
  } catch (error) {
    next(normalizeDatabaseError(error));
  }
}

async function updateAccount(req, res, next) {
  try {
    requireBodyFields(req.body, ['maVaiTro', 'hoTen', 'dienThoai']);

    const maTaiKhoan = parseRequiredInt(req.params.maTaiKhoan, 'maTaiKhoan');
    const data = {
      maVaiTro: parseRequiredInt(req.body.maVaiTro, 'maVaiTro'),
      hoTen: parseRequiredText(req.body.hoTen, 'hoTen'),
      dienThoai: parseRequiredText(req.body.dienThoai, 'dienThoai'),
    };

    const result = await repository.updateAccount(maTaiKhoan, data);
    res.json(result);
  } catch (error) {
    next(normalizeDatabaseError(error));
  }
}

async function updatePassword(req, res, next) {
  try {
    requireBodyFields(req.body, ['oldPassword', 'newPassword']);

    const maTaiKhoan = parseRequiredInt(req.params.maTaiKhoan, 'maTaiKhoan');
    const data = {
      oldPassword: hashPassword(parseRequiredText(req.body.oldPassword, 'oldPassword')),
      newPassword: hashPassword(parseRequiredText(req.body.newPassword, 'newPassword')),
    };

    const result = await repository.changePassword(maTaiKhoan, data);
    res.json(result);
  } catch (error) {
    next(normalizeDatabaseError(error));
  }
}

async function deleteAccount(req, res, next) {
  try {
    const maTaiKhoan = parseRequiredInt(req.params.maTaiKhoan, 'maTaiKhoan');
    const result = await repository.softDeleteAccount(maTaiKhoan);
    res.json(result);
  } catch (error) {
    next(normalizeDatabaseError(error));
  }
}

async function listRoles(req, res, next) {
  try {
    const roles = await repository.listRoles();
    res.json(roles);
  } catch (error) {
    next(normalizeDatabaseError(error));
  }
}

async function listPermissions(req, res, next) {
  try {
    const permissions = await repository.listPermissions();
    res.json(permissions);
  } catch (error) {
    next(normalizeDatabaseError(error));
  }
}

module.exports = {
  listAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  updatePassword,
  deleteAccount,
  listRoles,
  listPermissions,
};
