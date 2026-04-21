const { AppError } = require('circlek-core');
const repository = require('../db/reportRepository');

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

function parseOptionalInt(value, field) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new AppError('VALIDATION_ERROR', `${field} must be a positive integer`, 400);
  }

  return parsed;
}

function normalizeDateRange(fromDate, toDate) {
  if (fromDate && toDate && fromDate > toDate) {
    throw new AppError('VALIDATION_ERROR', 'fromDate must be less than or equal to toDate', 400);
  }
}

function parseGroupBy(value) {
  if (value === undefined || value === null || value === '') {
    return 'day';
  }

  if (['day', 'month', 'year'].includes(value)) {
    return value;
  }

  throw new AppError('VALIDATION_ERROR', 'groupBy must be one of day, month, year', 400);
}

async function revenueReport(req, res, next) {
  try {
    const filters = {
      fromDate: parseOptionalDateTime(req.query.fromDate, 'fromDate'),
      toDate: parseOptionalDateTime(req.query.toDate, 'toDate'),
      groupBy: parseGroupBy(req.query.groupBy),
    };

    normalizeDateRange(filters.fromDate, filters.toDate);

    const result = await repository.getRevenueReport(filters);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function topProductsReport(req, res, next) {
  try {
    const filters = {
      fromDate: parseOptionalDateTime(req.query.fromDate, 'fromDate'),
      toDate: parseOptionalDateTime(req.query.toDate, 'toDate'),
      limit: parseOptionalInt(req.query.limit, 'limit') || 10,
    };

    normalizeDateRange(filters.fromDate, filters.toDate);

    const result = await repository.getTopProductsReport(filters);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function invoiceSummaryReport(req, res, next) {
  try {
    const filters = {
      fromDate: parseOptionalDateTime(req.query.fromDate, 'fromDate'),
      toDate: parseOptionalDateTime(req.query.toDate, 'toDate'),
    };

    normalizeDateRange(filters.fromDate, filters.toDate);

    const result = await repository.getInvoiceSummary(filters);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  revenueReport,
  topProductsReport,
  invoiceSummaryReport,
};
