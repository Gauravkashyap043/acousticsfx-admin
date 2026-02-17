import { useState, useEffect } from 'react';
import { useTrustedPartnersList } from '../hooks/useTrustedPartnersList';
import {
  createTrustedPartner,
  updateTrustedPartner,
  deleteTrustedPartner,
  type TrustedPartnerItem,
} from '../api/trustedPartners';
import { getContentByKey, updateContent } from '../api/content';
import { useQueryClient } from '@tanstack/react-query';
import Modal from '../components/Modal';
import { ImageUploadField } from '../components/ImageUploadField';
import { inputClass, labelClass, cancelBtnClass } from '../lib/styles';
import PageShell from '../components/PageShell';
import { EmptyState, CompactLoader } from '../components/EmptyState';

/* ─── Section settings (title + description) via CMS content keys ─── */

function SectionSettings() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      getContentByKey('contact.trustedBy.title').catch(() => null),
      getContentByKey('contact.trustedBy.description').catch(() => null),
    ]).then(([t, d]) => {
      if (t) setTitle(t.value);
      if (d) setDescription(d.value);
      setLoaded(true);
    });
  }, []);

  async function handleSave() {
    setSaving(true);
    setMsg(null);
    try {
      await Promise.all([
        updateContent('contact.trustedBy.title', { value: title.trim(), type: 'text' }),
        updateContent('contact.trustedBy.description', { value: description.trim(), type: 'text' }),
      ]);
      setMsg('Saved!');
      setTimeout(() => setMsg(null), 2000);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  if (!loaded) return <CompactLoader />;

  return (
    <div className="flex flex-col gap-4 p-5 rounded-xl border border-gray-300 bg-blue-50/40">
      <h2 className="m-0 text-base font-semibold text-gray-600 uppercase tracking-wider">
        Section Settings
      </h2>
      <label>
        <span className={labelClass}>Section title</span>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Trusted By Industry Leaders"
          className={inputClass}
        />
      </label>
      <label>
        <span className={labelClass}>Description</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className={`${inputClass} resize-y`}
        />
      </label>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="py-2 px-4 text-sm font-medium text-white bg-primary-600 border-0 rounded-lg cursor-pointer hover:bg-primary-700 disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save settings'}
        </button>
        {msg && <span className="text-sm text-green-600">{msg}</span>}
      </div>
    </div>
  );
}

/* ─── Partner form ─── */

function PartnerForm({
  partner,
  onSave,
  onCancel,
  isSaving,
  error,
}: {
  partner: TrustedPartnerItem | null;
  onSave: (body: { name: string; logo: string; order?: number }) => void;
  onCancel: () => void;
  isSaving: boolean;
  error: string | null;
}) {
  const [name, setName] = useState(partner?.name ?? '');
  const [logo, setLogo] = useState(partner?.logo ?? '');
  const [order, setOrder] = useState(partner?.order ?? 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name: name.trim(), logo: logo.trim(), order });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label>
        <span className={labelClass}>Partner name</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Goldman Sachs"
          required
          className={inputClass}
        />
      </label>
      <ImageUploadField label="Logo" hint="Upload or paste URL." value={logo} onChange={setLogo} />
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
          className="py-2 px-4 text-sm font-medium text-white bg-primary-600 border-0 rounded-lg cursor-pointer hover:bg-primary-700 disabled:opacity-60"
        >
          {isSaving ? 'Saving…' : 'Save'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className={cancelBtnClass}
        >
          Cancel
        </button>
      </div>
      {error && <p className="m-0 text-sm text-red-600">{error}</p>}
    </form>
  );
}

/* ─── Main page ─── */

export default function TrustedPartners() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = useTrustedPartnersList();
  const [editing, setEditing] = useState<TrustedPartnerItem | null>(null);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['admin', 'trusted-partners'] });

  async function handleCreate(body: Parameters<typeof createTrustedPartner>[0]) {
    setSaving(true); setSaveError(null);
    try { await createTrustedPartner(body); setAdding(false); invalidate(); }
    catch (e) { setSaveError(e instanceof Error ? e.message : 'Failed to create'); }
    finally { setSaving(false); }
  }

  async function handleUpdate(body: Parameters<typeof updateTrustedPartner>[1]) {
    if (!editing) return;
    setSaving(true); setSaveError(null);
    try { await updateTrustedPartner(editing._id, body); setEditing(null); invalidate(); }
    catch (e) { setSaveError(e instanceof Error ? e.message : 'Failed to update'); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this partner?')) return;
    try { await deleteTrustedPartner(id); invalidate(); if (editing?._id === id) setEditing(null); }
    catch (e) { alert(e instanceof Error ? e.message : 'Failed to delete'); }
  }

  return (
    <PageShell
      title="Trusted Partners"
      action={
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="py-2 px-4 text-sm font-medium text-white bg-primary-600 border-0 rounded-lg cursor-pointer hover:bg-primary-700"
        >
          Add partner
        </button>
      }
    >
      <div className="flex flex-col gap-8">
        <SectionSettings />

        <Modal open={adding} onClose={() => { setAdding(false); setSaveError(null); }} title="Add partner" maxWidth="max-w-lg">
          <PartnerForm partner={null} onSave={handleCreate} onCancel={() => { setAdding(false); setSaveError(null); }} isSaving={saving} error={saveError} />
        </Modal>
        <Modal open={!!editing} onClose={() => { setEditing(null); setSaveError(null); }} title={editing ? `Edit: ${editing.name}` : ''} maxWidth="max-w-lg">
          {editing && (
            <PartnerForm partner={editing} onSave={handleUpdate} onCancel={() => { setEditing(null); setSaveError(null); }} isSaving={saving} error={saveError} />
          )}
        </Modal>

        <section>
          <h2 className="m-0 mb-4 text-base font-semibold text-gray-500 uppercase tracking-wider">
            Partner logos
          </h2>
          {isLoading && <CompactLoader />}
          {isError && (
            <p className="m-0 p-6 text-[0.9375rem] text-red-600 bg-gray-100 border border-dashed border-gray-300 rounded-xl">
              {error instanceof Error ? error.message : 'Failed to load partners'}
            </p>
          )}
          {data && data.items.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-gray-300">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="py-2 px-3">Logo</th>
                    <th className="py-2 px-3">Name</th>
                    <th className="py-2 px-3">Order</th>
                    <th className="py-2 px-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item) => (
                    <tr key={item._id} className="border-b border-gray-200 hover:bg-blue-50/60 transition-colors">
                      <td className="py-2 px-3">
                        {item.logo && (
                          <img src={item.logo} alt={item.name} className="h-10 w-auto max-w-[120px] object-contain bg-white rounded p-1" />
                        )}
                      </td>
                      <td className="py-2 px-3">{item.name}</td>
                      <td className="py-2 px-3">{item.order ?? 0}</td>
                      <td className="py-2 px-3">
                        <button type="button" onClick={() => setEditing(item)} className="py-1 px-2 text-sm text-primary-400 hover:underline mr-2 cursor-pointer">Edit</button>
                        <button type="button" onClick={() => handleDelete(item._id)} className="py-1 px-2 text-sm text-red-600 hover:underline cursor-pointer">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {data && data.items.length === 0 && !adding && (
            <EmptyState message="No trusted partners yet. Add one to show on the contact page." />
          )}
        </section>
      </div>
    </PageShell>
  );
}
