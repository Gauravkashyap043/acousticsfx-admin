import { useState } from 'react';
import { useAdminsList } from '../hooks/useAdminsList';
import {
  useCreateAdminMutation,
  useUpdateAdminMutation,
  useDeleteAdminMutation,
} from '../hooks/useAdminsMutations';
import { useMeQuery } from '../hooks/useMeQuery';
import type { AdminItem } from '../api/admins';
import { ApiError } from '../lib/api';
import PageLoader from '../components/PageLoader';
import Modal from '../components/Modal';

const ROLES = ['super_admin', 'admin', 'editor'] as const;

const PAGE_SIZE = 10;

function visibleTabsDisplay(admin: AdminItem, tabKeys: string[]): { label: string; tabs: string[] } {
  const tabsWithoutUsers = tabKeys.filter((k) => k !== 'users');
  if (admin.role === 'super_admin') return { label: 'All', tabs: [...tabKeys] };
  if (!admin.visibleTabs?.length) return { label: 'Default', tabs: tabsWithoutUsers };
  if (admin.visibleTabs.length === tabsWithoutUsers.length) return { label: 'Default', tabs: tabsWithoutUsers };
  return { label: `Custom (${admin.visibleTabs.length})`, tabs: admin.visibleTabs };
}

function AddAdminForm({
  tabKeys,
  onSuccess,
  onCancel,
}: {
  tabKeys: string[];
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<string>('admin');
  const [visibleTabs, setVisibleTabs] = useState<string[]>([]);
  const create = useCreateAdminMutation();

  const toggleTab = (key: string) => {
    setVisibleTabs((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    create.mutate(
      {
        email: email.trim(),
        password,
        role: role || undefined,
        visibleTabs: visibleTabs.length > 0 ? visibleTabs : undefined,
      },
      {
        onSuccess: () => {
          onSuccess();
          setEmail('');
          setPassword('');
          setRole('admin');
          setVisibleTabs([]);
        },
      }
    );
  };

  const inputClass =
    'w-full py-2 px-3 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg outline-none focus:border-primary-400';
  const labelClass = 'block text-sm font-medium text-gray-600 mb-1';

  const tabsWithoutUsers = tabKeys.filter((k) => k !== 'users');

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md">
      {create.isError && (
        <p className="m-0 text-sm text-red-600">
          {create.error instanceof ApiError ? create.error.message : 'Failed to create admin'}
        </p>
      )}
      <label>
        <span className={labelClass}>Email</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={inputClass}
        />
      </label>
      <label>
        <span className={labelClass}>Password</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          className={inputClass}
        />
      </label>
      <label>
        <span className={labelClass}>Role</span>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className={inputClass}
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </label>
      <fieldset>
        <legend className={labelClass}>Visible tabs (optional; leave empty for default)</legend>
        <div className="flex flex-wrap gap-3">
          {tabsWithoutUsers.map((key) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={visibleTabs.includes(key)}
                onChange={() => toggleTab(key)}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-600">{key}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={create.isPending}
          className="py-2 px-4 text-sm font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-700 disabled:opacity-50"
        >
          {create.isPending ? 'Adding…' : 'Add admin'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="py-2 px-4 text-sm font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function EditAdminModal({
  admin,
  tabKeys,
  currentAdminId,
  isOnlySuperAdmin,
  onSave,
  onClose,
}: {
  admin: AdminItem;
  tabKeys: string[];
  currentAdminId: string | null;
  isOnlySuperAdmin: boolean;
  onSave: () => void;
  onClose: () => void;
}) {
  const isSelf = currentAdminId === admin.id;
  const [role, setRole] = useState(admin.role);
  const [visibleTabs, setVisibleTabs] = useState<string[]>(
    admin.role === 'super_admin' ? [...tabKeys] : admin.visibleTabs ?? tabKeys.filter((k) => k !== 'users')
  );
  const update = useUpdateAdminMutation();
  const cannotDemoteSuperAdmin = admin.role === 'super_admin' && isOnlySuperAdmin;

  const toggleTab = (key: string) => {
    setVisibleTabs((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tabsToSend = role === 'super_admin' ? undefined : visibleTabs;
    update.mutate(
      { id: admin.id, body: { role, visibleTabs: tabsToSend } },
      { onSuccess: () => onSave() }
    );
  };

  const inputClass =
    'w-full py-2 px-3 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg outline-none focus:border-primary-400';
  const labelClass = 'block text-sm font-medium text-gray-600 mb-1';

  return (
    <Modal open onClose={onClose} title={`Edit ${admin.email}`} maxWidth="max-w-md">
      <div className="flex flex-col gap-4">
        {update.isError && (
          <p className="m-0 mb-3 text-sm text-red-600">
            {update.error instanceof ApiError ? update.error.message : 'Update failed'}
          </p>
        )}
        {isSelf && (
          <p className="m-0 mb-3 text-sm text-amber-600">
            You are editing your own account. Demoting yourself may lock you out.
          </p>
        )}
        {cannotDemoteSuperAdmin && (
          <p className="m-0 mb-3 text-sm text-amber-600">
            At least one super_admin must always exist. Role cannot be changed.
          </p>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label>
            <span className={labelClass}>Role</span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className={inputClass}
              disabled={cannotDemoteSuperAdmin}
              title={cannotDemoteSuperAdmin ? 'At least one super_admin must always exist' : undefined}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
          {role !== 'super_admin' && (
            <fieldset>
              <legend className={labelClass}>Visible tabs</legend>
              <div className="flex flex-wrap gap-3">
                {tabKeys.filter((k) => k !== 'users').map((key) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={visibleTabs.includes(key)}
                      onChange={() => toggleTab(key)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-600">{key}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={update.isPending}
              className="py-2 px-4 text-sm font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {update.isPending ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 text-sm font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

export default function Users() {
  const { data: meData } = useMeQuery();
  const currentAdminId = meData?.admin?.id ?? null;
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useAdminsList({ page, limit: PAGE_SIZE });
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<AdminItem | null>(null);
  const [deleting, setDeleting] = useState<AdminItem | null>(null);

  const deleteMutation = useDeleteAdminMutation();

  const handleDeleteConfirm = (admin: AdminItem) => {
    deleteMutation.mutate(admin.id, {
      onSettled: () => setDeleting(null),
      onError: () => { },
    });
  };

  if (isLoading || !data) {
    return (
      <div className="min-h-screen flex flex-col text-gray-900">
        <header className="py-4 px-6 border-b border-gray-300">
          <h1 className="m-0 text-xl font-semibold tracking-tight">User management</h1>
        </header>
        <PageLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col text-gray-900">
        <header className="py-4 px-6 border-b border-gray-300">
          <h1 className="m-0 text-xl font-semibold tracking-tight">User management</h1>
        </header>
        <div className="flex-1 p-6 text-red-600">
          {error instanceof ApiError ? error.message : 'Failed to load admins'}
        </div>
      </div>
    );
  }

  const { admins, tabKeys, total, totalPages } = data;
  const superAdminCount = admins.filter((a) => a.role === 'super_admin').length;
  const isOnlySuperAdmin = (admin: AdminItem) =>
    admin.role === 'super_admin' && superAdminCount === 1;

  return (
    <div className="min-h-screen flex flex-col text-gray-900">
      <header className="py-4 px-6 border-b border-gray-300 flex items-center justify-between gap-4 flex-wrap">
        <h1 className="m-0 text-xl font-semibold tracking-tight">User management</h1>
        {!showAdd && (
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="py-2 px-4 text-sm font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-700"
          >
            Add admin
          </button>
        )}
      </header>
      <div className="flex-1 p-6 max-w-6xl mx-auto w-full">
        <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add admin" maxWidth="max-w-md">
          <AddAdminForm
            tabKeys={tabKeys}
            onSuccess={() => setShowAdd(false)}
            onCancel={() => setShowAdd(false)}
          />
        </Modal>

        <section>
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Email</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Role</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600 min-w-[200px]">Visible tabs</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => {
                const { label, tabs } = visibleTabsDisplay(admin, tabKeys);
                return (
                  <tr key={admin.id} className="border-b border-gray-200">
                    <td className="py-3 px-4 text-gray-900">{admin.email}</td>
                    <td className="py-3 px-4 text-gray-600">{admin.role}</td>
                    <td className="py-3 px-4 text-gray-600 text-sm">
                      <span className="font-medium text-gray-500">{label}:</span>{' '}
                      <span className="flex flex-wrap gap-1 mt-0.5">
                        {tabs.map((key) => (
                          <span
                            key={key}
                            className="inline-block py-0.5 px-1.5 rounded bg-gray-100 text-gray-700 text-xs"
                          >
                            {key}
                          </span>
                        ))}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setEditing(admin)}
                          className="py-1.5 px-3 text-sm text-primary-400 hover:bg-blue-50 rounded"
                        >
                          Edit
                        </button>
                        {!isOnlySuperAdmin(admin) && (
                          <button
                            type="button"
                            onClick={() => setDeleting(admin)}
                            className="py-1.5 px-3 text-sm text-red-600 hover:bg-red-50 rounded"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between gap-4 flex-wrap">
              <p className="text-sm text-gray-600 m-0">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="py-1.5 px-3 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:pointer-events-none"
                >
                  Previous
                </button>
                <span className="py-1.5 px-2 text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="py-1.5 px-3 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:pointer-events-none"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      {editing && (
        <EditAdminModal
          admin={editing}
          tabKeys={tabKeys}
          currentAdminId={currentAdminId}
          isOnlySuperAdmin={superAdminCount === 1}
          onSave={() => setEditing(null)}
          onClose={() => setEditing(null)}
        />
      )}

      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Delete admin" maxWidth="max-w-sm">
        {deleting && (
          <>
            <p className="m-0 mb-2 text-gray-800">
              Delete <strong>{deleting.email}</strong>? This cannot be undone.
            </p>
            {deleteMutation.isError && (
              <p className="m-0 mb-3 text-sm text-red-600">
                {deleteMutation.error instanceof ApiError
                  ? deleteMutation.error.message
                  : 'Delete failed'}
              </p>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleDeleteConfirm(deleting)}
                disabled={deleteMutation.isPending}
                className="py-2 px-4 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
              </button>
              <button
                type="button"
                onClick={() => setDeleting(null)}
                className="py-2 px-4 text-sm font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
