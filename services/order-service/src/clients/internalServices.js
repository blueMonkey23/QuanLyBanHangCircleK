const { requestJson } = require('circlek-core');

function getServiceBaseUrl(envKeys, fallbackUrl) {
  for (const envKey of envKeys) {
    const value = String(process.env[envKey] || '').trim();
    if (value) {
      return value.replace(/\/$/, '');
    }
  }

  return fallbackUrl;
}

function getUserServiceBaseUrl() {
  return getServiceBaseUrl(['USER_SERVICE_INTERNAL_URL', 'USER_SERVICE_URL'], 'http://localhost:7001');
}

function getProductServiceBaseUrl() {
  return getServiceBaseUrl(['PRODUCT_SERVICE_INTERNAL_URL', 'PRODUCT_SERVICE_URL'], 'http://localhost:7002');
}

function getReportServiceBaseUrl() {
  return getServiceBaseUrl(['REPORT_SERVICE_INTERNAL_URL', 'REPORT_SERVICE_URL'], 'http://localhost:7004');
}

async function getStaffSnapshot(maNhanVien, requestId) {
  return requestJson(`${getUserServiceBaseUrl()}/internal/v1/staff/${maNhanVien}/snapshot`, {
    serviceName: 'user-service',
    requestId,
  });
}

async function getCustomerSnapshot(maKhachHang, requestId) {
  return requestJson(`${getUserServiceBaseUrl()}/internal/v1/customers/${maKhachHang}/snapshot`, {
    serviceName: 'user-service',
    requestId,
  });
}

async function createInventoryReservation(payload, requestId) {
  return requestJson(`${getProductServiceBaseUrl()}/internal/v1/inventory/reservations`, {
    method: 'POST',
    body: payload,
    serviceName: 'product-service',
    requestId,
  });
}

async function confirmInventoryReservation(reservationId, orderId, requestId) {
  return requestJson(
    `${getProductServiceBaseUrl()}/internal/v1/inventory/reservations/${reservationId}/confirm`,
    {
      method: 'POST',
      body: { orderId },
      serviceName: 'product-service',
      requestId,
    },
  );
}

async function releaseInventoryReservation(reservationId, reason, requestId) {
  return requestJson(
    `${getProductServiceBaseUrl()}/internal/v1/inventory/reservations/${reservationId}/release`,
    {
      method: 'POST',
      body: { reason },
      serviceName: 'product-service',
      requestId,
    },
  );
}

async function publishOrderCreatedEvent(event, requestId) {
  return requestJson(`${getReportServiceBaseUrl()}/internal/v1/events/order-created`, {
    method: 'POST',
    body: event,
    serviceName: 'report-service',
    requestId,
  });
}

module.exports = {
  getStaffSnapshot,
  getCustomerSnapshot,
  createInventoryReservation,
  confirmInventoryReservation,
  releaseInventoryReservation,
  publishOrderCreatedEvent,
};
