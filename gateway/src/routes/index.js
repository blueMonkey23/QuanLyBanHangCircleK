const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { requireAuth, requirePermissions } = require('circlek-core');
const { health } = require('../controllers/healthController');

const router = express.Router();

const userService = process.env.USER_SERVICE_URL || 'http://localhost:7001';
const productService = process.env.PRODUCT_SERVICE_URL || 'http://localhost:7002';
const orderService = process.env.ORDER_SERVICE_URL || 'http://localhost:7003';
const reportService = process.env.REPORT_SERVICE_URL || 'http://localhost:7004';

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

function authorizeUserRoutes(req, res, next) {
  const path = getRequestPath(req);

  if (path.startsWith('/api/v1/users/auth/me')) {
    next();
    return;
  }

  if (path.startsWith('/api/v1/users/accounts') || path === '/api/v1/users/roles' || path === '/api/v1/users/permissions') {
    requirePermissions('QUAN_LY_NGUOI_DUNG')(req, res, next);
    return;
  }

  if (path.startsWith('/api/v1/users/customers')) {
    requirePermissions('QUAN_LY_KHACH_HANG')(req, res, next);
    return;
  }

  if (path.startsWith('/api/v1/users/system-settings')) {
    requirePermissions('CAI_DAT_HE_THONG')(req, res, next);
    return;
  }

  next();
}

router.get('/health', health);

router.use(
  '/api/v1/users/auth/login',
  createServiceProxy('/api/v1/users', '/users', userService),
);

router.use(
  '/api/v1/users',
  requireAuth,
  authorizeUserRoutes,
  createServiceProxy('/api/v1/users', '/users', userService),
);

router.use(
  '/api/v1/products',
  requireAuth,
  authorizeByMethod({
    POST: ['QUAN_LY_SAN_PHAM'],
    PUT: ['QUAN_LY_SAN_PHAM'],
    DELETE: ['QUAN_LY_SAN_PHAM'],
  }),
  createServiceProxy('/api/v1/products', '/products', productService),
);

router.use(
  '/api/v1/orders',
  requireAuth,
  requirePermissions('TAO_HOA_DON'),
  createServiceProxy('/api/v1/orders', '/orders', orderService),
);

router.use(
  '/api/v1/reports',
  requireAuth,
  requirePermissions('XEM_BAO_CAO'),
  createServiceProxy('/api/v1/reports', '/reports', reportService),
);

module.exports = router;
