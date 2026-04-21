const { randomUUID } = require('crypto');
const { createLogger } = require('./logger');
const { toErrorResponse } = require('./errors');

const logger = createLogger('http');

function requestIdMiddleware(req, res, next) {
  const incomingId = req.headers['x-request-id'];
  const requestId = incomingId || randomUUID();
  req.requestId = requestId;
  res.setHeader('x-request-id', requestId);
  next();
}

function notFoundHandler(req, res) {
  res.status(404).json({
    code: 'NOT_FOUND',
    message: 'Route not found',
    details: [{ field: 'path', reason: req.originalUrl }],
  });
}

function errorHandler(err, req, res, next) {
  if (err) {
    logger.error('Request failed', {
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
      code: err.code,
      message: err.message,
      stack: err.stack,
    });
  }

  const response = toErrorResponse(err);
  res.status(response.status).json(response.body);
}

module.exports = {
  requestIdMiddleware,
  notFoundHandler,
  errorHandler,
};
