class AppError extends Error {
  constructor(code, message, status, details) {
    super(message);
    this.code = code || 'INTERNAL_ERROR';
    this.status = status || 500;
    this.details = Array.isArray(details) ? details : undefined;
  }
}

function mapInfrastructureError(err) {
  if (!err || typeof err !== 'object') {
    return null;
  }

  const code = err.code;

  if (code === 'ECONNREFUSED' || code === 'ETIMEDOUT' || code === 'PROTOCOL_CONNECTION_LOST') {
    return {
      status: 503,
      body: {
        code: 'DATABASE_UNAVAILABLE',
        message: 'Cannot connect to database',
      },
    };
  }

  if (code === 'ER_ACCESS_DENIED_ERROR') {
    return {
      status: 503,
      body: {
        code: 'DATABASE_AUTH_FAILED',
        message: 'Database authentication failed',
      },
    };
  }

  if (code === 'ER_BAD_DB_ERROR' || code === 'ER_NO_SUCH_TABLE' || code === 'ER_SP_DOES_NOT_EXIST') {
    return {
      status: 500,
      body: {
        code: 'DATABASE_NOT_READY',
        message: 'Database schema is not initialized',
      },
    };
  }

  return null;
}

function toErrorResponse(err) {
  if (err instanceof AppError) {
    return {
      status: err.status,
      body: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    };
  }

  const infrastructureError = mapInfrastructureError(err);
  if (infrastructureError) {
    return infrastructureError;
  }

  return {
    status: 500,
    body: {
      code: 'INTERNAL_ERROR',
      message: 'Unexpected error',
    },
  };
}

module.exports = {
  AppError,
  mapInfrastructureError,
  toErrorResponse,
};
