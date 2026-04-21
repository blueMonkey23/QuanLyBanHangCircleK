const express = require('express');
const { health } = require('../controllers/healthController');
const {
	listProducts,
	createProduct,
	getProductById,
	updateProduct,
	deleteProduct,
	listCategories,
	listSuppliers,
} = require('../controllers/productController');

const router = express.Router();

router.get('/health', health);
router.get('/products', listProducts);
router.post('/products', createProduct);
router.get('/products/categories', listCategories);
router.get('/products/suppliers', listSuppliers);
router.get('/products/:maSanPham', getProductById);
router.put('/products/:maSanPham', updateProduct);
router.delete('/products/:maSanPham', deleteProduct);

module.exports = router;
