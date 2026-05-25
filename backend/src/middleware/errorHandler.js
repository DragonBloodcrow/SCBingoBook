export function errorHandler(err, _req, res, _next) {
  const status = err.status ?? err.statusCode ?? 500;
  const message = err.message ?? 'Internal server error';

  if (process.env.NODE_ENV === 'development' && status === 500) {
    console.error(err);
  }

  res.status(status).json({
    error: {
      message,
      ...(err.details && { details: err.details }),
    },
  });
}

export class AppError extends Error {
  constructor(message, status = 400, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}
