import { useState, type FormEvent } from 'react';
import { ApiClientError } from '../lib/api';

interface AuthFormProps {
  mode: 'login' | 'register';
  onSubmit: (data: Record<string, string>) => Promise<void>;
}

export function AuthForm({ mode, onSubmit }: AuthFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
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
      setError(
        err instanceof ApiClientError ? err.message : 'Something went wrong. Try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit} noValidate>
      {error && (
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
        <input id="email" name="email" type="email" required autoComplete="email" />
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
        />
      </div>

      <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
        {loading ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
      </button>
    </form>
  );
}
