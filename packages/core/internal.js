const http = require('http');
const https = require('https');
const { timingSafeEqual } = require('crypto');
const { URL } = require('url');
const { AppError } = require('./errors');

function getInternalApiKey() {
  return String(process.env.INTERNAL_API_KEY || 'circlek-internal-demo-key');
}

function safeEquals(left, right) {
  const leftBuffer = Buffer.from(String(left || ''));
  const rightBuffer = Buffer.from(String(right || ''));

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

function requireInternalApiKey(req, res, next) {
  const providedKey = req.headers['x-internal-api-key'];

  if (!providedKey || !safeEquals(providedKey, getInternalApiKey())) {
    next(new AppError('FORBIDDEN', 'Internal API key is invalid', 403));
    return;
  }

  next();
}

function parseResponseBody(rawBody) {
  const text = String(rawBody || '').trim();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    return text;
  }
}

function createUpstreamError(serviceName, statusCode, payload) {
  const fallbackMessage = `Upstream service ${serviceName} returned ${statusCode}`;
  const isObjectPayload = payload && typeof payload === 'object' && !Array.isArray(payload);
  const code = isObjectPayload && payload.code ? payload.code : 'UPSTREAM_ERROR';
  const message = isObjectPayload && payload.message ? payload.message : fallbackMessage;
  const details = isObjectPayload && Array.isArray(payload.details) ? payload.details : undefined;

  return new AppError(code, message, statusCode, details);
}

function requestJson(url, options = {}) {
  const target = new URL(url);
  const transport = target.protocol === 'https:' ? https : http;
  const requestBody =
    options.body === undefined || options.body === null ? null : JSON.stringify(options.body);
  const method = options.method || (requestBody ? 'POST' : 'GET');
  const headers = {
    Accept: 'application/json',
    ...options.headers,
  };

  if (!headers['x-internal-api-key']) {
    headers['x-internal-api-key'] = getInternalApiKey();
  }

  if (options.requestId && !headers['x-request-id']) {
    headers['x-request-id'] = options.requestId;
  }

  if (requestBody) {
    headers['Content-Type'] = 'application/json';
    headers['Content-Length'] = Buffer.byteLength(requestBody);
  }

  const serviceName = options.serviceName || target.host;
  const timeoutMs = Number(options.timeoutMs || 10000);

  return new Promise((resolve, reject) => {
    const request = transport.request(
      {
        protocol: target.protocol,
        hostname: target.hostname,
        port: target.port || (target.protocol === 'https:' ? 443 : 80),
        method,
        path: `${target.pathname}${target.search}`,
        headers,
      },
      (response) => {
        let rawBody = '';
        response.setEncoding('utf8');
        response.on('data', (chunk) => {
          rawBody += chunk;
        });
        response.on('end', () => {
          const payload = parseResponseBody(rawBody);
          const statusCode = response.statusCode || 500;

          if (statusCode >= 400) {
            reject(createUpstreamError(serviceName, statusCode, payload));
            return;
          }

          resolve(payload);
        });
      },
    );

    request.setTimeout(timeoutMs, () => {
      request.destroy(Object.assign(new Error(`Request to ${serviceName} timed out`), { code: 'ETIMEDOUT' }));
    });

    request.on('error', (error) => {
      reject(
        new AppError(
          'UPSTREAM_UNAVAILABLE',
          `Cannot reach ${serviceName}`,
          503,
          [{ field: 'service', reason: error.code || error.message }],
        ),
      );
    });

    if (requestBody) {
      request.write(requestBody);
    }

    request.end();
  });
}

module.exports = {
  getInternalApiKey,
  requireInternalApiKey,
  requestJson,
};
