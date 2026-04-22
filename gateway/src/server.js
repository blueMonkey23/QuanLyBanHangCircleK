const { loadEnv, getServicePort, createLogger, startServiceServer } = require('circlek-core');

loadEnv();

const app = require('./app');

const logger = createLogger('api-gateway');
const port = getServicePort('GATEWAY_PORT', 8000);

startServiceServer(app, {
  serviceName: 'api-gateway',
  port,
  logger,
});
