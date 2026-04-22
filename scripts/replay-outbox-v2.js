const { publishPendingOutboxEvents } = require('./lib/outbox-v2');

publishPendingOutboxEvents({ verbose: true })
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    const details = [error.code, error.message].filter(Boolean).join(': ');
    console.error(details || String(error));
    process.exit(1);
  });
