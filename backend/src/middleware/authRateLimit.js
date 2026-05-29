import rateLimit from 'express-rate-limit';

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;
const ONE_HOUR_MS = 60 * 60 * 1000;
const TWENTY_FIVE_MINUTES_SEC = 25 * 60;

function rateLimitJsonHandler(req, res, _next, options) {
  const retryAfterSeconds =
    typeof options.retryAfter === 'number'
      ? options.retryAfter
      : Math.ceil(options.windowMs / 1000);

  res.status(options.statusCode).json({
    error: {
      message: options.message,
      code: options.code ?? 'AUTH_RATE_LIMITED',
      retryAfterSeconds,
    },
  });
}

/** Baseline cap for all /api/auth routes (register, login, me). */
export const authGeneralLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES_MS,
  max: 120,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: rateLimitJsonHandler,
  message: 'Too many authentication requests. Please try again later.',
  code: 'AUTH_RATE_LIMITED',
});

/** Limit registration spam per IP. */
export const registerLimiter = rateLimit({
  windowMs: ONE_HOUR_MS,
  max: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: rateLimitJsonHandler,
  message: 'Too many registration attempts. Please try again later.',
  code: 'AUTH_REGISTER_RATE_LIMITED',
});

/**
 * Counts only failed login responses (4xx/5xx).
 * Five failures within 15 minutes triggers a cooldown (enforced with loginBruteForce).
 */
/** Only count invalid credentials (401), not validation errors. */
const countOnlyFailedLogins = (_req, res) => res.statusCode !== 401;

export const loginFailureLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES_MS,
  max: 5,
  skip: countOnlyFailedLogins,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    rateLimitJsonHandler(req, res, next, {
      ...options,
      message:
        'Too many failed login attempts. Please try again in 15 minutes.',
      code: 'AUTH_LOGIN_LOCKED',
      retryAfter: 15 * 60,
    });
  },
});

/**
 * Ten failed logins within one hour → extended cooldown (25 minutes).
 */
export const loginHourFailureLimiter = rateLimit({
  windowMs: ONE_HOUR_MS,
  max: 10,
  skip: countOnlyFailedLogins,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    rateLimitJsonHandler(req, res, next, {
      ...options,
      message:
        'Too many failed login attempts. Please try again in 25 minutes.',
      code: 'AUTH_LOGIN_LOCKED_EXTENDED',
      retryAfter: TWENTY_FIVE_MINUTES_SEC,
    });
  },
});
