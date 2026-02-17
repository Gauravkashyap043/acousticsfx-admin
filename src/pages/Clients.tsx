import { useState, useEffect } from 'react';
import { useClientsList } from '../hooks/useClientsList';
import {
  createClient,
  updateClient,
  deleteClient,
  type ClientItem,
} from '../api/clients';
import { getContentByKey, updateContent } from '../api/content';
import { useQueryClient } from '@tanstack/react-query';
import Modal from '../components/Modal';
import { ImageUploadField } from '../components/ImageUploadField';

const inputClass =
  'w-full py-2 px-3 text-secondary-100 bg-secondary-900 border border-secondary-600 rounded-lg outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400/30';
const labelClass = 'block text-sm font-medium text-secondary-300 mb-1';

/* ─── Section settings (title + background) via CMS content keys ─── */

function SectionSettings() {
  const [title, setTitle] = useState('');
  const [bgImage, setBgImage] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      getContentByKey('home.clients.title').catch(() => null),
      getContentByKey('home.clients.backgroundImage').catch(() => null),
    ]).then(([t, bg]) => {
      if (t) setTitle(t.value);
      if (bg) setBgImage(bg.value);
      setLoaded(true);
    });
  }, []);

  async function handleSave() {
    setSaving(true);
    setMsg(null);
    try {
      await Promise.all([
        updateContent('home.clients.title', { value: title.trim(), type: 'text' }),
        updateContent('home.clients.backgroundImage', { value: bgImage.trim(), type: 'image' }),
      ]);
      setMsg('Saved!');
      setTimeout(() => setMsg(null), 2000);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  if (!loaded) return <p className="text-secondary-400 text-sm">Loading settings…</p>;

  return (
    <div className="flex flex-col gap-4 p-5 rounded-xl border border-secondary-600 bg-secondary-800/40">
      <h2 className="m-0 text-base font-semibold text-secondary-300 uppercase tracking-wider">
        Section Settings
      </h2>
      <label>
        <span className={labelClass}>Section title</span>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Our Valuable Clients"
          className={inputClass}
        />
      </label>
      <ImageUploadField
        label="Background image"
        hint="Upload or paste URL for the section background."
        value={bgImage}
        onChange={setBgImage}
      />
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="py-2 px-4 text-sm font-medium text-white bg-primary-600 border-0 rounded-lg cursor-pointer hover:bg-primary-500 disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save settings'}
        </button>
        {msg && <span className="text-sm text-green-400">{msg}</span>}
      </div>
    </div>
  );
}

/* ─── Client logo form (add / edit modal) ─── */

function ClientForm({
  client,
  onSave,
  onCancel,
  isSaving,
  error,
}: {
  client: ClientItem | null;
  onSave: (body: { name: string; logo: string; order?: number }) => void;
  onCancel: () => void;
  isSaving: boolean;
  error: string | null;
}) {
  const [name, setName] = useState(client?.name ?? '');
  const [logo, setLogo] = useState(client?.logo ?? '');
  const [order, setOrder] = useState(client?.order ?? 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name: name.trim(), logo: logo.trim(), order });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label>
        <span className={labelClass}>Client name</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Acme Corp"
          required
          className={inputClass}
        />
      </label>
      <ImageUploadField
        label="Logo"
        hint="Upload or paste URL."
        value={logo}
        onChange={setLogo}
      />
      <label>
        <span className={labelClass}>Order</span>
        <input
          type="number"
          value={order}
          onChange={(e) => setOrder(Number(e.target.value) || 0)}
          className={inputClass}
        />
      </label>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSaving || !name.trim() || !logo.trim()}
          className="py-2 px-4 text-sm font-medium text-white bg-primary-600 border-0 rounded-lg cursor-pointer hover:bg-primary-500 disabled:opacity-60"
        >
          {isSaving ? 'Saving…' : 'Save'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="py-2 px-4 text-sm font-medium text-secondary-300 bg-transparent border border-secondary-600 rounded-lg cursor-pointer hover:bg-secondary-700"
        >
          Cancel
        </button>
      </div>
      {error && <p className="m-0 text-sm text-red-400">{error}</p>}
    </form>
  );
}

/* ─── Main page ─── */

export default function Clients() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = useClientsList();
  const [editing, setEditing] = useState<ClientItem | null>(null);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['admin', 'clients'] });

  async function handleCreate(body: Parameters<typeof createClient>[0]) {
    setSaving(true);
    setSaveError(null);
    try {
      await createClient(body);
      setAdding(false);
      invalidate();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Failed to create');
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(body: Parameters<typeof updateClient>[1]) {
    if (!editing) return;
    setSaving(true);
    setSaveError(null);
    try {
      await updateClient(editing._id, body);
      setEditing(null);
      invalidate();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Failed to update');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this client logo?')) return;
    try {
      await deleteClient(id);
      invalidate();
      if (editing?._id === id) setEditing(null);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to delete');
    }
  }

  return (
    <div className="min-h-screen flex flex-col text-secondary-100">
      <header className="py-4 px-6 border-b border-secondary-600 flex items-center justify-between">
        <h1 className="m-0 text-xl font-semibold tracking-tight">Our Clients</h1>
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="py-2 px-4 text-sm font-medium text-white bg-primary-600 border-0 rounded-lg cursor-pointer hover:bg-primary-500"
        >
          Add client logo
        </button>
      </header>

      <div className="flex-1 p-6 max-w-6xl mx-auto w-full flex flex-col gap-8">
        {/* Section settings */}
        <SectionSettings />

        {/* Add / Edit modals */}
        <Modal
          open={adding}
          onClose={() => { setAdding(false); setSaveError(null); }}
          title="Add client logo"
          maxWidth="max-w-lg"
        >
          <ClientForm
            client={null}
            onSave={handleCreate}
            onCancel={() => { setAdding(false); setSaveError(null); }}
            isSaving={saving}
            error={saveError}
          />
        </Modal>
        <Modal
          open={!!editing}
          onClose={() => { setEditing(null); setSaveError(null); }}
          title={editing ? `Edit: ${editing.name}` : ''}
          maxWidth="max-w-lg"
        >
          {editing && (
            <ClientForm
              client={editing}
              onSave={handleUpdate}
              onCancel={() => { setEditing(null); setSaveError(null); }}
              isSaving={saving}
              error={saveError}
            />
          )}
        </Modal>

        {/* Logo list */}
        <section>
          <h2 className="m-0 mb-4 text-base font-semibold text-secondary-400 uppercase tracking-wider">
            Client logos
          </h2>
          {isLoading && (
            <p className="m-0 p-6 text-[0.9375rem] text-secondary-400 bg-secondary-800/50 border border-dashed border-secondary-600 rounded-xl">
              Loading…
            </p>
          )}
          {isError && (
            <p className="m-0 p-6 text-[0.9375rem] text-red-400 bg-secondary-800/50 border border-dashed border-secondary-600 rounded-xl">
              {error instanceof Error ? error.message : 'Failed to load clients'}
            </p>
          )}
          {data && data.items.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-secondary-600">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-secondary-600">
                    <th className="py-2 px-3">Logo</th>
                    <th className="py-2 px-3">Name</th>
                    <th className="py-2 px-3">Order</th>
                    <th className="py-2 px-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item) => (
                    <tr
                      key={item._id}
                      className="border-b border-secondary-700 hover:bg-secondary-800/50 transition-colors"
                    >
                      <td className="py-2 px-3">
                        {item.logo && (
                          <img
                            src={item.logo}
                            alt={item.name}
                            className="h-10 w-auto max-w-[120px] object-contain bg-white rounded p-1"
                          />
                        )}
                      </td>
                      <td className="py-2 px-3">{item.name}</td>
                      <td className="py-2 px-3">{item.order ?? 0}</td>
                      <td className="py-2 px-3">
                        <button
                          type="button"
                          onClick={() => setEditing(item)}
                          className="py-1 px-2 text-sm text-primary-400 hover:underline mr-2 cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item._id)}
                          className="py-1 px-2 text-sm text-red-400 hover:underline cursor-pointer"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {data && data.items.length === 0 && !adding && (
            <p className="m-0 p-6 text-[0.9375rem] text-secondary-400 bg-secondary-800/50 border border-dashed border-secondary-600 rounded-xl">
              No client logos yet. Add one to show on the home page.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
