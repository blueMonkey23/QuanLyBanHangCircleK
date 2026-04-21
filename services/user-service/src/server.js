const { loadEnv, getServicePort, createLogger, startServiceServer } = require('circlek-core');
const app = require('./app');

loadEnv();

const logger = createLogger('user-service');
const port = getServicePort('USER_SERVICE_PORT', 7001);

startServiceServer(app, {
  serviceName: 'user-service',
  port,
  logger,
});
