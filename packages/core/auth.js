const { createHmac, timingSafeEqual } = require('crypto');
const { AppError } = require('./errors');

function base64UrlEncode(value) {
  const input = typeof value === 'string' ? value : JSON.stringify(value);
  return Buffer.from(input).toString('base64url');
}

function base64UrlDecode(value) {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function signValue(value, secret) {
  return createHmac('sha256', secret).update(value).digest('base64url');
}

function getTokenSecret() {
  return process.env.AUTH_TOKEN_SECRET || 'circlek-demo-secret';
}

function getTokenTtlSeconds() {
  const fromEnv = Number(process.env.AUTH_TOKEN_TTL_HOURS || 12);
  if (Number.isFinite(fromEnv) && fromEnv > 0) {
    return Math.floor(fromEnv * 60 * 60);
  }

  return 12 * 60 * 60;
}

function signAuthToken(payload, options = {}) {
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };
  const issuedAt = options.issuedAt || Math.floor(Date.now() / 1000);
  const expiresInSeconds = options.expiresInSeconds || getTokenTtlSeconds();
  const body = {
    ...payload,
    iat: issuedAt,
    exp: issuedAt + expiresInSeconds,
  };

  const signingInput = `${base64UrlEncode(header)}.${base64UrlEncode(body)}`;
  const signature = signValue(signingInput, getTokenSecret());

  return `${signingInput}.${signature}`;
}

function verifySignature(signingInput, signature) {
  const expected = signValue(signingInput, getTokenSecret());
  const left = Buffer.from(expected);
  const right = Buffer.from(signature || '');

  if (left.length !== right.length) {
    return false;
  }

  return timingSafeEqual(left, right);
}

function verifyAuthToken(token) {
  if (!token) {
    throw new AppError('UNAUTHORIZED', 'Authentication required', 401);
  }

  const parts = String(token).split('.');
  if (parts.length !== 3) {
    throw new AppError('UNAUTHORIZED', 'Invalid token', 401);
  }

  const [encodedHeader, encodedPayload, signature] = parts;
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  if (!verifySignature(signingInput, signature)) {
    throw new AppError('UNAUTHORIZED', 'Invalid token signature', 401);
  }

  let payload;
  try {
    payload = JSON.parse(base64UrlDecode(encodedPayload));
  } catch (error) {
    throw new AppError('UNAUTHORIZED', 'Invalid token payload', 401);
  }

  const now = Math.floor(Date.now() / 1000);
  if (!payload.exp || payload.exp <= now) {
    throw new AppError('UNAUTHORIZED', 'Token has expired', 401);
  }

  return payload;
}

function parseBearerToken(value) {
  const headerValue = String(value || '').trim();
  if (!headerValue) {
    return null;
  }

  const match = headerValue.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}

function requireAuth(req, res, next) {
  try {
    const token = parseBearerToken(req.headers.authorization);
    req.auth = verifyAuthToken(token);
    next();
  } catch (error) {
    next(error);
  }
}

function requirePermissions(...requiredPermissions) {
  return (req, res, next) => {
    const available = Array.isArray(req.auth?.permissions) ? req.auth.permissions : [];
    const hasPermission = requiredPermissions.some((permission) => available.includes(permission));

    if (!hasPermission) {
      next(
        new AppError(
          'FORBIDDEN',
          'You do not have permission to access this resource',
          403,
        ),
      );
      return;
    }

    next();
  };
}

module.exports = {
  signAuthToken,
  verifyAuthToken,
  requireAuth,
  requirePermissions,
};
