const { AppError } = require('circlek-core');
const repository = require('../db/SystemSettingsDataAccess');

function parseRequiredText(value, field) {
  const parsed = String(value || '').trim();
  if (!parsed) {
    throw new AppError('VALIDATION_ERROR', `${field} is required`, 400);
  }

  return parsed;
}

function parseVatPercent(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) {
    throw new AppError('VALIDATION_ERROR', 'vatPercent must be between 0 and 100', 400);
  }

  return parsed;
}

async function getSystemSettings(req, res, next) {
  try {
    const settings = await repository.getSystemSettings();

    if (!settings) {
      throw new AppError('NOT_FOUND', 'System settings not found', 404);
    }

    res.json(settings);
  } catch (error) {
    next(error);
  }
}

async function updateSystemSettings(req, res, next) {
  try {
    const settings = await repository.updateSystemSettings({
      tenCuaHang: parseRequiredText(req.body.tenCuaHang, 'tenCuaHang'),
      diaChi: parseRequiredText(req.body.diaChi, 'diaChi'),
      soDienThoai: parseRequiredText(req.body.soDienThoai, 'soDienThoai'),
      email: parseRequiredText(req.body.email, 'email'),
      noiDungHoaDon: parseRequiredText(req.body.noiDungHoaDon, 'noiDungHoaDon'),
      vatPercent: parseVatPercent(req.body.vatPercent),
      logo: parseRequiredText(req.body.logo, 'logo'),
    });

    res.json(settings);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getSystemSettings,
  updateSystemSettings,
};
