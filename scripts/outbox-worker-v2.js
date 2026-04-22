const { loadOutboxEnv, getValue, publishPendingOutboxEvents } = require('./lib/outbox-v2');

loadOutboxEnv();

const intervalMs = Number(getValue(['OUTBOX_POLL_INTERVAL_MS'], '5000'));
let timer = null;
let isRunning = false;

async function runCycle() {
  if (isRunning) {
    return;
  }

  isRunning = true;
  try {
    const result = await publishPendingOutboxEvents();
    if (result.publishedCount > 0) {
      console.log(
        `Published ${result.publishedCount} pending outbox event(s): ${result.publishedEventIds.join(', ')}`,
      );
    }
  } catch (error) {
    const details = [error.code, error.message].filter(Boolean).join(': ');
    console.error(details || String(error));
  } finally {
    isRunning = false;
  }
}

function shutdown() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }

  process.exit(0);
}

console.log(`Outbox worker v2 is running. Poll interval: ${intervalMs} ms`);
runCycle();
timer = setInterval(runCycle, intervalMs);
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
