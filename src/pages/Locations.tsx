import { useState, useEffect } from 'react';
import { useLocationsList } from '../hooks/useLocationsList';
import {
  createLocation,
  updateLocation,
  deleteLocation,
  type LocationItem,
} from '../api/locations';
import { getContentByKey, updateContent } from '../api/content';
import { useQueryClient } from '@tanstack/react-query';
import Modal from '../components/Modal';

const inputClass =
  'w-full py-2 px-3 text-secondary-100 bg-secondary-900 border border-secondary-600 rounded-lg outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400/30';
const labelClass = 'block text-sm font-medium text-secondary-300 mb-1';

/* ─── Section settings (title + description) ─── */

function SectionSettings() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      getContentByKey('contact.locations.title').catch(() => null),
      getContentByKey('contact.locations.description').catch(() => null),
    ]).then(([t, d]) => {
      if (t) setTitle(t.value);
      if (d) setDescription(d.value);
      setLoaded(true);
    });
  }, []);

  async function handleSave() {
    setSaving(true); setMsg(null);
    try {
      await Promise.all([
        updateContent('contact.locations.title', { value: title.trim(), type: 'text' }),
        updateContent('contact.locations.description', { value: description.trim(), type: 'text' }),
      ]);
      setMsg('Saved!'); setTimeout(() => setMsg(null), 2000);
    } catch (e) { setMsg(e instanceof Error ? e.message : 'Failed'); }
    finally { setSaving(false); }
  }

  if (!loaded) return <p className="text-secondary-400 text-sm">Loading…</p>;

  return (
    <div className="flex flex-col gap-4 p-5 rounded-xl border border-secondary-600 bg-secondary-800/40">
      <h2 className="m-0 text-base font-semibold text-secondary-300 uppercase tracking-wider">Section Settings</h2>
      <label><span className={labelClass}>Section title</span><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} /></label>
      <label><span className={labelClass}>Description</span><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className={`${inputClass} resize-y`} /></label>
      <div className="flex items-center gap-3">
        <button type="button" onClick={handleSave} disabled={saving} className="py-2 px-4 text-sm font-medium text-white bg-primary-600 border-0 rounded-lg cursor-pointer hover:bg-primary-500 disabled:opacity-60">{saving ? 'Saving…' : 'Save settings'}</button>
        {msg && <span className="text-sm text-green-400">{msg}</span>}
      </div>
    </div>
  );
}

/* ─── Location form with dynamic key-value items ─── */

function LocationForm({
  location,
  onSave,
  onCancel,
  isSaving,
  error,
}: {
  location: LocationItem | null;
  onSave: (body: Omit<LocationItem, '_id'>) => void;
  onCancel: () => void;
  isSaving: boolean;
  error: string | null;
}) {
  const [title, setTitle] = useState(location?.title ?? '');
  const [highlight, setHighlight] = useState(location?.highlight ?? false);
  const [items, setItems] = useState<{ label: string; value: string }[]>(
    location?.items ?? [{ label: '', value: '' }]
  );
  const [order, setOrder] = useState(location?.order ?? 0);

  const updateItem = (idx: number, field: 'label' | 'value', val: string) => {
    const next = [...items];
    next[idx] = { ...next[idx], [field]: val };
    setItems(next);
  };

  const addItem = () => setItems([...items, { label: '', value: '' }]);
  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const validItems = items.filter((i) => i.label.trim() && i.value.trim());
        if (validItems.length === 0) return;
        onSave({ title: title.trim(), highlight, items: validItems, order });
      }}
      className="flex flex-col gap-3"
    >
      <label><span className={labelClass}>Title</span><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className={inputClass} /></label>

      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={highlight} onChange={(e) => setHighlight(e.target.checked)} className="rounded border-secondary-500" />
        <span className="text-sm text-secondary-300">Highlighted card (orange border)</span>
      </label>

      <label><span className={labelClass}>Order</span><input type="number" value={order} onChange={(e) => setOrder(Number(e.target.value) || 0)} className={inputClass} /></label>

      <fieldset className="flex flex-col gap-2 border border-secondary-600 rounded-lg p-3">
        <legend className={labelClass}>Details (label → value)</legend>
        {items.map((item, idx) => (
          <div key={idx} className="flex gap-2 items-start">
            <input type="text" value={item.label} onChange={(e) => updateItem(idx, 'label', e.target.value)} placeholder="Label (e.g. Phone)" className={`${inputClass} flex-1`} />
            <input type="text" value={item.value} onChange={(e) => updateItem(idx, 'value', e.target.value)} placeholder="Value" className={`${inputClass} flex-[2]`} />
            {items.length > 1 && (
              <button type="button" onClick={() => removeItem(idx)} className="py-2 px-2 text-red-400 hover:text-red-300 text-sm cursor-pointer">✕</button>
            )}
          </div>
        ))}
        <button type="button" onClick={addItem} className="self-start py-1 px-3 text-sm text-primary-400 hover:underline cursor-pointer">+ Add field</button>
      </fieldset>

      <div className="flex gap-2">
        <button type="submit" disabled={isSaving || !title.trim()} className="py-2 px-4 text-sm font-medium text-white bg-primary-600 border-0 rounded-lg cursor-pointer hover:bg-primary-500 disabled:opacity-60">{isSaving ? 'Saving…' : 'Save'}</button>
        <button type="button" onClick={onCancel} className="py-2 px-4 text-sm font-medium text-secondary-300 bg-transparent border border-secondary-600 rounded-lg cursor-pointer hover:bg-secondary-700">Cancel</button>
      </div>
      {error && <p className="m-0 text-sm text-red-400">{error}</p>}
    </form>
  );
}

/* ─── Main page ─── */

export default function Locations() {
  const qc = useQueryClient();
  const { data, isLoading, isError, error } = useLocationsList();
  const [editing, setEditing] = useState<LocationItem | null>(null);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState<string | null>(null);
  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin', 'locations'] });

  async function handleCreate(body: Omit<LocationItem, '_id'>) {
    setSaving(true); setSaveErr(null);
    try { await createLocation(body); setAdding(false); invalidate(); }
    catch (e) { setSaveErr(e instanceof Error ? e.message : 'Failed'); }
    finally { setSaving(false); }
  }
  async function handleUpdate(body: Omit<LocationItem, '_id'>) {
    if (!editing) return;
    setSaving(true); setSaveErr(null);
    try { await updateLocation(editing._id, body); setEditing(null); invalidate(); }
    catch (e) { setSaveErr(e instanceof Error ? e.message : 'Failed'); }
    finally { setSaving(false); }
  }
  async function handleDelete(id: string) {
    if (!confirm('Delete this location?')) return;
    try { await deleteLocation(id); invalidate(); if (editing?._id === id) setEditing(null); }
    catch (e) { alert(e instanceof Error ? e.message : 'Failed'); }
  }

  return (
    <div className="min-h-screen flex flex-col text-secondary-100">
      <header className="py-4 px-6 border-b border-secondary-600 flex items-center justify-between">
        <h1 className="m-0 text-xl font-semibold tracking-tight">Locations</h1>
        <button type="button" onClick={() => setAdding(true)} className="py-2 px-4 text-sm font-medium text-white bg-primary-600 border-0 rounded-lg cursor-pointer hover:bg-primary-500">Add location</button>
      </header>
      <div className="flex-1 p-6 max-w-6xl mx-auto w-full flex flex-col gap-8">
        <SectionSettings />

        <Modal open={adding} onClose={() => { setAdding(false); setSaveErr(null); }} title="Add location" maxWidth="max-w-lg">
          <LocationForm location={null} onSave={handleCreate} onCancel={() => { setAdding(false); setSaveErr(null); }} isSaving={saving} error={saveErr} />
        </Modal>
        <Modal open={!!editing} onClose={() => { setEditing(null); setSaveErr(null); }} title={editing ? `Edit: ${editing.title}` : ''} maxWidth="max-w-lg">
          {editing && <LocationForm location={editing} onSave={handleUpdate} onCancel={() => { setEditing(null); setSaveErr(null); }} isSaving={saving} error={saveErr} />}
        </Modal>

        {isLoading && <p className="text-secondary-400">Loading…</p>}
        {isError && <p className="text-red-400">{error instanceof Error ? error.message : 'Failed'}</p>}
        {data && data.items.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-secondary-600">
            <table className="w-full border-collapse text-left">
              <thead><tr className="border-b border-secondary-600">
                <th className="py-2 px-3">Title</th>
                <th className="py-2 px-3">Details</th>
                <th className="py-2 px-3">Highlight</th>
                <th className="py-2 px-3">Order</th>
                <th className="py-2 px-3"></th>
              </tr></thead>
              <tbody>
                {data.items.map((loc) => (
                  <tr key={loc._id} className="border-b border-secondary-700 hover:bg-secondary-800/50 transition-colors">
                    <td className="py-2 px-3 font-medium">{loc.title}</td>
                    <td className="py-2 px-3 text-sm text-secondary-400">{loc.items.map((i) => `${i.label}: ${i.value}`).join(' | ')}</td>
                    <td className="py-2 px-3">{loc.highlight ? '⭐' : '—'}</td>
                    <td className="py-2 px-3">{loc.order ?? 0}</td>
                    <td className="py-2 px-3">
                      <button type="button" onClick={() => setEditing(loc)} className="py-1 px-2 text-sm text-primary-400 hover:underline mr-2 cursor-pointer">Edit</button>
                      <button type="button" onClick={() => handleDelete(loc._id)} className="py-1 px-2 text-sm text-red-400 hover:underline cursor-pointer">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {data && data.items.length === 0 && !adding && (
          <p className="m-0 p-6 text-[0.9375rem] text-secondary-400 bg-secondary-800/50 border border-dashed border-secondary-600 rounded-xl">No locations yet.</p>
        )}
      </div>
    </div>
  );
}
