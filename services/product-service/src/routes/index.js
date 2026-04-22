const express = require('express');
const { requireInternalApiKey } = require('circlek-core');
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
const {
  getProductSnapshots,
  createReservation,
  confirmReservation,
  releaseReservation,
} = require('../controllers/internalController');

const router = express.Router();

router.get('/health', health);
router.get('/products', listProducts);
router.post('/products', createProduct);
router.get('/products/categories', listCategories);
router.get('/products/suppliers', listSuppliers);
router.get('/products/:maSanPham', getProductById);
router.put('/products/:maSanPham', updateProduct);
router.delete('/products/:maSanPham', deleteProduct);
router.get('/internal/v1/products/snapshots', requireInternalApiKey, getProductSnapshots);
router.post('/internal/v1/inventory/reservations', requireInternalApiKey, createReservation);
router.post('/internal/v1/inventory/reservations/:reservationId/confirm', requireInternalApiKey, confirmReservation);
router.post('/internal/v1/inventory/reservations/:reservationId/release', requireInternalApiKey, releaseReservation);

module.exports = router;
