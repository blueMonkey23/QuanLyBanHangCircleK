const { loadEnv, getServicePort } = require('./config');
const { createLogger } = require('./logger');
const { startServiceServer } = require('./server');
const { AppError, toErrorResponse } = require('./errors');
const { requestIdMiddleware, notFoundHandler, errorHandler } = require('./middleware');
const { signAuthToken, verifyAuthToken, requireAuth, requirePermissions } = require('./auth');
const {
  toNumberOrNull,
  toBooleanFlag,
  toDateTimeValue,
  toDateOnlyValue,
  mapMessageRow,
} = require('./dto');

module.exports = {
  loadEnv,
  getServicePort,
  createLogger,
  startServiceServer,
  AppError,
  toErrorResponse,
  signAuthToken,
  verifyAuthToken,
  requireAuth,
  requirePermissions,
  requestIdMiddleware,
  notFoundHandler,
  errorHandler,
  toNumberOrNull,
  toBooleanFlag,
  toDateTimeValue,
  toDateOnlyValue,
  mapMessageRow,
};
