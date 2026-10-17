import ApiError from '../utils/ApiError.js';

export const validate =
  (schema, source = 'body') =>
  (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const details = result.error.issues.map((i) => ({
        field: i.path.join('.'),
        message: i.message,
      }));
      return next(new ApiError(400, 'Validation failed', details));
    }
    if (source === 'query') req.validQuery = result.data;
    else req[source] = result.data;
    next();
  };
