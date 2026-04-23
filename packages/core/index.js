const { loadEnv, getServicePort } = require('./config');
const { createLogger } = require('./logger');
const { startServiceServer } = require('./server');
const { AppError, toErrorResponse } = require('./errors');
const {
  requestIdMiddleware,
  accessLogMiddleware,
  noCacheMiddleware,
  notFoundHandler,
  errorHandler,
} = require('./middleware');
const { signAuthToken, verifyAuthToken, requireAuth, requirePermissions } = require('./auth');
const { getInternalApiKey, requireInternalApiKey, requestJson } = require('./internal');
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
  getInternalApiKey,
  requireInternalApiKey,
  requestJson,
  requestIdMiddleware,
  accessLogMiddleware,
  noCacheMiddleware,
  notFoundHandler,
  errorHandler,
  toNumberOrNull,
  toBooleanFlag,
  toDateTimeValue,
  toDateOnlyValue,
  mapMessageRow,
};
