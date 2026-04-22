const { AppError } = require('circlek-core');
const repository = require('../db/ProductDataAccess');

function parseRequiredInt(value, field) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new AppError('VALIDATION_ERROR', `${field} must be a positive integer`, 400);
  }

  return parsed;
}

function parseRequiredText(value, field) {
  const parsed = String(value || '').trim();
  if (!parsed) {
    throw new AppError('VALIDATION_ERROR', `${field} is required`, 400);
  }

  return parsed;
}

function normalizeItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new AppError('VALIDATION_ERROR', 'items must be a non-empty array', 400);
  }

  const seen = new Set();
  return items.map((item, index) => {
    if (!item || typeof item !== 'object') {
      throw new AppError('VALIDATION_ERROR', `items[${index}] must be an object`, 400);
    }

    const maSanPham = parseRequiredInt(item.maSanPham, `items[${index}].maSanPham`);
    const soLuong = parseRequiredInt(item.soLuong, `items[${index}].soLuong`);

    if (seen.has(maSanPham)) {
      throw new AppError('VALIDATION_ERROR', 'Duplicate maSanPham is not allowed', 400);
    }

    seen.add(maSanPham);

    return {
      maSanPham,
      soLuong,
    };
  });
}

function parseProductIds(value) {
  const raw = String(value || '').trim();
  if (!raw) {
    throw new AppError('VALIDATION_ERROR', 'ids is required', 400);
  }

  const ids = raw
    .split(',')
    .map((part) => parseRequiredInt(part.trim(), 'ids'))
    .filter((value, index, array) => array.indexOf(value) === index);

  if (ids.length === 0) {
    throw new AppError('VALIDATION_ERROR', 'ids must contain at least one product id', 400);
  }

  return ids;
}

function normalizeDatabaseError(error) {
  if (error instanceof AppError) {
    return error;
  }

  if (error && error.code === 'ER_NO_REFERENCED_ROW_2') {
    return new AppError('VALIDATION_ERROR', 'Referenced record does not exist', 400);
  }

  if (error && error.code === 'ER_DUP_ENTRY') {
    return new AppError('CONFLICT', 'Duplicate orderRequestId', 409);
  }

  if (error && error.sqlState === '45000' && error.message === 'INSUFFICIENT_STOCK') {
    return new AppError('VALIDATION_ERROR', 'Insufficient stock', 400);
  }

  if (error && error.sqlState === '45000' && error.message.startsWith('PRODUCT_NOT_FOUND')) {
    return new AppError('NOT_FOUND', 'One or more products do not exist', 404);
  }

  if (error && error.sqlState === '45000' && error.message === 'RESERVATION_NOT_FOUND') {
    return new AppError('NOT_FOUND', 'Reservation not found', 404);
  }

  if (error && error.sqlState === '45000' && error.message === 'INVALID_RESERVATION_STATE') {
    return new AppError('CONFLICT', 'Reservation is not in a valid state for this action', 409);
  }

  return error;
}

async function getProductSnapshots(req, res, next) {
  try {
    const snapshots = await repository.getProductSnapshots(parseProductIds(req.query.ids));
    res.json(snapshots);
  } catch (error) {
    next(normalizeDatabaseError(error));
  }
}

async function createReservation(req, res, next) {
  try {
    const result = await repository.createReservation({
      orderRequestId: parseRequiredText(req.body.orderRequestId, 'orderRequestId'),
      items: normalizeItems(req.body.items),
    });
    res.status(201).json(result);
  } catch (error) {
    next(normalizeDatabaseError(error));
  }
}

async function confirmReservation(req, res, next) {
  try {
    const result = await repository.confirmReservation(
      parseRequiredInt(req.params.reservationId, 'reservationId'),
      parseRequiredInt(req.body.orderId, 'orderId'),
    );
    res.json(result);
  } catch (error) {
    next(normalizeDatabaseError(error));
  }
}

async function releaseReservation(req, res, next) {
  try {
    const reason = String(req.body.reason || '').trim() || 'Released by order-service';
    const result = await repository.releaseReservation(
      parseRequiredInt(req.params.reservationId, 'reservationId'),
      reason,
    );
    res.json(result);
  } catch (error) {
    next(normalizeDatabaseError(error));
  }
}

module.exports = {
  getProductSnapshots,
  createReservation,
  confirmReservation,
  releaseReservation,
};
