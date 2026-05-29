import * as authService from '../services/auth.service.js';
import { clearLoginAttempts, recordFailedLogin } from '../middleware/loginBruteForce.js';

export async function register(req, res, next) {
  try {
    const result = await authService.registerUser(req.body);
    res.status(201).json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const result = await authService.loginUser(req.body);
    clearLoginAttempts(req);
    res.json({ data: result });
  } catch (err) {
    if (err.status === 401) {
      recordFailedLogin(req);
    }
    next(err);
  }
}

export async function me(req, res, next) {
  try {
    const user = await authService.getUserById(req.user.id);
    res.json({ data: { user } });
  } catch (err) {
    next(err);
  }
}
