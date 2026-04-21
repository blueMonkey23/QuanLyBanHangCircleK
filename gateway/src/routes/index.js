const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { health } = require('../controllers/healthController');

const router = express.Router();

const userService = process.env.USER_SERVICE_URL || 'http://localhost:7001';
const productService = process.env.PRODUCT_SERVICE_URL || 'http://localhost:7002';
const orderService = process.env.ORDER_SERVICE_URL || 'http://localhost:7003';
const reportService = process.env.REPORT_SERVICE_URL || 'http://localhost:7004';

router.get('/health', health);
router.use('/api/v1/users', createProxyMiddleware({ target: userService, changeOrigin: true }));
router.use('/api/v1/products', createProxyMiddleware({ target: productService, changeOrigin: true }));
router.use('/api/v1/orders', createProxyMiddleware({ target: orderService, changeOrigin: true }));
router.use('/api/v1/reports', createProxyMiddleware({ target: reportService, changeOrigin: true }));

module.exports = router;
