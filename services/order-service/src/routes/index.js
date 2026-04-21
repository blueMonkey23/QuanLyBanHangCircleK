const express = require('express');
const { health } = require('../controllers/healthController');
const { listOrders, getOrderDetail, createOrder } = require('../controllers/orderController');

const router = express.Router();

router.get('/health', health);
router.get('/orders', listOrders);
router.post('/orders', createOrder);
router.get('/orders/:maHoaDon', getOrderDetail);

module.exports = router;
