import { useState } from 'react';
import { useFaqsList } from '../hooks/useFaqsList';
import {
  createFaq,
  updateFaq,
  deleteFaq,
  type FaqItem,
} from '../api/faqs';
import { useQueryClient } from '@tanstack/react-query';
import Modal from '../components/Modal';

const inputClass =
  'w-full py-2 px-3 text-secondary-100 bg-secondary-900 border border-secondary-600 rounded-lg outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400/30';
const labelClass = 'block text-sm font-medium text-secondary-300 mb-1';

/* ─── FAQ form ─── */

function FaqForm({
  faq,
  onSave,
  onCancel,
  isSaving,
  error,
}: {
  faq: FaqItem | null;
  onSave: (body: { question: string; answer: string; order?: number; isPublished?: boolean }) => void;
  onCancel: () => void;
  isSaving: boolean;
  error: string | null;
}) {
  const [question, setQuestion] = useState(faq?.question ?? '');
  const [answer, setAnswer] = useState(faq?.answer ?? '');
  const [order, setOrder] = useState(faq?.order ?? 0);
  const [isPublished, setIsPublished] = useState(faq?.isPublished ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ question: question.trim(), answer: answer.trim(), order, isPublished });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label>
        <span className={labelClass}>Question</span>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g. What services do you offer?"
          required
          className={inputClass}
        />
      </label>
      <label>
        <span className={labelClass}>Answer</span>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Detailed answer…"
          required
          rows={4}
          className={`${inputClass} resize-y`}
        />
      </label>
      <div className="flex gap-4">
        <label className="flex-1">
          <span className={labelClass}>Order</span>
          <input
            type="number"
            value={order}
            onChange={(e) => setOrder(Number(e.target.value) || 0)}
            className={inputClass}
          />
        </label>
        <label className="flex items-end gap-2 pb-2">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="w-4 h-4 accent-primary-500"
          />
          <span className="text-sm text-secondary-300">Published</span>
        </label>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSaving || !question.trim() || !answer.trim()}
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

export default function Faqs() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = useFaqsList();
  const [editing, setEditing] = useState<FaqItem | null>(null);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['admin', 'faqs'] });

  async function handleCreate(body: Parameters<typeof createFaq>[0]) {
    setSaving(true); setSaveError(null);
    try { await createFaq(body); setAdding(false); invalidate(); }
    catch (e) { setSaveError(e instanceof Error ? e.message : 'Failed to create'); }
    finally { setSaving(false); }
  }

  async function handleUpdate(body: Parameters<typeof updateFaq>[1]) {
    if (!editing) return;
    setSaving(true); setSaveError(null);
    try { await updateFaq(editing._id, body); setEditing(null); invalidate(); }
    catch (e) { setSaveError(e instanceof Error ? e.message : 'Failed to update'); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this FAQ?')) return;
    try { await deleteFaq(id); invalidate(); if (editing?._id === id) setEditing(null); }
    catch (e) { alert(e instanceof Error ? e.message : 'Failed to delete'); }
  }

  return (
    <div className="min-h-screen flex flex-col text-secondary-100">
      <header className="py-4 px-6 border-b border-secondary-600 flex items-center justify-between">
        <h1 className="m-0 text-xl font-semibold tracking-tight">FAQs</h1>
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="py-2 px-4 text-sm font-medium text-white bg-primary-600 border-0 rounded-lg cursor-pointer hover:bg-primary-500"
        >
          Add FAQ
        </button>
      </header>

      <div className="flex-1 p-6 max-w-6xl mx-auto w-full flex flex-col gap-8">
        <Modal open={adding} onClose={() => { setAdding(false); setSaveError(null); }} title="Add FAQ" maxWidth="max-w-lg">
          <FaqForm faq={null} onSave={handleCreate} onCancel={() => { setAdding(false); setSaveError(null); }} isSaving={saving} error={saveError} />
        </Modal>
        <Modal open={!!editing} onClose={() => { setEditing(null); setSaveError(null); }} title={editing ? 'Edit FAQ' : ''} maxWidth="max-w-lg">
          {editing && (
            <FaqForm faq={editing} onSave={handleUpdate} onCancel={() => { setEditing(null); setSaveError(null); }} isSaving={saving} error={saveError} />
          )}
        </Modal>

        <section>
          {isLoading && (
            <p className="m-0 p-6 text-[0.9375rem] text-secondary-400 bg-secondary-800/50 border border-dashed border-secondary-600 rounded-xl">Loading…</p>
          )}
          {isError && (
            <p className="m-0 p-6 text-[0.9375rem] text-red-400 bg-secondary-800/50 border border-dashed border-secondary-600 rounded-xl">
              {error instanceof Error ? error.message : 'Failed to load FAQs'}
            </p>
          )}
          {data && data.items.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-secondary-600">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-secondary-600">
                    <th className="py-2 px-3 w-8">#</th>
                    <th className="py-2 px-3">Question</th>
                    <th className="py-2 px-3 w-20">Order</th>
                    <th className="py-2 px-3 w-24">Status</th>
                    <th className="py-2 px-3 w-32"></th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item, idx) => (
                    <tr key={item._id} className="border-b border-secondary-700 hover:bg-secondary-800/50 transition-colors">
                      <td className="py-2 px-3 text-secondary-400">{idx + 1}</td>
                      <td className="py-2 px-3">
                        <p className="m-0 font-medium">{item.question}</p>
                        <p className="m-0 mt-1 text-sm text-secondary-400 line-clamp-2">{item.answer}</p>
                      </td>
                      <td className="py-2 px-3">{item.order ?? 0}</td>
                      <td className="py-2 px-3">
                        <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${item.isPublished !== false ? 'bg-green-900/40 text-green-400' : 'bg-secondary-700 text-secondary-400'}`}>
                          {item.isPublished !== false ? 'Published' : 'Draft'}
                        </span>
                      </td>
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
          {data && data.items.length === 0 && !adding && (
            <p className="m-0 p-6 text-[0.9375rem] text-secondary-400 bg-secondary-800/50 border border-dashed border-secondary-600 rounded-xl">
              No FAQs yet. Add one to show on the home and contact pages.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
