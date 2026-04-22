const BASE_GATEWAY_URL = 'http://localhost:8000';

const publicEndpoints = [
  { name: 'user-service health', url: 'http://localhost:7001/health' },
  { name: 'product-service health', url: 'http://localhost:7002/health' },
  { name: 'order-service health', url: 'http://localhost:7003/health' },
  { name: 'report-service health', url: 'http://localhost:7004/health' },
  { name: 'gateway health', url: `${BASE_GATEWAY_URL}/health` },
];

const protectedEndpoints = [
  { name: 'gateway users roles', url: `${BASE_GATEWAY_URL}/api/v1/users/roles` },
  { name: 'gateway products', url: `${BASE_GATEWAY_URL}/api/v1/products` },
  { name: 'gateway customers', url: `${BASE_GATEWAY_URL}/api/v1/users/customers` },
  { name: 'gateway settings', url: `${BASE_GATEWAY_URL}/api/v1/users/system-settings` },
  { name: 'gateway invoice summary', url: `${BASE_GATEWAY_URL}/api/v1/reports/invoice-summary` },
];

async function readResponseBody(response) {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return JSON.stringify(await response.json());
  }

  return response.text();
}

async function checkEndpoint(endpoint, headers = {}) {
  try {
    const response = await fetch(endpoint.url, { headers });
    const body = await readResponseBody(response);

    console.log(`${response.status} ${endpoint.name} -> ${body}`);
    return response.ok;
  } catch (error) {
    console.log(`ERR ${endpoint.name} -> ${error.message}`);
    return false;
  }
}

async function loginAsAdmin() {
  const response = await fetch(`${BASE_GATEWAY_URL}/api/v1/users/auth/login`, {
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
  console.log(`${response.status} gateway login -> ${body}`);

  if (!response.ok) {
    return null;
  }

  return JSON.parse(body).token;
}

async function main() {
  let allPassed = true;

  for (const endpoint of publicEndpoints) {
    const passed = await checkEndpoint(endpoint);
    allPassed = allPassed && passed;
  }

  const token = await loginAsAdmin();
  if (!token) {
    process.exitCode = 1;
    return;
  }

  for (const endpoint of protectedEndpoints) {
    const passed = await checkEndpoint(endpoint, {
      Authorization: `Bearer ${token}`,
    });
    allPassed = allPassed && passed;
  }

  if (!allPassed) {
    process.exitCode = 1;
  }
}

main();
