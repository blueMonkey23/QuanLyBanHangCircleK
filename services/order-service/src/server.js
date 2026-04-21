const { loadEnv, getServicePort, createLogger } = require('circlek-core');
const app = require('./app');

loadEnv();

const logger = createLogger('order-service');
const port = getServicePort('ORDER_SERVICE_PORT', 7003);

app.listen(port, () => {
  logger.info(`order-service listening on port ${port}`);
});
