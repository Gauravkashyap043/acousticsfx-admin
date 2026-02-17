import { Outlet, Navigate } from 'react-router-dom';
import { useMeQuery } from '../hooks/useMeQuery';

interface RequireTabProps {
  tabKey: string;
}

/** Renders children only if current admin has access to the given tab; otherwise redirects to dashboard. */
export default function RequireTab({ tabKey }: RequireTabProps) {
  const { data, isLoading } = useMeQuery();
  const allowedTabs = data?.admin?.allowedTabs ?? [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-500">
        Loading…
      </div>
    );
  }

  if (!allowedTabs.includes(tabKey)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
