const endpoints = [
  { name: 'user-service health', url: 'http://localhost:7001/health' },
  { name: 'product-service health', url: 'http://localhost:7002/health' },
  { name: 'order-service health', url: 'http://localhost:7003/health' },
  { name: 'report-service health', url: 'http://localhost:7004/health' },
  { name: 'gateway health', url: 'http://localhost:8000/health' },
  { name: 'gateway users roles', url: 'http://localhost:8000/api/v1/users/roles' },
  { name: 'gateway products', url: 'http://localhost:8000/api/v1/products' },
  { name: 'gateway invoice summary', url: 'http://localhost:8000/api/v1/reports/invoice-summary' },
];

async function checkEndpoint(endpoint) {
  try {
    const response = await fetch(endpoint.url);
    const contentType = response.headers.get('content-type') || '';
    const body = contentType.includes('application/json')
      ? JSON.stringify(await response.json())
      : await response.text();

    console.log(`${response.status} ${endpoint.name} -> ${body}`);
    return response.ok;
  } catch (error) {
    console.log(`ERR ${endpoint.name} -> ${error.message}`);
    return false;
  }
}

async function main() {
  let allPassed = true;

  for (const endpoint of endpoints) {
    const passed = await checkEndpoint(endpoint);
    allPassed = allPassed && passed;
  }

  if (!allPassed) {
    process.exitCode = 1;
  }
}

main();
