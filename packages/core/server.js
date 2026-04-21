function startServiceServer(app, options) {
  const serviceName = options.serviceName || 'service';
  const port = options.port;
  const logger = options.logger;

  const server = app.listen(port, () => {
    logger.info(`${serviceName} listening on port ${port}`);
  });

  server.on('error', (error) => {
    logger.error('Failed to start server', {
      serviceName,
      port,
      code: error.code,
      message: error.message,
    });
    process.exit(1);
  });

  return server;
}

module.exports = {
  startServiceServer,
};
