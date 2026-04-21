const { loadEnv, getServicePort, createLogger, startServiceServer } = require('circlek-core');
const app = require('./app');

loadEnv();

const logger = createLogger('api-gateway');
const port = getServicePort('GATEWAY_PORT', 8000);

startServiceServer(app, {
  serviceName: 'api-gateway',
  port,
  logger,
});
