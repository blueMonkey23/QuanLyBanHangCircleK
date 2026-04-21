class AppError extends Error {
  constructor(code, message, status, details) {
    super(message);
    this.code = code || 'INTERNAL_ERROR';
    this.status = status || 500;
    this.details = Array.isArray(details) ? details : undefined;
  }
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
  toErrorResponse,
};
