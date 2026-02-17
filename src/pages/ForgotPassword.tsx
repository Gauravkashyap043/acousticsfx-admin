import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../api/auth';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    setStatus('loading');
    setMessage('');
    try {
      await forgotPassword(trimmed);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Something went wrong.');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-secondary-900 via-secondary-800 to-secondary-950">
      <div className="w-full max-w-[400px] p-10 bg-secondary-800/90 border border-secondary-600/80 rounded-2xl shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="m-0 text-2xl font-semibold tracking-tight text-secondary-100">
            Reset password
          </h1>
          <p className="mt-2 text-[0.9375rem] text-secondary-400">
            Enter your admin email and we’ll send a reset link
          </p>
        </div>
        {status === 'success' ? (
          <div className="text-secondary-400 text-[0.9375rem]">
            <p className="m-0 mb-4">
              If an account exists with that email, we sent a password reset link. Check your inbox and spam.
            </p>
            <Link
              to="/"
              className="text-primary-400 no-underline hover:underline"
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {message && (
              <p className="m-0 py-2.5 px-3.5 text-sm text-red-500 bg-red-500/10 rounded-lg">
                {message}
              </p>
            )}
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-secondary-300">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@acousticsfx.com"
                autoComplete="email"
                autoFocus
                disabled={status === 'loading'}
                className="py-2.5 px-3.5 text-base text-secondary-100 bg-secondary-950 border border-secondary-600 rounded-lg outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 placeholder:text-secondary-500 disabled:opacity-60"
              />
            </label>
            <button
              type="submit"
              disabled={status === 'loading'}
              className="mt-1 py-3 px-5 text-base font-medium text-white bg-accent-600 rounded-lg cursor-pointer transition hover:bg-accent-500 active:bg-accent-700 disabled:opacity-60"
            >
              {status === 'loading' ? 'Sending…' : 'Send reset link'}
            </button>
            <Link
              to="/"
              className="mt-2 inline-block text-[0.9375rem] text-primary-400 no-underline hover:underline"
            >
              Back to sign in
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
