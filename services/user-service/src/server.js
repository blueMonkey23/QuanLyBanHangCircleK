const { loadEnv, getServicePort, createLogger } = require('circlek-core');
const app = require('./app');

loadEnv();

const logger = createLogger('user-service');
const port = getServicePort('USER_SERVICE_PORT', 7001);

app.listen(port, () => {
  logger.info(`user-service listening on port ${port}`);
});
