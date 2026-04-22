const fs = require('fs');
const path = require('path');
const { loadEnvFiles } = require('./env');

const ROOT_DIR = path.resolve(__dirname, '..', '..');
const DB_V2_DIR = path.join(ROOT_DIR, 'db', 'v2');

const SERVICES = [
  { key: 'user', name: 'user-service', envPrefix: 'USER', defaultDbName: 'user_db', folder: 'user' },
  {
    key: 'product',
    name: 'product-service',
    envPrefix: 'PRODUCT',
    defaultDbName: 'product_db',
    folder: 'product',
  },
  { key: 'order', name: 'order-service', envPrefix: 'ORDER', defaultDbName: 'order_db', folder: 'order' },
  {
    key: 'report',
    name: 'report-service',
    envPrefix: 'REPORT',
    defaultDbName: 'report_db',
    folder: 'report',
  },
];

loadEnvFiles([path.join(ROOT_DIR, '.env')]);

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

  throw new Error('Cannot find mysql2. Install dependencies before running init-db-v2.');
}

function splitSqlStatements(content) {
  const lines = content.replace(/^\uFEFF/, '').split(/\r?\n/);
  const statements = [];
  let delimiter = ';';
  let buffer = '';

  for (const line of lines) {
    const trimmed = line.trim();
    const delimiterMatch = trimmed.match(/^DELIMITER\s+(.+)$/i);

    if (delimiterMatch) {
      delimiter = delimiterMatch[1];
      continue;
    }

    buffer += `${line}\n`;
    if (trimmed.endsWith(delimiter)) {
      const statement = buffer.trim().slice(0, -delimiter.length).trim();
      if (statement) {
        statements.push(statement);
      }
      buffer = '';
    }
  }

  const remaining = buffer.trim();
  if (remaining) {
    statements.push(remaining);
  }

  return statements;
}

function sanitizeDatabaseName(name) {
  if (!/^[A-Za-z0-9_]+$/.test(name)) {
    throw new Error(`Unsupported database name "${name}"`);
  }

  return name;
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

function getServiceDbConfig(service) {
  return {
    host: getValue([`${service.envPrefix}_DB_HOST`, 'DB_HOST'], 'localhost'),
    port: Number(getValue([`${service.envPrefix}_DB_PORT`, 'DB_PORT'], '3306')),
    user: getValue([`${service.envPrefix}_DB_USER`, 'DB_USER'], 'root'),
    password: getValue([`${service.envPrefix}_DB_PASSWORD`, 'DB_PASSWORD'], ''),
    name: sanitizeDatabaseName(
      getValue([`${service.envPrefix}_DB_NAME`], service.defaultDbName),
    ),
    ssl: getBooleanValue([`${service.envPrefix}_DB_SSL`, 'DB_SSL'], false)
      ? { rejectUnauthorized: true }
      : undefined,
  };
}

async function applySqlFile(connection, filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const statements = splitSqlStatements(content).filter(Boolean);

  for (const statement of statements) {
    await connection.query(statement);
  }
}

async function prepareDatabase(mysql, service) {
  const config = getServiceDbConfig(service);
  console.log(`Preparing ${service.name} -> ${config.host}:${config.port}/${config.name}`);

  const adminConnection = await mysql.createConnection({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    ssl: config.ssl,
  });

  await adminConnection.query(
    `CREATE DATABASE IF NOT EXISTS \`${config.name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  );
  await adminConnection.end();

  const dbConnection = await mysql.createConnection({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.name,
    ssl: config.ssl,
  });

  await applySqlFile(dbConnection, path.join(DB_V2_DIR, service.folder, 'schema.sql'));
  await applySqlFile(dbConnection, path.join(DB_V2_DIR, service.folder, 'seed.sql'));

  const [tableRows] = await dbConnection.query(
    `SELECT COUNT(*) AS total
     FROM information_schema.tables
     WHERE table_schema = ?`,
    [config.name],
  );

  await dbConnection.end();
  console.log(`  Ready: ${tableRows[0].total} tables`);
}

function resolveServices(requestedKeys = []) {
  if (!requestedKeys.length) {
    return SERVICES;
  }

  const normalized = requestedKeys.map((value) => value.trim().toLowerCase());
  const selected = SERVICES.filter((service) => {
    return normalized.includes(service.key) || normalized.includes(service.name.toLowerCase());
  });

  if (!selected.length) {
    throw new Error(`Unknown service selection: ${requestedKeys.join(', ')}`);
  }

  return selected;
}

async function runInit(requestedKeys = []) {
  const mysql = resolveMysqlPromiseModule();
  const services = resolveServices(requestedKeys);

  for (const service of services) {
    await prepareDatabase(mysql, service);
  }
}

module.exports = {
  ROOT_DIR,
  SERVICES,
  runInit,
};
