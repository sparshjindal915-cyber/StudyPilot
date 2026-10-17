import jwt from 'jsonwebtoken';

export const COOKIE_NAME = 'token';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export function cookieOptions() {
  const prod = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: prod,
    // Cross-site deployments (client and API on different domains) need "none" + secure.
    sameSite: process.env.COOKIE_SAMESITE || (prod ? 'none' : 'lax'),
    path: '/',
  };
}

export function signToken(userId) {
  return jwt.sign({ sub: String(userId) }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

export function setAuthCookie(res, userId) {
  res.cookie(COOKIE_NAME, signToken(userId), { ...cookieOptions(), maxAge: SEVEN_DAYS_MS });
}

export function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, cookieOptions());
}
