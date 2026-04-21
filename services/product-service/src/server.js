const { loadEnv, getServicePort, createLogger, startServiceServer } = require('circlek-core');
const app = require('./app');

loadEnv();

const logger = createLogger('product-service');
const port = getServicePort('PRODUCT_SERVICE_PORT', 7002);

startServiceServer(app, {
  serviceName: 'product-service',
  port,
  logger,
});
