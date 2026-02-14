import { useState, FormEvent } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLoginMutation } from '../hooks/useLoginMutation';
import './Login.css';

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
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1>AcousticsFX</h1>
          <p>Admin sign in</p>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          {error && <p className="login-error">{error}</p>}
          <label>
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@acousticsfx.com"
              autoComplete="email"
              autoFocus
              disabled={loginMutation.isPending}
            />
          </label>
          <label>
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={loginMutation.isPending}
            />
          </label>
          <button type="submit" className="login-submit" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
