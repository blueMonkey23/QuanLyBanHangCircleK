const express = require('express');
const { health } = require('../controllers/healthController');
const {
  revenueReport,
  topProductsReport,
  invoiceSummaryReport,
} = require('../controllers/reportController');

const router = express.Router();

router.get('/health', health);
router.get('/reports/revenue', revenueReport);
router.get('/reports/top-products', topProductsReport);
router.get('/reports/invoice-summary', invoiceSummaryReport);

module.exports = router;
