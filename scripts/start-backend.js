const path = require('path');
const { spawn } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const SERVICES = [
  {
    name: 'user-service',
    cwd: path.join(ROOT_DIR, 'services', 'user-service'),
    args: ['src/server.js'],
  },
  {
    name: 'product-service',
    cwd: path.join(ROOT_DIR, 'services', 'product-service'),
    args: ['src/server.js'],
  },
  {
    name: 'order-service',
    cwd: path.join(ROOT_DIR, 'services', 'order-service'),
    args: ['src/server.js'],
  },
  {
    name: 'report-service',
    cwd: path.join(ROOT_DIR, 'services', 'report-service'),
    args: ['src/server.js'],
  },
  {
    name: 'api-gateway',
    cwd: path.join(ROOT_DIR, 'gateway'),
    args: ['src/server.js'],
  },
];

const children = [];

function wireOutput(stream, prefix, target) {
  let buffer = '';

  stream.on('data', (chunk) => {
    buffer += chunk.toString();
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop();

    for (const line of lines) {
      if (line) {
        target.write(`[${prefix}] ${line}\n`);
      }
    }
  });

  stream.on('end', () => {
    if (buffer) {
      target.write(`[${prefix}] ${buffer}\n`);
    }
  });
}

function shutdown(signal) {
  for (const child of children) {
    if (!child.killed) {
      child.kill(signal);
    }
  }
}

for (const service of SERVICES) {
  const child = spawn(process.execPath, service.args, {
    cwd: service.cwd,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: process.env,
  });

  children.push(child);
  wireOutput(child.stdout, service.name, process.stdout);
  wireOutput(child.stderr, service.name, process.stderr);

  child.on('exit', (code, signal) => {
    const detail = signal ? `signal ${signal}` : `code ${code}`;
    console.log(`[${service.name}] exited with ${detail}`);
  });
}

console.log(`Started ${SERVICES.length} backend processes with ${process.execPath}`);
console.log('Press Ctrl+C to stop all processes.');

process.on('SIGINT', () => {
  shutdown('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  shutdown('SIGTERM');
  process.exit(0);
});
