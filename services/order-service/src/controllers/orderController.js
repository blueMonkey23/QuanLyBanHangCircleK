const { AppError } = require('circlek-core');
const repository = require('../db/OrderDataAccess');

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

function parseRequiredText(value, field) {
  const parsed = String(value || '').trim();
  if (!parsed) {
    throw new AppError('VALIDATION_ERROR', `${field} is required`, 400);
  }

  return parsed;
}

function parseOptionalDateTime(value, field) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new AppError('VALIDATION_ERROR', `${field} must be a valid ISO-8601 date`, 400);
  }

  return parsed;
}

function normalizeItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new AppError('VALIDATION_ERROR', 'items must be a non-empty array', 400);
  }

  const seenProducts = new Set();

  return items.map((item, index) => {
    if (!item || typeof item !== 'object') {
      throw new AppError('VALIDATION_ERROR', 'Each item must be an object', 400, [
        { field: `items[${index}]`, reason: 'INVALID_ITEM' },
      ]);
    }

    const maSanPham = parseRequiredInt(item.maSanPham, `items[${index}].maSanPham`);
    const soLuong = parseRequiredInt(item.soLuong, `items[${index}].soLuong`);

    if (seenProducts.has(maSanPham)) {
      throw new AppError('VALIDATION_ERROR', 'Duplicate maSanPham is not allowed in items', 400, [
        { field: `items[${index}].maSanPham`, reason: 'DUPLICATE_PRODUCT' },
      ]);
    }

    seenProducts.add(maSanPham);

    return {
      maSanPham,
      soLuong,
    };
  });
}

function normalizeDatabaseError(error) {
  if (error instanceof AppError) {
    return error;
  }

  if (error && error.code === 'ER_NO_REFERENCED_ROW_2') {
    return new AppError('VALIDATION_ERROR', 'Referenced record does not exist', 400);
  }

  if (error && error.sqlState === '45000' && error.message === 'INSUFFICIENT_STOCK') {
    return new AppError('VALIDATION_ERROR', 'Insufficient stock', 400);
  }

  return error;
}

async function listOrders(req, res, next) {
  try {
    const filters = {
      fromDate: parseOptionalDateTime(req.query.fromDate, 'fromDate'),
      toDate: parseOptionalDateTime(req.query.toDate, 'toDate'),
      maNhanVien: parseOptionalInt(req.query.maNhanVien, 'maNhanVien'),
    };

    if (filters.fromDate && filters.toDate && filters.fromDate > filters.toDate) {
      throw new AppError('VALIDATION_ERROR', 'fromDate must be less than or equal to toDate', 400);
    }

    const orders = await repository.listOrders(filters);
    res.json(orders);
  } catch (error) {
    next(normalizeDatabaseError(error));
  }
}

async function getOrderDetail(req, res, next) {
  try {
    const maHoaDon = parseRequiredInt(req.params.maHoaDon, 'maHoaDon');
    const result = await repository.getOrderDetail(maHoaDon);

    if (!result.hoaDon) {
      throw new AppError('NOT_FOUND', 'Order not found', 404);
    }

    res.json(result);
  } catch (error) {
    next(normalizeDatabaseError(error));
  }
}

async function createOrder(req, res, next) {
  try {
    const data = {
      maNhanVien: parseRequiredInt(req.body.maNhanVien, 'maNhanVien'),
      phuongThucThanhToan: parseRequiredText(req.body.phuongThucThanhToan, 'phuongThucThanhToan'),
      items: normalizeItems(req.body.items),
    };

    const validation = await repository.validateOrderReferences(
      data.maNhanVien,
      data.items.map((item) => item.maSanPham)
    );

    if (!validation.employeeExists) {
      throw new AppError('VALIDATION_ERROR', 'maNhanVien does not exist', 400, [
        { field: 'maNhanVien', reason: 'NOT_FOUND' },
      ]);
    }

    if (validation.missingProductIds.length > 0) {
      throw new AppError('VALIDATION_ERROR', 'One or more products do not exist', 400, validation.missingProductIds.map((productId) => ({
        field: 'items.maSanPham',
        reason: `NOT_FOUND:${productId}`,
      })));
    }

    const result = await repository.createOrder(data);
    res.status(201).json(result);
  } catch (error) {
    next(normalizeDatabaseError(error));
  }
}

module.exports = {
  listOrders,
  getOrderDetail,
  createOrder,
};
