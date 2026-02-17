import { useState, useEffect } from 'react';
import { useFooterLinksList } from '../hooks/useFooterLinksList';
import {
  createFooterLink,
  updateFooterLink,
  deleteFooterLink,
  type FooterLinkItem,
} from '../api/footerLinks';
import { getContentByKey, updateContent } from '../api/content';
import { useQueryClient } from '@tanstack/react-query';
import Modal from '../components/Modal';

const inputClass =
  'w-full py-2 px-3 text-secondary-100 bg-secondary-900 border border-secondary-600 rounded-lg outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400/30';
const labelClass = 'block text-sm font-medium text-secondary-300 mb-1';
const SECTIONS: FooterLinkItem['section'][] = ['services', 'resources'];

/* ─── Footer text settings via CMS ─── */

function FooterTextSettings() {
  const keys = ['footer.about', 'footer.copyright', 'footer.contactEmail', 'footer.contactAddress1', 'footer.contactAddress2'];
  const labels: Record<string, string> = {
    'footer.about': 'About text',
    'footer.copyright': 'Copyright text',
    'footer.contactEmail': 'Contact email',
    'footer.contactAddress1': 'Contact address 1',
    'footer.contactAddress2': 'Contact address 2',
  };
  const [vals, setVals] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    Promise.all(keys.map((k) => getContentByKey(k).catch(() => null))).then((results) => {
      const map: Record<string, string> = {};
      results.forEach((r, i) => { if (r) map[keys[i]] = r.value; });
      setVals(map);
      setLoaded(true);
    });
  }, []);

  async function handleSave() {
    setSaving(true); setMsg(null);
    try {
      await Promise.all(keys.map((k) => updateContent(k, { value: (vals[k] ?? '').trim(), type: 'text' })));
      setMsg('Saved!'); setTimeout(() => setMsg(null), 2000);
    } catch (e) { setMsg(e instanceof Error ? e.message : 'Failed to save'); }
    finally { setSaving(false); }
  }

  if (!loaded) return <p className="text-secondary-400 text-sm">Loading…</p>;

  return (
    <div className="flex flex-col gap-4 p-5 rounded-xl border border-secondary-600 bg-secondary-800/40">
      <h2 className="m-0 text-base font-semibold text-secondary-300 uppercase tracking-wider">Footer text settings</h2>
      {keys.map((k) => (
        <label key={k}>
          <span className={labelClass}>{labels[k]}</span>
          <input type="text" value={vals[k] ?? ''} onChange={(e) => setVals({ ...vals, [k]: e.target.value })} className={inputClass} />
        </label>
      ))}
      <div className="flex items-center gap-3">
        <button type="button" onClick={handleSave} disabled={saving} className="py-2 px-4 text-sm font-medium text-white bg-primary-600 border-0 rounded-lg cursor-pointer hover:bg-primary-500 disabled:opacity-60">
          {saving ? 'Saving…' : 'Save settings'}
        </button>
        {msg && <span className="text-sm text-green-400">{msg}</span>}
      </div>
    </div>
  );
}

/* ─── Link form ─── */

function LinkForm({
  link,
  onSave,
  onCancel,
  isSaving,
  error,
}: {
  link: FooterLinkItem | null;
  onSave: (body: Omit<FooterLinkItem, '_id'>) => void;
  onCancel: () => void;
  isSaving: boolean;
  error: string | null;
}) {
  const [section, setSection] = useState<FooterLinkItem['section']>(link?.section ?? 'services');
  const [label, setLabel] = useState(link?.label ?? '');
  const [href, setHref] = useState(link?.href ?? '');
  const [order, setOrder] = useState(link?.order ?? 0);

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave({ section, label: label.trim(), href: href.trim() || undefined, order }); }} className="flex flex-col gap-3">
      <label>
        <span className={labelClass}>Section</span>
        <select value={section} onChange={(e) => setSection(e.target.value as any)} className={inputClass}>
          {SECTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </label>
      <label>
        <span className={labelClass}>Label</span>
        <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} required className={inputClass} />
      </label>
      <label>
        <span className={labelClass}>Link (optional URL / path)</span>
        <input type="text" value={href} onChange={(e) => setHref(e.target.value)} placeholder="/resources/blogs" className={inputClass} />
      </label>
      <label>
        <span className={labelClass}>Order</span>
        <input type="number" value={order} onChange={(e) => setOrder(Number(e.target.value) || 0)} className={inputClass} />
      </label>
      <div className="flex gap-2">
        <button type="submit" disabled={isSaving || !label.trim()} className="py-2 px-4 text-sm font-medium text-white bg-primary-600 border-0 rounded-lg cursor-pointer hover:bg-primary-500 disabled:opacity-60">
          {isSaving ? 'Saving…' : 'Save'}
        </button>
        <button type="button" onClick={onCancel} className="py-2 px-4 text-sm font-medium text-secondary-300 bg-transparent border border-secondary-600 rounded-lg cursor-pointer hover:bg-secondary-700">Cancel</button>
      </div>
      {error && <p className="m-0 text-sm text-red-400">{error}</p>}
    </form>
  );
}

/* ─── Main page ─── */

export default function FooterLinks() {
  const qc = useQueryClient();
  const { data, isLoading, isError, error } = useFooterLinksList();
  const [editing, setEditing] = useState<FooterLinkItem | null>(null);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState<string | null>(null);
  const invalidate = () => qc.invalidateQueries({ queryKey: ['admin', 'footer-links'] });

  async function handleCreate(body: Omit<FooterLinkItem, '_id'>) {
    setSaving(true); setSaveErr(null);
    try { await createFooterLink(body); setAdding(false); invalidate(); }
    catch (e) { setSaveErr(e instanceof Error ? e.message : 'Failed'); }
    finally { setSaving(false); }
  }
  async function handleUpdate(body: Omit<FooterLinkItem, '_id'>) {
    if (!editing) return;
    setSaving(true); setSaveErr(null);
    try { await updateFooterLink(editing._id, body); setEditing(null); invalidate(); }
    catch (e) { setSaveErr(e instanceof Error ? e.message : 'Failed'); }
    finally { setSaving(false); }
  }
  async function handleDelete(id: string) {
    if (!confirm('Delete this link?')) return;
    try { await deleteFooterLink(id); invalidate(); if (editing?._id === id) setEditing(null); }
    catch (e) { alert(e instanceof Error ? e.message : 'Failed'); }
  }

  const renderSection = (sec: 'services' | 'resources') => {
    const items = (data?.items ?? []).filter((i) => i.section === sec);
    return (
      <div key={sec}>
        <h3 className="m-0 mb-3 text-sm font-semibold text-secondary-400 uppercase tracking-wider">{sec === 'services' ? 'Our Services' : 'Resources'}</h3>
        {items.length === 0 && <p className="text-sm text-secondary-500">No items yet.</p>}
        {items.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-secondary-600">
            <table className="w-full border-collapse text-left">
              <thead><tr className="border-b border-secondary-600"><th className="py-2 px-3">Label</th><th className="py-2 px-3">Link</th><th className="py-2 px-3">Order</th><th className="py-2 px-3"></th></tr></thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id} className="border-b border-secondary-700 hover:bg-secondary-800/50 transition-colors">
                    <td className="py-2 px-3">{item.label}</td>
                    <td className="py-2 px-3 text-secondary-400">{item.href || '—'}</td>
                    <td className="py-2 px-3">{item.order ?? 0}</td>
                    <td className="py-2 px-3">
                      <button type="button" onClick={() => setEditing(item)} className="py-1 px-2 text-sm text-primary-400 hover:underline mr-2 cursor-pointer">Edit</button>
                      <button type="button" onClick={() => handleDelete(item._id)} className="py-1 px-2 text-sm text-red-400 hover:underline cursor-pointer">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col text-secondary-100">
      <header className="py-4 px-6 border-b border-secondary-600 flex items-center justify-between">
        <h1 className="m-0 text-xl font-semibold tracking-tight">Footer Links</h1>
        <button type="button" onClick={() => setAdding(true)} className="py-2 px-4 text-sm font-medium text-white bg-primary-600 border-0 rounded-lg cursor-pointer hover:bg-primary-500">Add link</button>
      </header>
      <div className="flex-1 p-6 max-w-6xl mx-auto w-full flex flex-col gap-8">
        <FooterTextSettings />
        <Modal open={adding} onClose={() => { setAdding(false); setSaveErr(null); }} title="Add footer link" maxWidth="max-w-lg">
          <LinkForm link={null} onSave={handleCreate} onCancel={() => { setAdding(false); setSaveErr(null); }} isSaving={saving} error={saveErr} />
        </Modal>
        <Modal open={!!editing} onClose={() => { setEditing(null); setSaveErr(null); }} title={editing ? `Edit: ${editing.label}` : ''} maxWidth="max-w-lg">
          {editing && <LinkForm link={editing} onSave={handleUpdate} onCancel={() => { setEditing(null); setSaveErr(null); }} isSaving={saving} error={saveErr} />}
        </Modal>
        {isLoading && <p className="text-secondary-400">Loading…</p>}
        {isError && <p className="text-red-400">{error instanceof Error ? error.message : 'Failed'}</p>}
        {data && SECTIONS.map(renderSection)}
      </div>
    </div>
  );
}
