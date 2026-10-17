import bcrypt from 'bcryptjs';
import { z } from 'zod';
import User, { serializeUser } from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { setAuthCookie, clearAuthCookie } from '../utils/token.js';

export const registerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(80),
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(72, 'Password is too long'),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

// Compared against when the email is unknown so response time doesn't reveal which emails exist.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 10);

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (await User.exists({ email })) {
    throw new ApiError(409, 'Validation failed', [
      { field: 'email', message: 'An account with this email already exists' },
    ]);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, passwordHash });
  setAuthCookie(res, user._id);
  res.status(201).json({ user: serializeUser(user) });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  const ok = await bcrypt.compare(password, user ? user.passwordHash : DUMMY_HASH);
  if (!user || !ok) throw new ApiError(401, 'Invalid email or password');

  setAuthCookie(res, user._id);
  res.json({ user: serializeUser(user) });
});

export const logout = (req, res) => {
  clearAuthCookie(res);
  res.json({ message: 'Logged out' });
};

export const me = (req, res) => {
  res.json({ user: serializeUser(req.user) });
};
