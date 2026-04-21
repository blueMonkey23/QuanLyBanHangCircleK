const { loadEnv, getServicePort, createLogger } = require('circlek-core');
const app = require('./app');

loadEnv();

const logger = createLogger('report-service');
const port = getServicePort('REPORT_SERVICE_PORT', 7004);

app.listen(port, () => {
  logger.info(`report-service listening on port ${port}`);
});
