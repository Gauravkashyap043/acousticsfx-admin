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

const ROLES = ['super_admin', 'admin', 'editor'] as const;

function visibleTabsSummary(admin: AdminItem, tabKeys: string[]): string {
  if (admin.role === 'super_admin') return 'All';
  if (!admin.visibleTabs?.length) return 'Default';
  if (admin.visibleTabs.length === tabKeys.filter((k) => k !== 'users').length) return 'Default';
  return `Custom (${admin.visibleTabs.length})`;
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
    'w-full py-2 px-3 text-secondary-100 bg-secondary-900 border border-secondary-600 rounded-lg outline-none focus:border-primary-400';
  const labelClass = 'block text-sm font-medium text-secondary-300 mb-1';

  const tabsWithoutUsers = tabKeys.filter((k) => k !== 'users');

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md">
      <h3 className="m-0 text-base font-semibold text-secondary-200">Add admin</h3>
      {create.isError && (
        <p className="m-0 text-sm text-red-400">
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
                className="rounded border-secondary-500"
              />
              <span className="text-sm text-secondary-300">{key}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={create.isPending}
          className="py-2 px-4 text-sm font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-600 disabled:opacity-50"
        >
          {create.isPending ? 'Adding…' : 'Add admin'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="py-2 px-4 text-sm font-medium text-secondary-300 bg-secondary-800 border border-secondary-600 rounded-lg hover:bg-secondary-700"
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
    'w-full py-2 px-3 text-secondary-100 bg-secondary-900 border border-secondary-600 rounded-lg outline-none focus:border-primary-400';
  const labelClass = 'block text-sm font-medium text-secondary-300 mb-1';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="bg-secondary-800 border border-secondary-600 rounded-xl shadow-xl max-w-md w-full mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="m-0 mb-4 text-base font-semibold text-secondary-200">
          Edit {admin.email}
        </h3>
        {update.isError && (
          <p className="m-0 mb-3 text-sm text-red-400">
            {update.error instanceof ApiError ? update.error.message : 'Update failed'}
          </p>
        )}
        {isSelf && (
          <p className="m-0 mb-3 text-sm text-amber-400">
            You are editing your own account. Demoting yourself may lock you out.
          </p>
        )}
        {cannotDemoteSuperAdmin && (
          <p className="m-0 mb-3 text-sm text-amber-400">
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
                      className="rounded border-secondary-500"
                    />
                    <span className="text-sm text-secondary-300">{key}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={update.isPending}
              className="py-2 px-4 text-sm font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-600 disabled:opacity-50"
            >
              {update.isPending ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 text-sm font-medium text-secondary-300 bg-secondary-700 border border-secondary-600 rounded-lg hover:bg-secondary-600"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Users() {
  const { data: meData } = useMeQuery();
  const currentAdminId = meData?.admin?.id ?? null;
  const { data, isLoading, error } = useAdminsList();
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
      <div className="min-h-screen flex flex-col text-secondary-100">
        <header className="py-4 px-6 border-b border-secondary-600">
          <h1 className="m-0 text-xl font-semibold tracking-tight">User management</h1>
        </header>
        <div className="flex-1 p-6 flex items-center justify-center text-secondary-400">
          Loading…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col text-secondary-100">
        <header className="py-4 px-6 border-b border-secondary-600">
          <h1 className="m-0 text-xl font-semibold tracking-tight">User management</h1>
        </header>
        <div className="flex-1 p-6 text-red-400">
          {error instanceof ApiError ? error.message : 'Failed to load admins'}
        </div>
      </div>
    );
  }

  const { admins, tabKeys } = data;
  const superAdminCount = admins.filter((a) => a.role === 'super_admin').length;
  const isOnlySuperAdmin = (admin: AdminItem) =>
    admin.role === 'super_admin' && superAdminCount === 1;

  return (
    <div className="min-h-screen flex flex-col text-secondary-100">
      <header className="py-4 px-6 border-b border-secondary-600 flex items-center justify-between gap-4 flex-wrap">
        <h1 className="m-0 text-xl font-semibold tracking-tight">User management</h1>
        {!showAdd && (
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="py-2 px-4 text-sm font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-600"
          >
            Add admin
          </button>
        )}
      </header>
      <div className="flex-1 p-6 max-w-6xl mx-auto w-full">
        {showAdd && (
          <section className="mb-8 p-6 bg-secondary-800/50 border border-secondary-600 rounded-xl">
            <AddAdminForm
              tabKeys={tabKeys}
              onSuccess={() => setShowAdd(false)}
              onCancel={() => setShowAdd(false)}
            />
          </section>
        )}

        <section>
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-secondary-600">
                <th className="py-3 px-4 text-sm font-semibold text-secondary-300">Email</th>
                <th className="py-3 px-4 text-sm font-semibold text-secondary-300">Role</th>
                <th className="py-3 px-4 text-sm font-semibold text-secondary-300">Tabs</th>
                <th className="py-3 px-4 text-sm font-semibold text-secondary-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin.id} className="border-b border-secondary-700">
                  <td className="py-3 px-4 text-secondary-100">{admin.email}</td>
                  <td className="py-3 px-4 text-secondary-300">{admin.role}</td>
                  <td className="py-3 px-4 text-secondary-400 text-sm">
                    {visibleTabsSummary(admin, tabKeys)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setEditing(admin)}
                        className="py-1.5 px-3 text-sm text-primary-400 hover:bg-primary-500/10 rounded"
                      >
                        Edit
                      </button>
                      {!isOnlySuperAdmin(admin) && (
                        <button
                          type="button"
                          onClick={() => setDeleting(admin)}
                          className="py-1.5 px-3 text-sm text-red-400 hover:bg-red-500/10 rounded"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

      {deleting && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => setDeleting(null)}
        >
          <div
            className="bg-secondary-800 border border-secondary-600 rounded-xl shadow-xl max-w-sm w-full mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="m-0 mb-2 text-secondary-200">
              Delete <strong>{deleting.email}</strong>? This cannot be undone.
            </p>
            {deleteMutation.isError && (
              <p className="m-0 mb-3 text-sm text-red-400">
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
                className="py-2 px-4 text-sm font-medium text-secondary-300 bg-secondary-700 border border-secondary-600 rounded-lg hover:bg-secondary-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
