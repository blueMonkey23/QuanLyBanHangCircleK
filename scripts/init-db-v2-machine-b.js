const { runInit } = require('./lib/init-db-v2');

runInit(['product', 'order']).catch((error) => {
  const details = [error.code, error.message].filter(Boolean).join(': ');
  console.error(details || String(error));
  process.exitCode = 1;
});
