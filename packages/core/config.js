const dotenv = require('dotenv');

function loadEnv() {
  dotenv.config();
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
