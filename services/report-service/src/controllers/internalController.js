const { AppError } = require('circlek-core');
const repository = require('../db/ReportDataAccess');

function parseRequiredText(value, field) {
  const parsed = String(value || '').trim();
  if (!parsed) {
    throw new AppError('VALIDATION_ERROR', `${field} is required`, 400);
  }

  return parsed;
}

function validateOrderEventPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new AppError('VALIDATION_ERROR', 'payload is required', 400);
  }

  if (!payload.hoaDon || typeof payload.hoaDon !== 'object') {
    throw new AppError('VALIDATION_ERROR', 'payload.hoaDon is required', 400);
  }

  if (!Number.isInteger(Number(payload.hoaDon.maHoaDon)) || Number(payload.hoaDon.maHoaDon) <= 0) {
    throw new AppError('VALIDATION_ERROR', 'payload.hoaDon.maHoaDon must be a positive integer', 400);
  }

  if (!Array.isArray(payload.chiTiet)) {
    throw new AppError('VALIDATION_ERROR', 'payload.chiTiet must be an array', 400);
  }
}

async function ingestOrderCreatedEvent(req, res, next) {
  try {
    const event = {
      eventId: parseRequiredText(req.body.eventId, 'eventId'),
      eventType: parseRequiredText(req.body.eventType, 'eventType'),
      payload: req.body.payload,
    };

    validateOrderEventPayload(event.payload);

    const result = await repository.applyOrderCreatedEvent(event);
    res.status(202).json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  ingestOrderCreatedEvent,
};
