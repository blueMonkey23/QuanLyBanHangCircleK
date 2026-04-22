const express = require('express');
const { requireInternalApiKey } = require('circlek-core');
const { health } = require('../controllers/healthController');
const {
  revenueReport,
  topProductsReport,
  invoiceSummaryReport,
} = require('../controllers/reportController');
const { ingestOrderCreatedEvent } = require('../controllers/internalController');

const router = express.Router();

router.get('/health', health);
router.get('/reports/revenue', revenueReport);
router.get('/reports/top-products', topProductsReport);
router.get('/reports/invoice-summary', invoiceSummaryReport);
router.post('/internal/v1/events/order-created', requireInternalApiKey, ingestOrderCreatedEvent);

module.exports = router;
