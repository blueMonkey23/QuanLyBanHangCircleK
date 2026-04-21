const { randomUUID } = require('crypto');
const { toErrorResponse } = require('./errors');

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
  const response = toErrorResponse(err);
  res.status(response.status).json(response.body);
}

module.exports = {
  requestIdMiddleware,
  notFoundHandler,
  errorHandler,
};
