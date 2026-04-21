const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
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

router.get('/health', health);
router.use('/api/v1/users', createServiceProxy('/api/v1/users', '/users', userService));
router.use('/api/v1/products', createServiceProxy('/api/v1/products', '/products', productService));
router.use('/api/v1/orders', createServiceProxy('/api/v1/orders', '/orders', orderService));
router.use('/api/v1/reports', createServiceProxy('/api/v1/reports', '/reports', reportService));

module.exports = router;
