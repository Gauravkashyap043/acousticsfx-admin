import { useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMeQuery } from '../hooks/useMeQuery';
import { ApiError } from '../lib/api';

const navItems = [
  { to: '/dashboard', key: 'overview', label: 'Overview', end: true },
  { to: '/dashboard/users', key: 'users', label: 'User management', end: false },
  { to: '/dashboard/categories', key: 'categories', label: 'Categories', end: false },
  { to: '/dashboard/products', key: 'products', label: 'Products', end: false },
  { to: '/dashboard/testimonials', key: 'testimonials', label: 'Testimonials', end: false },
  { to: '/dashboard/contact', key: 'contact', label: 'Contact details', end: false },
  { to: '/dashboard/newsletter', key: 'newsletter', label: 'Newsletter', end: false },
  { to: '/dashboard/blogs', key: 'blogs', label: 'Blogs & articles', end: false },
  { to: '/dashboard/content', key: 'content', label: 'Site content', end: false },
  { to: '/dashboard/case-studies', key: 'case-studies', label: 'Case studies', end: false },
  { to: '/dashboard/events', key: 'events', label: 'Events', end: false },
  { to: '/dashboard/clients', key: 'clients', label: 'Our Clients', end: false },
  { to: '/dashboard/trusted-partners', key: 'trusted-partners', label: 'Trusted Partners', end: false },
] as const;

export default function DashboardLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { data, error } = useMeQuery();
  const allowedTabs = data?.admin?.allowedTabs ?? [];

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
    <div className="min-h-screen flex bg-secondary-950 text-secondary-100">
      <aside className="w-60 flex-shrink-0 flex flex-col bg-secondary-800/95 border-r border-secondary-600 shadow-xl">
        <div className="py-5 px-6 border-b border-secondary-600">
          <span className="block text-lg font-semibold tracking-tight text-secondary-100">
            AcousticsFX
          </span>
          <span className="block text-xs text-secondary-400 mt-0.5">Admin</span>
        </div>
        <nav className="flex-1 py-3 overflow-y-auto" aria-label="Dashboard navigation">
          {navItems
            .filter((item) => allowedTabs.includes(item.key))
            .map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `block py-2.5 px-6 text-[0.9375rem] no-underline transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-400 ${isActive
                    ? 'text-secondary-100 font-medium bg-primary-500/10 border-r-2 border-primary-400'
                    : 'text-secondary-300 hover:text-secondary-100 hover:bg-secondary-700/50'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
        </nav>
        <div className="py-4 px-6 border-t border-secondary-600">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full py-2.5 px-4 text-sm font-medium text-secondary-400 bg-transparent border border-secondary-600 rounded-lg cursor-pointer transition hover:text-red-400 hover:border-red-400 hover:bg-red-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-400"
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-secondary-900/30">
        <Outlet />
      </main>
    </div>
  );
}
