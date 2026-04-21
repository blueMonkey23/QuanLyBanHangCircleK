const { loadEnv, getServicePort, createLogger, startServiceServer } = require('circlek-core');
const app = require('./app');

loadEnv();

const logger = createLogger('order-service');
const port = getServicePort('ORDER_SERVICE_PORT', 7003);

startServiceServer(app, {
  serviceName: 'order-service',
  port,
  logger,
});
