const { AppError } = require('circlek-core');
const repository = require('../db/CustomerDataAccess');

function parseRequiredInt(value, field) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new AppError('VALIDATION_ERROR', `${field} must be a positive integer`, 400);
  }

  return parsed;
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

function parseRequiredText(value, field) {
  const parsed = String(value || '').trim();
  if (!parsed) {
    throw new AppError('VALIDATION_ERROR', `${field} is required`, 400);
  }

  return parsed;
}

function parseOptionalText(value) {
  const parsed = String(value || '').trim();
  return parsed || null;
}

function parsePoints(value) {
  const parsed = Number(value ?? 0);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new AppError('VALIDATION_ERROR', 'diemTichLuy must be a non-negative integer', 400);
  }

  return parsed;
}

function normalizeDatabaseError(error) {
  if (error instanceof AppError) {
    return error;
  }

  if (error && error.code === 'ER_DUP_ENTRY') {
    return new AppError('CONFLICT', 'Customer code or phone number already exists', 409);
  }

  return error;
}

async function listCustomers(req, res, next) {
  try {
    const customers = await repository.listCustomers({
      search: parseOptionalText(req.query.search),
      isDeleted: parseOptionalBit(req.query.isDeleted),
    });

    res.json(customers);
  } catch (error) {
    next(normalizeDatabaseError(error));
  }
}

async function createCustomer(req, res, next) {
  try {
    const customer = await repository.createCustomer({
      maKhachHangCode: parseOptionalText(req.body.maKhachHangCode),
      tenKhachHang: parseRequiredText(req.body.tenKhachHang, 'tenKhachHang'),
      soDienThoai: parseRequiredText(req.body.soDienThoai, 'soDienThoai'),
      diaChi: parseOptionalText(req.body.diaChi),
      diemTichLuy: parsePoints(req.body.diemTichLuy),
    });

    res.status(201).json(customer);
  } catch (error) {
    next(normalizeDatabaseError(error));
  }
}

async function updateCustomer(req, res, next) {
  try {
    const maKhachHang = parseRequiredInt(req.params.maKhachHang, 'maKhachHang');
    const customer = await repository.updateCustomer(maKhachHang, {
      maKhachHangCode: parseOptionalText(req.body.maKhachHangCode),
      tenKhachHang: parseRequiredText(req.body.tenKhachHang, 'tenKhachHang'),
      soDienThoai: parseRequiredText(req.body.soDienThoai, 'soDienThoai'),
      diaChi: parseOptionalText(req.body.diaChi),
      diemTichLuy: parsePoints(req.body.diemTichLuy),
    });

    if (!customer) {
      throw new AppError('NOT_FOUND', 'Customer not found', 404);
    }

    res.json(customer);
  } catch (error) {
    next(normalizeDatabaseError(error));
  }
}

async function deleteCustomer(req, res, next) {
  try {
    const maKhachHang = parseRequiredInt(req.params.maKhachHang, 'maKhachHang');
    const result = await repository.softDeleteCustomer(maKhachHang);

    if (!result) {
      throw new AppError('NOT_FOUND', 'Customer not found', 404);
    }

    res.json(result);
  } catch (error) {
    next(normalizeDatabaseError(error));
  }
}

module.exports = {
  listCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};
