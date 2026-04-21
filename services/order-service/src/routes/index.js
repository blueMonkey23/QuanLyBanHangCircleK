const express = require('express');
const { health } = require('../controllers/healthController');
const { listOrders, createOrder } = require('../controllers/orderController');

const router = express.Router();

router.get('/health', health);
router.get('/orders', listOrders);
router.post('/orders', createOrder);

module.exports = router;
