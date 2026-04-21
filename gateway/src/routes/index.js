const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { health } = require('../controllers/healthController');

const router = express.Router();

const userService = process.env.USER_SERVICE_URL || 'http://localhost:7001';
const productService = process.env.PRODUCT_SERVICE_URL || 'http://localhost:7002';
const orderService = process.env.ORDER_SERVICE_URL || 'http://localhost:7003';
const reportService = process.env.REPORT_SERVICE_URL || 'http://localhost:7004';

function createServiceProxy(servicePrefix, target) {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: (path) => `${servicePrefix}${path}`,
  });
}

router.get('/health', health);
router.use('/api/v1/users', createServiceProxy('/users', userService));
router.use('/api/v1/products', createServiceProxy('/products', productService));
router.use('/api/v1/orders', createServiceProxy('/orders', orderService));
router.use('/api/v1/reports', createServiceProxy('/reports', reportService));

module.exports = router;
