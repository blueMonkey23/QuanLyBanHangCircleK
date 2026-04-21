const { loadEnv, getServicePort, createLogger } = require('circlek-core');
const app = require('./app');

loadEnv();

const logger = createLogger('product-service');
const port = getServicePort('PRODUCT_SERVICE_PORT', 7002);

app.listen(port, () => {
  logger.info(`product-service listening on port ${port}`);
});
