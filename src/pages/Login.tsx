import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLoginMutation } from '../hooks/useLoginMutation';

export default function Login() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const loginMutation = useLoginMutation();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    loginMutation.mutate(
      { email: email.trim(), password },
      {
        onSuccess: () => navigate('/dashboard', { replace: true }),
      }
    );
  }

  const error = loginMutation.error?.message;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-secondary-900 via-secondary-800 to-secondary-950">
      <div className="w-full max-w-[400px] p-10 bg-secondary-800/90 border border-secondary-600/80 rounded-2xl shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="m-0 text-2xl font-semibold tracking-tight text-secondary-100">
            AcousticsFX
          </h1>
          <p className="mt-2 text-[0.9375rem] text-secondary-400">Admin sign in</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && (
            <p className="m-0 py-2.5 px-3.5 text-sm text-red-500 bg-red-500/10 rounded-lg">
              {error}
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
              disabled={loginMutation.isPending}
              className="py-2.5 px-3.5 text-base text-secondary-100 bg-secondary-950 border border-secondary-600 rounded-lg outline-none transition border-secondary-600 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 placeholder:text-secondary-500 disabled:opacity-60"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-secondary-300">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={loginMutation.isPending}
              className="py-2.5 px-3.5 text-base text-secondary-100 bg-secondary-950 border border-secondary-600 rounded-lg outline-none transition border-secondary-600 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 placeholder:text-secondary-500 disabled:opacity-60"
            />
          </label>
          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="mt-1 py-3 px-5 text-base font-medium text-white bg-accent-600 rounded-lg cursor-pointer transition hover:bg-accent-500 active:bg-accent-700 disabled:opacity-60"
          >
            {loginMutation.isPending ? 'Signing in…' : 'Sign in'}
          </button>
          <Link
            to="/forgot-password"
            className="mt-2 inline-block text-[0.9375rem] text-primary-400 no-underline hover:underline"
          >
            Forgot password?
          </Link>
        </form>
      </div>
    </div>
  );
}
