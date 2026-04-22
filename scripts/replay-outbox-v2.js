const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

loadEnv(path.join(ROOT_DIR, '.env'));

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');
    if (separatorIndex <= 0) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function resolveMysqlPromiseModule() {
  const candidates = [
    path.join(ROOT_DIR, 'node_modules', 'mysql2', 'promise'),
    path.join(ROOT_DIR, 'services', 'user-service', 'node_modules', 'mysql2', 'promise'),
    path.join(ROOT_DIR, 'services', 'product-service', 'node_modules', 'mysql2', 'promise'),
    path.join(ROOT_DIR, 'services', 'order-service', 'node_modules', 'mysql2', 'promise'),
    path.join(ROOT_DIR, 'services', 'report-service', 'node_modules', 'mysql2', 'promise'),
  ];

  for (const candidate of candidates) {
    try {
      return require(candidate);
    } catch (error) {
      if (error.code !== 'MODULE_NOT_FOUND') {
        throw error;
      }
    }
  }

  throw new Error('Cannot find mysql2. Install dependencies before replaying the outbox.');
}

function getValue(keys, fallback) {
  for (const key of keys) {
    const value = process.env[key];
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return String(value).trim();
    }
  }

  return fallback;
}

async function main() {
  const mysql = resolveMysqlPromiseModule();
  const { requestJson } = require(path.join(ROOT_DIR, 'packages', 'core'));
  const orderDbConfig = {
    host: getValue(['ORDER_DB_HOST', 'DB_HOST'], 'localhost'),
    port: Number(getValue(['ORDER_DB_PORT', 'DB_PORT'], '3306')),
    user: getValue(['ORDER_DB_USER', 'DB_USER'], 'root'),
    password: getValue(['ORDER_DB_PASSWORD', 'DB_PASSWORD'], ''),
    database: getValue(['ORDER_DB_NAME'], 'order_db'),
  };
  const reportServiceUrl = getValue(
    ['REPORT_SERVICE_INTERNAL_URL', 'REPORT_SERVICE_URL'],
    'http://localhost:7004',
  ).replace(/\/$/, '');

  let connection;

  try {
    connection = await mysql.createConnection(orderDbConfig);
    const [rows] = await connection.query(
      `SELECT MaEvent, EventType, PayloadJson
       FROM OrderOutbox
       WHERE PublishedAt IS NULL
       ORDER BY MaEvent ASC`,
    );

    let publishedCount = 0;

    for (const row of rows) {
      const payload =
        typeof row.PayloadJson === 'string' ? JSON.parse(row.PayloadJson) : row.PayloadJson;

      await requestJson(`${reportServiceUrl}/internal/v1/events/order-created`, {
        method: 'POST',
        serviceName: 'report-service',
        body: {
          eventId: String(row.MaEvent),
          eventType: row.EventType,
          payload,
        },
      });

      await connection.query(
        `UPDATE OrderOutbox
         SET PublishedAt = UTC_TIMESTAMP()
         WHERE MaEvent = ?`,
        [row.MaEvent],
      );

      publishedCount += 1;
    }

    console.log(`Published ${publishedCount} pending outbox event(s).`);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    const details = [error.code, error.message].filter(Boolean).join(': ');
    console.error(details || String(error));
    process.exit(1);
  });
