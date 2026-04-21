const express = require('express');
const { health } = require('../controllers/healthController');
const { listProducts, createProduct } = require('../controllers/productController');

const router = express.Router();

router.get('/health', health);
router.get('/products', listProducts);
router.post('/products', createProduct);

module.exports = router;
