const path = require('path');
const { loadEnvFiles } = require('./env');

const ROOT_DIR = path.resolve(__dirname, '..', '..');

function loadOutboxEnv() {
  loadEnvFiles([
    path.join(ROOT_DIR, '.env'),
    path.join(ROOT_DIR, 'services', 'order-service', '.env'),
    path.join(ROOT_DIR, 'services', 'report-service', '.env'),
    path.join(ROOT_DIR, 'gateway', '.env'),
  ]);
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

  throw new Error('Cannot find mysql2. Install dependencies before publishing the outbox.');
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

function getBooleanValue(keys, fallback = false) {
  const value = getValue(keys, fallback ? 'true' : 'false');
  return String(value).trim().toLowerCase() === 'true';
}

function getOrderDbConfig() {
  return {
    host: getValue(['ORDER_DB_HOST', 'DB_HOST'], 'localhost'),
    port: Number(getValue(['ORDER_DB_PORT', 'DB_PORT'], '3306')),
    user: getValue(['ORDER_DB_USER', 'DB_USER'], 'root'),
    password: getValue(['ORDER_DB_PASSWORD', 'DB_PASSWORD'], ''),
    database: getValue(['ORDER_DB_NAME', 'DB_NAME'], 'order_db'),
    ssl: getBooleanValue(['ORDER_DB_SSL', 'DB_SSL'], false)
      ? { rejectUnauthorized: true }
      : undefined,
  };
}

function getReportServiceUrl() {
  return getValue(
    ['REPORT_SERVICE_INTERNAL_URL', 'REPORT_SERVICE_URL'],
    'http://localhost:7004',
  ).replace(/\/$/, '');
}

function getReportEventPath(eventType) {
  if (eventType === 'OrderCreated') {
    return '/internal/v1/events/order-created';
  }

  if (eventType === 'OrderCancelled') {
    return '/internal/v1/events/order-cancelled';
  }

  throw new Error(`Unsupported outbox event type: ${eventType}`);
}

async function publishPendingOutboxEvents(options = {}) {
  loadOutboxEnv();

  const mysql = resolveMysqlPromiseModule();
  const { requestJson } = require(path.join(ROOT_DIR, 'packages', 'core'));
  const connection = await mysql.createConnection(getOrderDbConfig());

  try {
    const [rows] = await connection.query(
      `SELECT MaEvent, EventType, PayloadJson
       FROM OrderOutbox
       WHERE PublishedAt IS NULL
       ORDER BY MaEvent ASC`,
    );

    const publishedEventIds = [];

    for (const row of rows) {
      const payload =
        typeof row.PayloadJson === 'string' ? JSON.parse(row.PayloadJson) : row.PayloadJson;

      await requestJson(`${getReportServiceUrl()}${getReportEventPath(row.EventType)}`, {
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

      publishedEventIds.push(Number(row.MaEvent));
    }

    if (options.verbose) {
      console.log(`Published ${publishedEventIds.length} pending outbox event(s).`);
    }

    return {
      publishedCount: publishedEventIds.length,
      publishedEventIds,
    };
  } finally {
    await connection.end();
  }
}

module.exports = {
  ROOT_DIR,
  loadOutboxEnv,
  getValue,
  publishPendingOutboxEvents,
};
