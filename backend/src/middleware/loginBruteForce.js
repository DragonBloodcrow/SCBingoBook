const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;
const TWENTY_FIVE_MINUTES_MS = 25 * 60 * 1000;
const ONE_HOUR_MS = 60 * 60 * 1000;

/** @type {Map<string, { failures: number, windowStart: number, lockedUntil: number, lockTier: 0 | 1 | 2 }>} */
const attemptsByIp = new Map();

export function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim().replace(/^::ffff:/, '');
  }
  const ip = req.ip ?? req.socket?.remoteAddress ?? 'unknown';
  return String(ip).replace(/^::ffff:/, '');
}

function getOrCreateRecord(ip) {
  const now = Date.now();
  let record = attemptsByIp.get(ip);

  if (!record || now - record.windowStart > ONE_HOUR_MS) {
    record = { failures: 0, windowStart: now, lockedUntil: 0, lockTier: 0 };
  }

  if (record.lockedUntil > 0 && now >= record.lockedUntil) {
    record.lockedUntil = 0;
    record.lockTier = 0;
    record.failures = 0;
  }

  attemptsByIp.set(ip, record);
  return record;
}

/** Block login while an active 15m / 25m cooldown is in effect. */
export function checkLoginLockout(req, res, next) {
  const record = getOrCreateRecord(getClientIp(req));
  const now = Date.now();

  if (record.lockedUntil > now) {
    const retryAfterSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    const isExtended = record.lockTier === 2;

    return res.status(429).json({
      error: {
        message: isExtended
          ? 'Too many failed login attempts. Please try again in 25 minutes.'
          : 'Too many failed login attempts. Please try again in 15 minutes.',
        code: isExtended ? 'AUTH_LOGIN_LOCKED_EXTENDED' : 'AUTH_LOGIN_LOCKED',
        retryAfterSeconds,
      },
    });
  }

  next();
}

/** Call after a failed login (401). */
export function recordFailedLogin(req) {
  const ip = getClientIp(req);
  const now = Date.now();
  const record = getOrCreateRecord(ip);

  record.failures += 1;

  if (record.failures >= 10) {
    record.lockedUntil = now + TWENTY_FIVE_MINUTES_MS;
    record.lockTier = 2;
  } else if (record.failures >= 5) {
    record.lockedUntil = now + FIFTEEN_MINUTES_MS;
    record.lockTier = 1;
  }

  attemptsByIp.set(ip, record);
}

/** Call after a successful login. */
export function clearLoginAttempts(req) {
  attemptsByIp.delete(getClientIp(req));
}

/**
 * Track login result when the response is sent (reliable vs. try/catch in controller).
 */
export function trackLoginResult(req, res, next) {
  res.on('finish', () => {
    if (res.statusCode === 401) {
      recordFailedLogin(req);
    } else if (res.statusCode >= 200 && res.statusCode < 300) {
      clearLoginAttempts(req);
    }
  });
  next();
}

export function pruneExpiredAttempts() {
  const now = Date.now();
  for (const [ip, record] of attemptsByIp.entries()) {
    const hourExpired = now - record.windowStart > ONE_HOUR_MS;
    const lockExpired = !record.lockedUntil || now >= record.lockedUntil;
    if (hourExpired && lockExpired) {
      attemptsByIp.delete(ip);
    }
  }
}

setInterval(pruneExpiredAttempts, 10 * 60 * 1000).unref?.();
