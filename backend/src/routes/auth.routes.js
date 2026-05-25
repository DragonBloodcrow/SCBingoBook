import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import * as authController from '../controllers/auth.controller.js';
import { loginSchema, registerSchema } from '../validators/auth.schema.js';

export const authRouter = Router();

authRouter.post('/register', validate(registerSchema), authController.register);
authRouter.post('/login', validate(loginSchema), authController.login);
authRouter.get('/me', authenticate, authController.me);
