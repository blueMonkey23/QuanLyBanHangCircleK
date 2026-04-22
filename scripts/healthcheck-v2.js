const path = require('path');
const { loadEnvFiles } = require('./lib/env');

const ROOT_DIR = path.resolve(__dirname, '..');

loadEnvFiles([
  path.join(ROOT_DIR, '.env'),
  path.join(ROOT_DIR, 'gateway', '.env'),
  path.join(ROOT_DIR, 'services', 'order-service', '.env'),
]);

const gatewayPort = Number(process.env.GATEWAY_PORT || 8000);
const gatewayBaseUrl = process.env.GATEWAY_BASE_URL || `http://localhost:${gatewayPort}`;
const userServiceUrl = (process.env.USER_SERVICE_URL || 'http://localhost:7001').replace(/\/$/, '');
const productServiceUrl = (process.env.PRODUCT_SERVICE_URL || 'http://localhost:7002').replace(/\/$/, '');
const orderServiceUrl = (process.env.ORDER_SERVICE_URL || 'http://localhost:7003').replace(/\/$/, '');
const reportServiceUrl = (process.env.REPORT_SERVICE_URL || 'http://localhost:7004').replace(/\/$/, '');

const publicEndpoints = [
  { name: 'user-service health', url: `${userServiceUrl}/health` },
  { name: 'product-service health', url: `${productServiceUrl}/health` },
  { name: 'order-service health', url: `${orderServiceUrl}/health` },
  { name: 'report-service health', url: `${reportServiceUrl}/health` },
  { name: 'gateway health', url: `${gatewayBaseUrl}/health` },
];

async function readResponseBody(response) {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return JSON.stringify(await response.json());
  }

  return response.text();
}

async function checkEndpoint(endpoint, options = {}) {
  try {
    const response = await fetch(endpoint.url, options);
    const body = await readResponseBody(response);
    console.log(`${response.status} ${endpoint.name} -> ${body}`);
    return {
      ok: response.ok,
      status: response.status,
      body,
    };
  } catch (error) {
    console.log(`ERR ${endpoint.name} -> ${error.message}`);
    return {
      ok: false,
      status: 0,
      body: error.message,
    };
  }
}

async function loginAsAdmin() {
  const response = await fetch(`${gatewayBaseUrl}/api/v2/users/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: 'admin.circlek',
      password: '123456',
    }),
  });

  const body = await readResponseBody(response);
  console.log(`${response.status} gateway login v2 -> ${body}`);

  if (!response.ok) {
    return null;
  }

  return JSON.parse(body);
}

async function main() {
  let allPassed = true;

  for (const endpoint of publicEndpoints) {
    const result = await checkEndpoint(endpoint);
    allPassed = allPassed && result.ok;
  }

  const loginResult = await loginAsAdmin();
  if (!loginResult) {
    process.exitCode = 1;
    return;
  }

  const headers = {
    Authorization: `Bearer ${loginResult.token}`,
  };

  const productsResponse = await fetch(`${gatewayBaseUrl}/api/v2/products`, { headers });
  const products = await productsResponse.json();
  console.log(`${productsResponse.status} gateway products v2 -> ${JSON.stringify(products)}`);
  allPassed = allPassed && productsResponse.ok && Array.isArray(products) && products.length > 0;

  const invoiceBeforeResponse = await fetch(`${gatewayBaseUrl}/api/v2/reports/invoice-summary`, { headers });
  const invoiceBefore = await invoiceBeforeResponse.json();
  console.log(`${invoiceBeforeResponse.status} invoice summary before -> ${JSON.stringify(invoiceBefore)}`);
  allPassed = allPassed && invoiceBeforeResponse.ok;

  const createOrderResponse = await fetch(`${gatewayBaseUrl}/api/v2/orders`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      maNhanVien: loginResult.user.maNhanVien,
      phuongThucThanhToan: 'TIEN_MAT',
      items: [
        {
          maSanPham: products[0].maSanPham,
          soLuong: 1,
        },
      ],
    }),
  });
  const createdOrder = await createOrderResponse.json();
  console.log(`${createOrderResponse.status} create order v2 -> ${JSON.stringify(createdOrder)}`);
  allPassed = allPassed && createOrderResponse.ok;

  const cancelOrderResponse = await fetch(
    `${gatewayBaseUrl}/api/v2/orders/${createdOrder.hoaDon.maHoaDon}/cancel`,
    {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reason: 'healthcheck-v2',
      }),
    },
  );
  const cancelledOrder = await cancelOrderResponse.json();
  console.log(`${cancelOrderResponse.status} cancel order v2 -> ${JSON.stringify(cancelledOrder)}`);
  allPassed = allPassed && cancelOrderResponse.ok;

  const invoiceAfterResponse = await fetch(`${gatewayBaseUrl}/api/v2/reports/invoice-summary`, { headers });
  const invoiceAfter = await invoiceAfterResponse.json();
  console.log(`${invoiceAfterResponse.status} invoice summary after -> ${JSON.stringify(invoiceAfter)}`);
  allPassed = allPassed && invoiceAfterResponse.ok;

  if (!allPassed) {
    process.exitCode = 1;
  }
}

main();
