import { useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMeQuery } from '../hooks/useMeQuery';
import { ApiError } from '../lib/api';
import './DashboardLayout.css';

const navItems = [
  { to: '/dashboard', label: 'Overview', end: true },
  { to: '/dashboard/users', label: 'User management', end: false },
  { to: '/dashboard/categories', label: 'Categories', end: false },
  { to: '/dashboard/products', label: 'Products', end: false },
  { to: '/dashboard/testimonials', label: 'Testimonials', end: false },
  { to: '/dashboard/contact', label: 'Contact details', end: false },
  { to: '/dashboard/blogs', label: 'Blogs & articles', end: false },
  { to: '/dashboard/content', label: 'Site content', end: false },
  { to: '/dashboard/case-studies', label: 'Case studies', end: false },
  { to: '/dashboard/events', label: 'Events', end: false },
] as const;

export default function DashboardLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { error } = useMeQuery();

  useEffect(() => {
    if (error instanceof ApiError && error.status === 401) {
      logout();
      navigate('/', { replace: true });
    }
  }, [error, logout, navigate]);

  function handleLogout() {
    logout();
    navigate('/', { replace: true });
  }

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div className="dashboard-sidebar-brand">
          <span className="dashboard-sidebar-title">AcousticsFX</span>
          <span className="dashboard-sidebar-subtitle">Admin</span>
        </div>
        <nav className="dashboard-nav">
          {navItems.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `dashboard-nav-link ${isActive ? 'dashboard-nav-link--active' : ''}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="dashboard-sidebar-footer">
          <button type="button" className="dashboard-sidebar-logout" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </aside>
      <main className="dashboard-layout-main">
        <Outlet />
      </main>
    </div>
  );
}
