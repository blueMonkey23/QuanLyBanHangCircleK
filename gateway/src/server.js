const { loadEnv, getServicePort, createLogger } = require('circlek-core');
const app = require('./app');

loadEnv();

const logger = createLogger('api-gateway');
const port = getServicePort('GATEWAY_PORT', 8000);

app.listen(port, () => {
  logger.info(`api-gateway listening on port ${port}`);
});
