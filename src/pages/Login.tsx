import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLoginMutation } from '../hooks/useLoginMutation';
import { useSignupMutation } from '../hooks/useSignupMutation';

type Mode = 'login' | 'signup';

export default function Login() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const loginMutation = useLoginMutation();
  const signUpMutation = useSignupMutation();
  const isPending = loginMutation.isPending || signUpMutation.isPending;
  const activeError = mode === 'login' ? loginMutation.error : signUpMutation.error;

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (mode === 'signup') {
      if (password !== confirmPassword) return;
      if (password.length < 8) return;
      signUpMutation.mutate(
        { email: trimmedEmail, password },
        { onSuccess: () => navigate('/dashboard', { replace: true }) }
      );
    } else {
      loginMutation.mutate(
        { email: trimmedEmail, password },
        { onSuccess: () => navigate('/dashboard', { replace: true }) }
      );
    }
  }

  const err = activeError;
  const errorMessage =
    err == null
      ? null
      : typeof (err as { message?: unknown }).message === 'string'
        ? (err as { message: string }).message
        : err instanceof Error
          ? err.message
          : mode === 'login'
            ? 'Sign in failed'
            : 'Sign up failed';

  const showConfirmMismatch = mode === 'signup' && confirmPassword.length > 0 && password !== confirmPassword;
  const showShortPassword = mode === 'signup' && password.length > 0 && password.length < 8;
  const canSubmitSignUp = password.length >= 8 && password === confirmPassword;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 via-gray-50 to-gray-100">
      <div className="w-full max-w-[400px] p-10 bg-white border border-gray-200 rounded-2xl shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="m-0 text-2xl font-semibold tracking-tight text-gray-900">
            AcousticsFX
          </h1>
          <p className="mt-2 text-[0.9375rem] text-gray-500">
            {mode === 'login' ? 'Admin sign in' : 'Create an account'}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {errorMessage && (
            <p className="m-0 py-2.5 px-3.5 text-sm text-red-600 bg-red-50 rounded-lg">
              {errorMessage}
            </p>
          )}
          {showConfirmMismatch && (
            <p className="m-0 py-2.5 px-3.5 text-sm text-red-600 bg-red-50 rounded-lg">
              Passwords do not match
            </p>
          )}
          {showShortPassword && (
            <p className="m-0 py-2.5 px-3.5 text-sm text-amber-500 bg-amber-50 rounded-lg">
              Password must be at least 8 characters
            </p>
          )}
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-600">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@acousticsfx.com"
              autoComplete="email"
              autoFocus
              disabled={isPending}
              className="py-2.5 px-3.5 text-base text-gray-900 bg-gray-50 border border-gray-200 rounded-lg outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 placeholder:text-gray-400 disabled:opacity-60"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-600">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              disabled={isPending}
              className="py-2.5 px-3.5 text-base text-gray-900 bg-gray-50 border border-gray-200 rounded-lg outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 placeholder:text-gray-400 disabled:opacity-60"
            />
          </label>
          {mode === 'signup' && (
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-600">Confirm password</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={isPending}
                className="py-2.5 px-3.5 text-base text-gray-900 bg-gray-50 border border-gray-200 rounded-lg outline-none transition focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 placeholder:text-gray-400 disabled:opacity-60"
              />
            </label>
          )}
          <button
            type="submit"
            disabled={isPending || (mode === 'signup' && !canSubmitSignUp)}
            className="mt-1 py-3 px-5 text-base font-medium text-white bg-accent-600 rounded-lg cursor-pointer transition hover:bg-accent-500 active:bg-accent-700 disabled:opacity-60"
          >
            {mode === 'login'
              ? isPending
                ? 'Signing in…'
                : 'Sign in'
              : isPending
                ? 'Creating account…'
                : 'Create account'}
          </button>
          {mode === 'login' ? (
            <>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="mt-2 text-[0.9375rem] text-primary-400 bg-transparent border-0 cursor-pointer p-0 hover:underline"
              >
                Create an account
              </button>
              <Link
                to="/forgot-password"
                className="mt-1 inline-block text-[0.9375rem] text-primary-400 no-underline hover:underline"
              >
                Forgot password?
              </Link>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setMode('login')}
              className="mt-2 text-[0.9375rem] text-primary-400 bg-transparent border-0 cursor-pointer p-0 hover:underline"
            >
              Already have an account? Sign in
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
