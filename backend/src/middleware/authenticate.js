import { verifyToken } from '../lib/jwt.js';
import { AppError } from './errorHandler.js';

export function authenticate(req, _res, next) {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    return next(new AppError('Authentication required', 401));
  }

  const token = header.slice(7);

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch {
    next(new AppError('Invalid or expired token', 401));
  }
}
