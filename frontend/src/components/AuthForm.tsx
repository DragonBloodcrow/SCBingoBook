import { useEffect, useState, type FormEvent } from 'react';
import { ApiClientError } from '../lib/api';

interface AuthFormProps {
  mode: 'login' | 'register';
  onSubmit: (data: Record<string, string>) => Promise<void>;
}

function formatCountdown(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes > 0) {
    return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
  }
  return `${seconds}s`;
}

export function AuthForm({ mode, onSubmit }: AuthFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(0);

  const isLockedOut = lockoutUntil !== null && Date.now() < lockoutUntil;

  useEffect(() => {
    if (!lockoutUntil) return;

    const tick = () => {
      const remaining = Math.ceil((lockoutUntil - Date.now()) / 1000);
      if (remaining <= 0) {
        setLockoutUntil(null);
        setCountdown(0);
        setError(null);
        return;
      }
      setCountdown(remaining);
    };

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [lockoutUntil]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isLockedOut) return;

    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const data: Record<string, string> = {};
    form.forEach((value, key) => {
      if (typeof value === 'string' && value.trim()) {
        data[key] = value.trim();
      }
    });

    try {
      await onSubmit(data);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
        if (err.status === 429 && err.retryAfterSeconds) {
          setLockoutUntil(Date.now() + err.retryAfterSeconds * 1000);
        }
      } else {
        setError('Something went wrong. Try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit} noValidate>
      {isLockedOut && (
        <div className="error-banner lockout-banner" role="alert">
          <strong>Login temporarily locked</strong>
          <p style={{ margin: '0.5rem 0 0' }}>
            Too many failed attempts. Try again in {formatCountdown(countdown)}.
          </p>
        </div>
      )}

      {error && !isLockedOut && (
        <div className="error-banner" role="alert">
          {error}
        </div>
      )}

      {mode === 'register' && (
        <>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input id="username" name="username" required minLength={3} autoComplete="username" />
          </div>
          <div className="form-group">
            <label htmlFor="displayName">Display name (optional)</label>
            <input id="displayName" name="displayName" autoComplete="nickname" />
          </div>
        </>
      )}

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          disabled={isLockedOut}
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={mode === 'register' ? 8 : 1}
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          disabled={isLockedOut}
        />
      </div>

      <button
        type="submit"
        className="btn btn-primary"
        disabled={loading || isLockedOut}
        style={{ width: '100%' }}
      >
        {isLockedOut
          ? `Locked — wait ${formatCountdown(countdown)}`
          : loading
            ? 'Please wait…'
            : mode === 'login'
              ? 'Log in'
              : 'Create account'}
      </button>
    </form>
  );
}
