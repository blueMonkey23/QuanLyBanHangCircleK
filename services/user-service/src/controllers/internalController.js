const { AppError } = require('circlek-core');
const userRepository = require('../db/UserDataAccess');
const customerRepository = require('../db/CustomerDataAccess');

function parseRequiredInt(value, field) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new AppError('VALIDATION_ERROR', `${field} must be a positive integer`, 400);
  }

  return parsed;
}

async function getStaffSnapshot(req, res, next) {
  try {
    const maNhanVien = parseRequiredInt(req.params.maNhanVien, 'maNhanVien');
    const snapshot = await userRepository.getStaffSnapshot(maNhanVien);

    if (!snapshot) {
      throw new AppError('NOT_FOUND', 'Staff not found', 404);
    }

    res.json(snapshot);
  } catch (error) {
    next(error);
  }
}

async function getCustomerSnapshot(req, res, next) {
  try {
    const maKhachHang = parseRequiredInt(req.params.maKhachHang, 'maKhachHang');
    const snapshot = await customerRepository.getCustomerSnapshot(maKhachHang);

    if (!snapshot) {
      throw new AppError('NOT_FOUND', 'Customer not found', 404);
    }

    res.json(snapshot);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getStaffSnapshot,
  getCustomerSnapshot,
};
