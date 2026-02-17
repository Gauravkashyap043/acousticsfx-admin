import { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMeQuery } from '../hooks/useMeQuery';
import { ApiError } from '../lib/api';
import {
  LayoutDashboard,
  Users,
  Layers,
  Package,
  Star,
  MessageSquare,
  Mail,
  FileText,
  FileCode,
  Bookmark,
  Calendar,
  Building,
  Handshake,
  Link,
  MapPin,
  HelpCircle,
  Share2,
  LogOut,
  Search,
  Bell,
  Menu,
  X,
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  overview: LayoutDashboard,
  users: Users,
  categories: Layers,
  products: Package,
  testimonials: Star,
  contact: MessageSquare,
  newsletter: Mail,
  blogs: FileText,
  content: FileCode,
  'case-studies': Bookmark,
  events: Calendar,
  clients: Building,
  'trusted-partners': Handshake,
  'footer-links': Link,
  locations: MapPin,
  faqs: HelpCircle,
  'social-links': Share2,
};

const navItems = [
  { to: '/dashboard', key: 'overview', label: 'Dashboard', end: true },
  { to: '/dashboard/users', key: 'users', label: 'Users', end: false },
  { to: '/dashboard/categories', key: 'categories', label: 'Categories', end: false },
  { to: '/dashboard/products', key: 'products', label: 'Products', end: false },
  { to: '/dashboard/testimonials', key: 'testimonials', label: 'Testimonials', end: false },
  { to: '/dashboard/contact', key: 'contact', label: 'Contact Queries', end: false },
  { to: '/dashboard/newsletter', key: 'newsletter', label: 'Newsletter', end: false },
  { to: '/dashboard/blogs', key: 'blogs', label: 'Blogs', end: false },
  { to: '/dashboard/content', key: 'content', label: 'Site Content', end: false },
  { to: '/dashboard/case-studies', key: 'case-studies', label: 'Case Studies', end: false },
  { to: '/dashboard/events', key: 'events', label: 'Events', end: false },
  { to: '/dashboard/clients', key: 'clients', label: 'Our Clients', end: false },
  { to: '/dashboard/trusted-partners', key: 'trusted-partners', label: 'Trusted Partners', end: false },
  { to: '/dashboard/footer-links', key: 'footer-links', label: 'Footer Links', end: false },
  { to: '/dashboard/locations', key: 'locations', label: 'Locations', end: false },
  { to: '/dashboard/faqs', key: 'faqs', label: 'FAQs', end: false },
  { to: '/dashboard/social-links', key: 'social-links', label: 'Social Links', end: false },
] as const;

export default function DashboardLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { data, error } = useMeQuery();
  const allowedTabs = data?.admin?.allowedTabs ?? [];
  const adminName = data?.admin?.email || '';
  const initials = adminName
    .split(/[\s@]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w: string) => w[0]?.toUpperCase())
    .join('');

  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    <div className="min-h-screen flex bg-gray-100">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-white border-r border-gray-200
          transform transition-transform duration-200 ease-in-out
          lg:relative lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-100">
          <span className="text-lg font-bold text-blue-600 tracking-tight">
            Admin Panel
          </span>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 py-4 px-3 overflow-y-auto space-y-1" aria-label="Dashboard navigation">
          {navItems
            .filter((item) => allowedTabs.includes(item.key))
            .map(({ to, key, label, end }) => {
              const Icon = iconMap[key] ?? FileText;
              return (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[0.875rem] font-medium no-underline transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon size={18} strokeWidth={isActive ? 2.25 : 1.75} />
                      {label}
                    </>
                  )}
                </NavLink>
              );
            })}
        </nav>

        <div className="p-3 border-t border-gray-100">
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-[0.875rem] font-medium text-gray-500 bg-transparent border-0 cursor-pointer transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={18} strokeWidth={1.75} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center gap-4 h-16 px-6 bg-white border-b border-gray-200">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1.5 text-gray-500 hover:text-gray-700 -ml-1"
          >
            <Menu size={22} />
          </button>

          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <button
              type="button"
              className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold select-none">
              {initials || '?'}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
