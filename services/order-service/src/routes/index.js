const express = require('express');
const { health } = require('../controllers/healthController');
const { listOrders, getOrderDetail, createOrder, cancelOrder } = require('../controllers/orderController');

const router = express.Router();

router.get('/health', health);
router.get('/orders', listOrders);
router.post('/orders', createOrder);
router.get('/orders/:maHoaDon', getOrderDetail);
router.post('/orders/:maHoaDon/cancel', cancelOrder);

module.exports = router;
