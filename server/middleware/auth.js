import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { COOKIE_NAME } from '../utils/token.js';

// Identity always comes from the signed cookie, never from a client-supplied userId.
export const protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) throw new ApiError(401, 'Not authenticated');

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new ApiError(401, 'Session expired or invalid');
  }

  const user = await User.findById(payload.sub).select('-passwordHash');
  if (!user) throw new ApiError(401, 'Account no longer exists');
  req.user = user;
  next();
});
