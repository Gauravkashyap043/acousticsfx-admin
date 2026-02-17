import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../api/auth';

const pageWrapper =
  'min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 via-gray-50 to-gray-100';
const card =
  'w-full max-w-[400px] p-10 bg-white border border-gray-200 rounded-2xl shadow-xl';
const header = 'mb-8 text-center';
const title = 'm-0 text-2xl font-semibold tracking-tight text-gray-900';
const subtitle = 'mt-2 text-[0.9375rem] text-gray-500';
const inputClass =
  'py-2.5 px-3.5 text-base text-gray-900 bg-gray-50 border border-gray-200 rounded-lg outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 placeholder:text-gray-400 disabled:opacity-60';
const labelClass = 'flex flex-col gap-2';
const labelSpan = 'text-sm font-medium text-gray-600';
const btnPrimary =
  'mt-1 py-3 px-5 text-base font-medium text-white bg-accent-600 rounded-lg cursor-pointer transition hover:bg-accent-500 active:bg-accent-700 disabled:opacity-60';
const linkClass = 'text-primary-400 no-underline hover:underline';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) setMessage('Missing reset token. Use the link from your email.');
  }, [token]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    if (password !== confirm) {
      setMessage('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setMessage('Password must be at least 8 characters.');
      return;
    }
    setStatus('loading');
    setMessage('');
    try {
      await resetPassword(token, password);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Something went wrong.');
    }
  }

  if (!token) {
    return (
      <div className={pageWrapper}>
        <div className={card}>
          <div className={header}>
            <h1 className={title}>Invalid link</h1>
            <p className={subtitle}>
              Use the reset link from your email, or request a new one.
            </p>
          </div>
          <Link to="/forgot-password" className={linkClass}>
            Request reset link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={pageWrapper}>
      <div className={card}>
        <div className={header}>
          <h1 className={title}>Set new password</h1>
          <p className={subtitle}>Enter and confirm your new password</p>
        </div>
        {status === 'success' ? (
          <div className="text-gray-500 text-[0.9375rem]">
            <p className="m-0 mb-4">
              Password has been reset. You can sign in with your new password.
            </p>
            <Link
              to="/"
              className="inline-block py-3 px-5 text-center text-base font-medium text-white bg-accent-600 rounded-lg no-underline hover:bg-accent-500"
            >
              Sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {message && (
              <p className="m-0 py-2.5 px-3.5 text-sm text-red-600 bg-red-50 rounded-lg">
                {message}
              </p>
            )}
            <label className={labelClass}>
              <span className={labelSpan}>New password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                autoFocus
                disabled={status === 'loading'}
                minLength={8}
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              <span className={labelSpan}>Confirm password</span>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={status === 'loading'}
                minLength={8}
                className={inputClass}
              />
            </label>
            <button
              type="submit"
              disabled={status === 'loading'}
              className={btnPrimary}
            >
              {status === 'loading' ? 'Resetting…' : 'Reset password'}
            </button>
            <Link to="/" className="mt-2 inline-block text-[0.9375rem] text-primary-400 no-underline hover:underline">
              Back to sign in
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
