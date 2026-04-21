const { loadEnv, getServicePort, createLogger, startServiceServer } = require('circlek-core');
const app = require('./app');

loadEnv();

const logger = createLogger('report-service');
const port = getServicePort('REPORT_SERVICE_PORT', 7004);

startServiceServer(app, {
  serviceName: 'report-service',
  port,
  logger,
});
