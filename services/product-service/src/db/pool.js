const mysql = require('mysql2/promise');

let pool;

function requireEnv(name) {
  const value = process.env[name];
  if (value === undefined || value === null || value === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getPassword() {
  const value = process.env.DB_PASSWORD;
  if (value === undefined || value === null) {
    throw new Error('Missing required environment variable: DB_PASSWORD');
  }
  return value;
}

function getPool() {
  if (!pool) {
    const host = requireEnv('DB_HOST');
    const port = Number(requireEnv('DB_PORT'));
    if (!Number.isFinite(port) || port <= 0) {
      throw new Error('DB_PORT must be a positive number');
    }

    const user = requireEnv('DB_USER');
    const password = getPassword();
    const database = requireEnv('DB_NAME');
    const useSsl = String(process.env.DB_SSL || '').toLowerCase() === 'true';

    pool = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      ssl: useSsl ? { rejectUnauthorized: true } : undefined,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      multipleStatements: true,
    });
  }

  return pool;
}

module.exports = {
  getPool,
};
