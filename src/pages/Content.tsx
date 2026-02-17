import { useState } from 'react';
import { useContentList } from '../hooks/useContentList';
import { useUpdateContentMutation } from '../hooks/useUpdateContentMutation';
import type { ContentItem } from '../api/content';

const inputClass =
  'w-full py-2 px-3 text-secondary-100 bg-secondary-900 border border-secondary-600 rounded-lg outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400/30';
const labelClass = 'block text-sm font-medium text-secondary-300 mb-1';
const btnPrimary =
  'py-2 px-4 text-sm font-medium text-white bg-primary-600 border-0 rounded-lg cursor-pointer hover:bg-primary-500 disabled:opacity-60';
const btnSecondary =
  'py-2 px-4 text-sm font-medium text-secondary-300 bg-transparent border border-secondary-600 rounded-lg cursor-pointer hover:bg-secondary-700';

function truncate(s: string, max: number) {
  if (s.length <= max) return s;
  return s.slice(0, max) + '…';
}

export default function Content() {
  const [editing, setEditing] = useState<ContentItem | null>(null);
  const [formValue, setFormValue] = useState('');
  const [formType, setFormType] = useState<'text' | 'image'>('text');

  const { data, isLoading, isError, error } = useContentList({ limit: 100 });
  const updateMutation = useUpdateContentMutation();

  function startEdit(item: ContentItem) {
    setEditing(item);
    setFormValue(item.value);
    setFormType((item.type as 'text' | 'image') || 'text');
  }

  function cancelEdit() {
    setEditing(null);
  }

  async function handleSave() {
    if (!editing) return;
    try {
      await updateMutation.mutateAsync({
        key: editing.key,
        value: formValue,
        type: formType,
      });
      setEditing(null);
    } catch {
      // Error surfaced via mutation
    }
  }

  return (
    <div className="min-h-screen flex flex-col text-secondary-100">
      <header className="py-4 px-6 border-b border-secondary-600">
        <h1 className="m-0 text-xl font-semibold tracking-tight">Site content</h1>
      </header>
      <div className="flex-1 p-6 max-w-6xl mx-auto w-full">
        {editing && (
          <section className="mb-6">
            <h2 className="m-0 mb-4 text-base font-semibold text-secondary-300">
              Edit: {editing.key}
            </h2>
            <div className="flex flex-col gap-3 max-w-[600px]">
              <label>
                <span className={labelClass}>Value</span>
                <textarea
                  value={formValue}
                  onChange={(e) => setFormValue(e.target.value)}
                  rows={formType === 'text' ? 4 : 1}
                  className={`${inputClass} resize-y`}
                />
              </label>
              <label>
                <span className={labelClass}>Type</span>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as 'text' | 'image')}
                  className={inputClass}
                >
                  <option value="text">Text</option>
                  <option value="image">Image (URL)</option>
                </select>
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                  className={btnPrimary}
                >
                  {updateMutation.isPending ? 'Saving…' : 'Save'}
                </button>
                <button type="button" onClick={cancelEdit} className={btnSecondary}>
                  Cancel
                </button>
              </div>
              {updateMutation.isError && (
                <p className="m-0 text-sm text-red-400">
                  {(updateMutation.error as Error).message}
                </p>
              )}
            </div>
          </section>
        )}

        <section className="mb-8">
          <h2 className="m-0 mb-4 text-base font-semibold text-secondary-400 uppercase tracking-wider">
            Content keys
          </h2>
          {isLoading && (
            <p className="m-0 p-6 text-[0.9375rem] text-secondary-400 bg-secondary-800/50 border border-dashed border-secondary-600 rounded-xl">
              Loading…
            </p>
          )}
          {isError && (
            <p className="m-0 p-6 text-[0.9375rem] text-red-400 bg-secondary-800/50 border border-dashed border-secondary-600 rounded-xl">
              {error instanceof Error ? error.message : 'Failed to load content'}
            </p>
          )}
          {data && (
            <div className="overflow-x-auto rounded-xl border border-secondary-600">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-secondary-600">
                    <th className="py-2 px-3">Key</th>
                    <th className="py-2 px-3">Value (preview)</th>
                    <th className="py-2 px-3">Type</th>
                    <th className="py-2 px-3">Updated</th>
                    <th className="py-2 px-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item) => (
                    <tr key={item.key} className="border-b border-secondary-700 hover:bg-secondary-800/50 transition-colors">
                      <td className="py-2 px-3 font-mono text-sm">{item.key}</td>
                      <td className="py-2 px-3 max-w-[300px] truncate">
                        {truncate(item.value, 60)}
                      </td>
                      <td className="py-2 px-3">{item.type ?? 'text'}</td>
                      <td className="py-2 px-3 text-sm">
                        {item.updatedAt
                          ? new Date(item.updatedAt).toLocaleDateString()
                          : '—'}
                      </td>
                      <td className="py-2 px-3">
                        <button
                          type="button"
                          onClick={() => startEdit(item)}
                          className="py-1 px-2 text-sm text-primary-400 hover:underline"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {data && data.items.length === 0 && (
            <p className="m-0 p-6 text-[0.9375rem] text-secondary-400 bg-secondary-800/50 border border-dashed border-secondary-600 rounded-xl">
              No content yet. Run backend seed:content to add defaults.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
