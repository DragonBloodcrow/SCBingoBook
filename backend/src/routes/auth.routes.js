import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import {
  authGeneralLimiter,
  loginFailureLimiter,
  loginHourFailureLimiter,
  registerLimiter,
} from '../middleware/authRateLimit.js';
import { checkLoginLockout, trackLoginResult } from '../middleware/loginBruteForce.js';
import * as authController from '../controllers/auth.controller.js';
import { loginSchema, registerSchema } from '../validators/auth.schema.js';

export const authRouter = Router();

authRouter.use(authGeneralLimiter);

authRouter.post('/register', registerLimiter, validate(registerSchema), authController.register);

authRouter.post(
  '/login',
  checkLoginLockout,
  validate(loginSchema),
  loginFailureLimiter,
  loginHourFailureLimiter,
  trackLoginResult,
  authController.login
);

authRouter.get('/me', authenticate, authController.me);
