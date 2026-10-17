import ApiError from '../utils/ApiError.js';

export function notFound(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid identifier' });
  }
  if (err.code === 11000) {
    return res.status(409).json({ message: 'A record with that value already exists' });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Malformed JSON body' });
  }
  if (err.status) {
    const body = { message: err.message };
    if (err.details) body.details = err.details;
    return res.status(err.status).json(body);
  }
  console.error(err);
  res.status(500).json({ message: 'Something went wrong on our side' });
}
