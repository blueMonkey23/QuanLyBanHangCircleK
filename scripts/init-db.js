const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const DB_DIR = path.join(ROOT_DIR, 'db');

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

  throw new Error(
    'Cannot find mysql2. Install dependencies in one backend service before running this script.',
  );
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
    throw new Error(`Unsupported DB_NAME "${name}". Use only letters, numbers, and underscore.`);
  }

  return name;
}

function normalizeStatement(statement) {
  if (/^USE\s+/i.test(statement)) {
    return null;
  }

  return statement;
}

async function applySqlFile(connection, filePath) {
  const fileName = path.basename(filePath);
  const content = fs.readFileSync(filePath, 'utf8');
  const statements = splitSqlStatements(content)
    .map(normalizeStatement)
    .filter(Boolean);

  console.log(`Applying ${fileName} (${statements.length} statements)...`);

  for (const statement of statements) {
    await connection.query(statement);
  }
}

async function main() {
  const mysql = resolveMysqlPromiseModule();
  const dbName = sanitizeDatabaseName(process.env.DB_NAME || 'circlek');
  const connectionConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  };

  console.log(
    `Connecting to MySQL ${connectionConfig.host}:${connectionConfig.port} as ${connectionConfig.user}...`,
  );

  const adminConnection = await mysql.createConnection(connectionConfig);
  await adminConnection.query(
    `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  );
  await adminConnection.end();

  const dbConnection = await mysql.createConnection({
    ...connectionConfig,
    database: dbName,
  });

  await applySqlFile(dbConnection, path.join(DB_DIR, 'stored_procedures.sql'));
  await applySqlFile(dbConnection, path.join(DB_DIR, 'seed.sql'));

  const [tableRows] = await dbConnection.query(
    `
      SELECT COUNT(*) AS total
      FROM information_schema.tables
      WHERE table_schema = ?
    `,
    [dbName],
  );
  const [procedureRows] = await dbConnection.query(
    `
      SELECT COUNT(*) AS total
      FROM information_schema.routines
      WHERE routine_schema = ?
        AND routine_type = 'PROCEDURE'
    `,
    [dbName],
  );

  await dbConnection.end();

  console.log(
    `Database "${dbName}" is ready: ${tableRows[0].total} tables, ${procedureRows[0].total} procedures.`,
  );
}

main().catch((error) => {
  const details = [error.code, error.message].filter(Boolean).join(': ');
  console.error(details || String(error));
  process.exitCode = 1;
});
