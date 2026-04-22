const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { requireAuth, requirePermissions } = require('circlek-core');
const { health } = require('../controllers/healthController');

const router = express.Router();

function normalizeServiceUrl(value, fallback) {
  return String(value || fallback).trim().replace(/\/$/, '');
}

const userService = normalizeServiceUrl(process.env.USER_SERVICE_URL, 'http://localhost:7001');
const productService = normalizeServiceUrl(process.env.PRODUCT_SERVICE_URL, 'http://localhost:7002');
const orderService = normalizeServiceUrl(process.env.ORDER_SERVICE_URL, 'http://localhost:7003');
const reportService = normalizeServiceUrl(process.env.REPORT_SERVICE_URL, 'http://localhost:7004');

function rewriteServicePath(path, sourcePrefix, targetPrefix) {
  if (path.startsWith(sourcePrefix)) {
    const remainder = path.slice(sourcePrefix.length);
    return `${targetPrefix}${remainder || ''}`;
  }

  if (!path || path === '/') {
    return targetPrefix;
  }

  return `${targetPrefix}${path.startsWith('/') ? path : `/${path}`}`;
}

function createServiceProxy(sourcePrefix, targetPrefix, target) {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: (path) => rewriteServicePath(path, sourcePrefix, targetPrefix),
  });
}

function getRequestPath(req) {
  return req.originalUrl.split('?')[0];
}

function authorizeByMethod(permissionMap) {
  return (req, res, next) => {
    const permissions = permissionMap[req.method];

    if (!permissions || permissions.length === 0) {
      next();
      return;
    }

    requirePermissions(...permissions)(req, res, next);
  };
}

function authorizeUserRoutes(apiPrefix) {
  return (req, res, next) => {
    const path = getRequestPath(req);

    if (path.startsWith(`${apiPrefix}/users/auth/me`)) {
      next();
      return;
    }

    if (
      path.startsWith(`${apiPrefix}/users/accounts`) ||
      path === `${apiPrefix}/users/roles` ||
      path === `${apiPrefix}/users/permissions`
    ) {
      requirePermissions('QUAN_LY_NGUOI_DUNG')(req, res, next);
      return;
    }

    if (path.startsWith(`${apiPrefix}/users/customers`)) {
      requirePermissions('QUAN_LY_KHACH_HANG')(req, res, next);
      return;
    }

    if (path.startsWith(`${apiPrefix}/users/system-settings`)) {
      requirePermissions('CAI_DAT_HE_THONG')(req, res, next);
      return;
    }

    next();
  };
}

function registerVersionedApi(apiPrefix) {
  router.use(
    `${apiPrefix}/users/auth/login`,
    createServiceProxy(`${apiPrefix}/users`, '/users', userService),
  );

  router.use(
    `${apiPrefix}/users`,
    requireAuth,
    authorizeUserRoutes(apiPrefix),
    createServiceProxy(`${apiPrefix}/users`, '/users', userService),
  );

  router.use(
    `${apiPrefix}/products`,
    requireAuth,
    authorizeByMethod({
      POST: ['QUAN_LY_SAN_PHAM'],
      PUT: ['QUAN_LY_SAN_PHAM'],
      DELETE: ['QUAN_LY_SAN_PHAM'],
    }),
    createServiceProxy(`${apiPrefix}/products`, '/products', productService),
  );

  router.use(
    `${apiPrefix}/orders`,
    requireAuth,
    requirePermissions('TAO_HOA_DON'),
    createServiceProxy(`${apiPrefix}/orders`, '/orders', orderService),
  );

  router.use(
    `${apiPrefix}/reports`,
    requireAuth,
    requirePermissions('XEM_BAO_CAO'),
    createServiceProxy(`${apiPrefix}/reports`, '/reports', reportService),
  );
}

router.get('/health', health);
registerVersionedApi('/api/v1');
registerVersionedApi('/api/v2');

module.exports = router;
