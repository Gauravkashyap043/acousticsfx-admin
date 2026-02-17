import { useState } from 'react';
import { useEventsList } from '../hooks/useEventsList';
import { createEvent, updateEvent, deleteEvent, type EventItem } from '../api/events';
import { useQueryClient } from '@tanstack/react-query';

const inputClass =
  'w-full py-2 px-3 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400/30';
const labelClass = 'block text-sm font-medium text-gray-600 mb-1';

export default function Events() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = useEventsList();
  const [editing, setEditing] = useState<EventItem | null>(null);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [form, setForm] = useState({ slug: '', title: '', description: '', image: '', eventDate: '', location: '' });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });

  const openAdd = () => {
    setAdding(true);
    setEditing(null);
    setForm({ slug: '', title: '', description: '', image: '', eventDate: '', location: '' });
    setSaveError(null);
  };

  const openEdit = (item: EventItem) => {
    setEditing(item);
    setAdding(false);
    setForm({
      slug: item.slug,
      title: item.title,
      description: item.description ?? '',
      image: item.image ?? '',
      eventDate: item.eventDate ? item.eventDate.slice(0, 10) : '',
      location: item.location ?? '',
    });
    setSaveError(null);
  };

  const closeForm = () => {
    setAdding(false);
    setEditing(null);
    setSaveError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    try {
      const body = {
        slug: form.slug.trim(),
        title: form.title.trim(),
        description: form.description.trim(),
        image: form.image.trim(),
        eventDate: form.eventDate || undefined,
        location: form.location.trim() || undefined,
      };
      if (editing) {
        await updateEvent(editing._id, body);
      } else {
        await createEvent(body);
      }
      closeForm();
      invalidate();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this event?')) return;
    try {
      await deleteEvent(id);
      if (editing?._id === id) closeForm();
      invalidate();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to delete');
    }
  };

  return (
    <div className="min-h-screen flex flex-col text-gray-900">
      <header className="py-4 px-6 border-b border-gray-300 flex items-center justify-between">
        <h1 className="m-0 text-xl font-semibold tracking-tight">Events</h1>
        {!adding && !editing && (
          <button
            type="button"
            onClick={openAdd}
            className="py-2 px-4 text-sm font-medium text-white bg-primary-600 border-0 rounded-lg cursor-pointer hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-400"
          >
            Add event
          </button>
        )}
      </header>
      <div className="flex-1 p-6 max-w-6xl mx-auto w-full">
        {(adding || editing) && (
          <section className="mb-6">
            <h2 className="m-0 mb-4 text-base font-semibold text-gray-600">
              {editing ? 'Edit event' : 'Add event'}
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-[560px]">
              <label>
                <span className={labelClass}>Slug</span>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  required
                  className={inputClass}
                />
              </label>
              <label>
                <span className={labelClass}>Title</span>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  required
                  className={inputClass}
                />
              </label>
              <label>
                <span className={labelClass}>Description</span>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className={`${inputClass} resize-y`}
                />
              </label>
              <label>
                <span className={labelClass}>Image URL</span>
                <input
                  type="text"
                  value={form.image}
                  onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                  className={inputClass}
                />
              </label>
              <label>
                <span className={labelClass}>Event date (optional)</span>
                <input
                  type="date"
                  value={form.eventDate}
                  onChange={(e) => setForm((f) => ({ ...f, eventDate: e.target.value }))}
                  className={inputClass}
                />
              </label>
              <label>
                <span className={labelClass}>Location (optional)</span>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                  className={inputClass}
                />
              </label>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={saving || !form.slug.trim() || !form.title.trim()}
                  className="py-2 px-4 text-sm font-medium text-white bg-primary-600 border-0 rounded-lg cursor-pointer hover:bg-primary-700 disabled:opacity-60"
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  className="py-2 px-4 text-sm font-medium text-gray-600 bg-transparent border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
              {saveError && <p className="m-0 text-sm text-red-600">{saveError}</p>}
            </form>
          </section>
        )}

        <section className="mb-8">
          <h2 className="m-0 mb-4 text-base font-semibold text-gray-500 uppercase tracking-wider">
            All events
          </h2>
          {isLoading && (
            <p className="m-0 p-6 text-[0.9375rem] text-gray-500 bg-gray-100 border border-dashed border-gray-300 rounded-xl">
              Loading…
            </p>
          )}
          {isError && (
            <p className="m-0 p-6 text-[0.9375rem] text-red-600 bg-gray-100 border border-dashed border-gray-300 rounded-xl">
              {error instanceof Error ? error.message : 'Failed to load events'}
            </p>
          )}
          {data && (
            <div className="overflow-x-auto rounded-xl border border-gray-300">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="py-2 px-3">Slug</th>
                    <th className="py-2 px-3">Title</th>
                    <th className="py-2 px-3">Date</th>
                    <th className="py-2 px-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item) => (
                    <tr key={item._id} className="border-b border-gray-200 hover:bg-gray-100 transition-colors">
                      <td className="py-2 px-3 font-mono text-sm">{item.slug}</td>
                      <td className="py-2 px-3">{item.title}</td>
                      <td className="py-2 px-3">{item.eventDate ?? '—'}</td>
                      <td className="py-2 px-3">
                        <button
                          type="button"
                          onClick={() => openEdit(item)}
                          className="py-1 px-2 text-sm text-primary-400 hover:underline mr-2"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item._id)}
                          className="py-1 px-2 text-sm text-red-600 hover:underline"
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
            <p className="m-0 p-6 text-[0.9375rem] text-gray-500 bg-gray-100 border border-dashed border-gray-300 rounded-xl">
              No events yet. Add one to get started.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
