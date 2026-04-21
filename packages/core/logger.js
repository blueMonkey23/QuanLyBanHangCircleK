function createLogger(serviceName) {
  const prefix = serviceName ? `[${serviceName}]` : '[service]';
  return {
    info: (message, meta) => {
      console.log(prefix, message, meta || '');
    },
    warn: (message, meta) => {
      console.warn(prefix, message, meta || '');
    },
    error: (message, meta) => {
      console.error(prefix, message, meta || '');
    },
  };
}

module.exports = {
  createLogger,
};
