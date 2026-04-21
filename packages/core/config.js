const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

function loadEnv() {
  const cwd = process.cwd();
  const candidates = [
    path.resolve(cwd, '..', '..', '.env'),
    path.resolve(cwd, '..', '.env'),
    path.resolve(cwd, '.env'),
  ];
  const loaded = new Set();

  for (const envPath of candidates) {
    if (loaded.has(envPath) || !fs.existsSync(envPath)) {
      continue;
    }

    dotenv.config({
      path: envPath,
      override: envPath.endsWith(`${path.sep}.env`) && envPath.startsWith(cwd),
    });
    loaded.add(envPath);
  }
}

function getServicePort(envKey, fallbackPort) {
  const fromEnv = parseInt(process.env[envKey] || process.env.PORT, 10);
  if (Number.isFinite(fromEnv) && fromEnv > 0) {
    return fromEnv;
  }
  return fallbackPort;
}

module.exports = {
  loadEnv,
  getServicePort,
};
