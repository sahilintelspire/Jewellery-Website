/**
 * Wrap async Express handlers so rejected promises reach centralized error middleware.
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Create an HTTP error with an explicit status code.
 */
export class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

/**
 * Express error-handling middleware.
 */
export function errorHandler(err, _req, res, _next) {
  const status = err.statusCode || (err.name === 'MulterError' ? 400 : 500);
  const message =
    err.name === 'MulterError' && err.code === 'LIMIT_FILE_SIZE'
      ? 'Image exceeds 5 MB upload limit. Please compress or choose a smaller file.'
      : err.message || 'Internal server error';

  if (status >= 500) {
    console.error('[Server Error]:', err);
  }

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && status >= 500 ? { stack: err.stack } : {})
  });
}
