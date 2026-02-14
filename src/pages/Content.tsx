import { useState } from 'react';
import './Dashboard.css';
import { useContentList } from '../hooks/useContentList';
import { useUpdateContentMutation } from '../hooks/useUpdateContentMutation';
import type { ContentItem } from '../api/content';

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
    <div className="dashboard-page">
      <header className="dashboard-page-header">
        <h1>Site content</h1>
      </header>
      <div className="dashboard-page-content">
        {editing && (
          <section className="dashboard-section" style={{ marginBottom: '1.5rem' }}>
            <h2>Edit: {editing.key}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '600px' }}>
              <label>
                <span style={{ display: 'block', marginBottom: '0.25rem' }}>Value</span>
                <textarea
                  value={formValue}
                  onChange={(e) => setFormValue(e.target.value)}
                  rows={formType === 'text' ? 4 : 1}
                  style={{ width: '100%', padding: '0.5rem' }}
                />
              </label>
              <label>
                <span style={{ display: 'block', marginBottom: '0.25rem' }}>Type</span>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as 'text' | 'image')}
                  style={{ padding: '0.5rem' }}
                >
                  <option value="text">Text</option>
                  <option value="image">Image (URL)</option>
                </select>
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                  className="dashboard-sidebar-logout"
                  style={{ background: 'var(--color-primary, #2563eb)', color: '#fff', border: 'none', padding: '0.5rem 1rem' }}
                >
                  {updateMutation.isPending ? 'Saving…' : 'Save'}
                </button>
                <button type="button" onClick={cancelEdit}>
                  Cancel
                </button>
              </div>
              {updateMutation.isError && (
                <p style={{ color: 'var(--color-error, #dc2626)' }}>
                  {(updateMutation.error as Error).message}
                </p>
              )}
            </div>
          </section>
        )}

        <section className="dashboard-section">
          <h2>Content keys</h2>
          {isLoading && <p className="dashboard-placeholder">Loading…</p>}
          {isError && (
            <p className="dashboard-placeholder" style={{ color: 'var(--color-error, #dc2626)' }}>
              {error instanceof Error ? error.message : 'Failed to load content'}
            </p>
          )}
          {data && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>
                    <th style={{ padding: '0.5rem 0.75rem' }}>Key</th>
                    <th style={{ padding: '0.5rem 0.75rem' }}>Value (preview)</th>
                    <th style={{ padding: '0.5rem 0.75rem' }}>Type</th>
                    <th style={{ padding: '0.5rem 0.75rem' }}>Updated</th>
                    <th style={{ padding: '0.5rem 0.75rem' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item) => (
                    <tr key={item.key} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '0.5rem 0.75rem', fontFamily: 'monospace' }}>
                        {item.key}
                      </td>
                      <td style={{ padding: '0.5rem 0.75rem', maxWidth: '300px' }}>
                        {truncate(item.value, 60)}
                      </td>
                      <td style={{ padding: '0.5rem 0.75rem' }}>{item.type ?? 'text'}</td>
                      <td style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}>
                        {item.updatedAt
                          ? new Date(item.updatedAt).toLocaleDateString()
                          : '—'}
                      </td>
                      <td style={{ padding: '0.5rem 0.75rem' }}>
                        <button
                          type="button"
                          onClick={() => startEdit(item)}
                          className="dashboard-nav-link"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
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
            <p className="dashboard-placeholder">No content yet. Run backend seed:content to add defaults.</p>
          )}
        </section>
      </div>
    </div>
  );
}
