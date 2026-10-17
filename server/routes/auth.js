import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';
import {
  register,
  login,
  logout,
  me,
  registerSchema,
  loginSchema,
} from '../controllers/authController.js';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts, please try again later' },
  skip: () => process.env.NODE_ENV === 'test',
});

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/logout', logout);
router.get('/me', protect, me);

export default router;
