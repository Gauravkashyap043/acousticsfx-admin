import { useAdminsList } from '../hooks/useAdminsList';
import { useBlogsList } from '../hooks/useBlogsList';
import { useProductsList } from '../hooks/useProductsList';
import { useCategoriesList } from '../hooks/useCategoriesList';
import { useTestimonialsList } from '../hooks/useTestimonialsList';
import { useNewsletterSubscriptionsList } from '../hooks/useNewsletterSubscriptionsList';
import { useContactSubmissionsList } from '../hooks/useContactSubmissionsList';
import { useEventsList } from '../hooks/useEventsList';
import { Link } from 'react-router-dom';
import {
  Users,
  Package,
  FileText,
  Mail,
  MessageSquare,
  Layers,
  Star,
  Calendar,
} from 'lucide-react';

function StatCard({
  label,
  value,
  icon: Icon,
  color = 'blue',
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'cyan' | 'rose' | 'amber' | 'teal';
}) {
  const colorMap = {
    blue: 'text-blue-500 bg-blue-50',
    green: 'text-green-500 bg-green-50',
    purple: 'text-purple-500 bg-purple-50',
    orange: 'text-orange-500 bg-orange-50',
    cyan: 'text-cyan-600 bg-cyan-50',
    rose: 'text-rose-500 bg-rose-50',
    amber: 'text-amber-500 bg-amber-50',
    teal: 'text-teal-500 bg-teal-50',
  };
  const colors = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">{label}</span>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colors}`}>
          <Icon size={18} />
        </div>
      </div>
      <span className="text-3xl font-bold text-gray-900">{value}</span>
    </div>
  );
}

export default function DashboardHome() {
  const { data: adminsData } = useAdminsList();
  const { data: productsData } = useProductsList();
  const { data: blogsData } = useBlogsList();
  const { data: categoriesData } = useCategoriesList();
  const { data: testimonialsData } = useTestimonialsList();
  const { data: newsletterData } = useNewsletterSubscriptionsList();
  const { data: contactData } = useContactSubmissionsList();
  const { data: eventsData } = useEventsList();

  const usersCount = adminsData?.total ?? 0;
  const productsCount = productsData?.items?.length ?? 0;
  const blogsCount = blogsData?.items?.length ?? 0;
  const categoriesCount = categoriesData?.items?.length ?? 0;
  const testimonialsCount = testimonialsData?.items?.length ?? 0;
  const newsletterCount = newsletterData?.items?.length ?? 0;
  const contactCount = contactData?.items?.length ?? 0;
  const eventsCount = eventsData?.items?.length ?? 0;

  return (
    <div className="flex flex-col">
      <div className="p-6 max-w-7xl mx-auto w-full">
        <div className="mb-6">
          <h1 className="m-0 text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="m-0 mt-1 text-sm text-gray-500">
            Welcome back! Here's what's happening today.
          </p>
        </div>

        {/* Primary stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <StatCard label="Total Users" value={usersCount} icon={Users} color="blue" />
          <StatCard label="Products" value={productsCount} icon={Package} color="green" />
          <StatCard label="Blogs" value={blogsCount} icon={FileText} color="purple" />
          <StatCard label="Newsletters" value={newsletterCount} icon={Mail} color="cyan" />
          <StatCard label="Contacts" value={contactCount} icon={MessageSquare} color="orange" />
          <StatCard label="Events" value={eventsCount} icon={Calendar} color="rose" />
        </div>

        {/* Secondary stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col items-center gap-2 hover:shadow-md transition-shadow">
            <Layers size={20} className="text-blue-500" />
            <span className="text-xs text-gray-500">Categories</span>
            <span className="text-2xl font-bold text-gray-900">{categoriesCount}</span>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col items-center gap-2 hover:shadow-md transition-shadow">
            <Star size={20} className="text-amber-500" />
            <span className="text-xs text-gray-500">Testimonials</span>
            <span className="text-2xl font-bold text-gray-900">{testimonialsCount}</span>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col items-center gap-2 hover:shadow-md transition-shadow">
            <FileText size={20} className="text-green-500" />
            <span className="text-xs text-gray-500">Published Blogs</span>
            <span className="text-2xl font-bold text-gray-900">
              {blogsData?.items?.filter((b: { isPublished?: boolean }) => b.isPublished !== false).length ?? 0}
            </span>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col items-center gap-2 hover:shadow-md transition-shadow">
            <Users size={20} className="text-purple-500" />
            <span className="text-xs text-gray-500">Active Users</span>
            <span className="text-2xl font-bold text-gray-900">{usersCount}</span>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col items-center gap-2 hover:shadow-md transition-shadow">
            <Calendar size={20} className="text-teal-500" />
            <span className="text-xs text-gray-500">Active Events</span>
            <span className="text-2xl font-bold text-gray-900">{eventsCount}</span>
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="m-0 mb-1 text-base font-semibold text-gray-800">Quick Actions</h2>
          <p className="m-0 mb-4 text-sm text-gray-500">Common administrative tasks</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Link
              to="/dashboard/users"
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-colors no-underline"
            >
              <Users size={18} className="text-gray-400" />
              <div>
                <div className="text-sm font-medium text-gray-800">Add New User</div>
                <div className="text-xs text-gray-400">Create a new user account</div>
              </div>
            </Link>
            <Link
              to="/dashboard/products"
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-colors no-underline"
            >
              <Package size={18} className="text-gray-400" />
              <div>
                <div className="text-sm font-medium text-gray-800">Create Product</div>
                <div className="text-xs text-gray-400">Add a new product to catalog</div>
              </div>
            </Link>
            <Link
              to="/dashboard/blogs"
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-colors no-underline"
            >
              <FileText size={18} className="text-gray-400" />
              <div>
                <div className="text-sm font-medium text-gray-800">Create Blog</div>
                <div className="text-xs text-gray-400">Write a new blog post</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
