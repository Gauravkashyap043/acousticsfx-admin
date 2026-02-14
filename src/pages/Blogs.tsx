import { useState } from 'react';
import { useBlogsList } from '../hooks/useBlogsList';
import { createBlog, updateBlog, deleteBlog, type BlogItem } from '../api/blogs';
import { useQueryClient } from '@tanstack/react-query';

const inputClass =
  'w-full py-2 px-3 text-secondary-100 bg-secondary-900 border border-secondary-600 rounded-lg outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400/30';
const labelClass = 'block text-sm font-medium text-secondary-300 mb-1';

export default function Blogs() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = useBlogsList();
  const [editing, setEditing] = useState<BlogItem | null>(null);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [form, setForm] = useState({
    slug: '',
    title: '',
    excerpt: '',
    heroImage: '',
    authorName: '',
    authorImage: '',
    publishedAt: '',
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin', 'blogs'] });

  const openAdd = () => {
    setAdding(true);
    setEditing(null);
    setForm({ slug: '', title: '', excerpt: '', heroImage: '', authorName: '', authorImage: '', publishedAt: '' });
    setSaveError(null);
  };

  const openEdit = (item: BlogItem) => {
    setEditing(item);
    setAdding(false);
    setForm({
      slug: item.slug,
      title: item.title,
      excerpt: item.excerpt ?? '',
      heroImage: item.heroImage ?? '',
      authorName: item.authorName ?? '',
      authorImage: item.authorImage ?? '',
      publishedAt: item.publishedAt ? item.publishedAt.slice(0, 10) : '',
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
        excerpt: form.excerpt.trim() || undefined,
        heroImage: form.heroImage.trim(),
        authorName: form.authorName.trim(),
        authorImage: form.authorImage.trim() || undefined,
        publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : undefined,
      };
      if (editing) {
        await updateBlog(editing._id, body);
      } else {
        await createBlog(body);
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
    if (!confirm('Delete this blog?')) return;
    try {
      await deleteBlog(id);
      if (editing?._id === id) closeForm();
      invalidate();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to delete');
    }
  };

  return (
    <div className="min-h-screen flex flex-col text-secondary-100">
      <header className="py-4 px-6 border-b border-secondary-600 flex items-center justify-between">
        <h1 className="m-0 text-xl font-semibold tracking-tight">Blogs & articles</h1>
        {!adding && !editing && (
          <button
            type="button"
            onClick={openAdd}
            className="py-2 px-4 text-sm font-medium text-white bg-primary-600 border-0 rounded-lg cursor-pointer hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-400"
          >
            Add blog
          </button>
        )}
      </header>
      <div className="flex-1 p-6 max-w-6xl mx-auto w-full">
        {(adding || editing) && (
          <section className="mb-6">
            <h2 className="m-0 mb-4 text-base font-semibold text-secondary-300">
              {editing ? 'Edit blog' : 'Add blog'}
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
                <span className={labelClass}>Excerpt</span>
                <textarea
                  value={form.excerpt}
                  onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                  rows={2}
                  className={`${inputClass} resize-y`}
                />
              </label>
              <label>
                <span className={labelClass}>Hero image URL</span>
                <input
                  type="text"
                  value={form.heroImage}
                  onChange={(e) => setForm((f) => ({ ...f, heroImage: e.target.value }))}
                  className={inputClass}
                />
              </label>
              <label>
                <span className={labelClass}>Author name</span>
                <input
                  type="text"
                  value={form.authorName}
                  onChange={(e) => setForm((f) => ({ ...f, authorName: e.target.value }))}
                  className={inputClass}
                />
              </label>
              <label>
                <span className={labelClass}>Author image URL (optional)</span>
                <input
                  type="text"
                  value={form.authorImage}
                  onChange={(e) => setForm((f) => ({ ...f, authorImage: e.target.value }))}
                  className={inputClass}
                />
              </label>
              <label>
                <span className={labelClass}>Published date (optional)</span>
                <input
                  type="date"
                  value={form.publishedAt}
                  onChange={(e) => setForm((f) => ({ ...f, publishedAt: e.target.value }))}
                  className={inputClass}
                />
              </label>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={saving || !form.slug.trim() || !form.title.trim()}
                  className="py-2 px-4 text-sm font-medium text-white bg-primary-600 border-0 rounded-lg cursor-pointer hover:bg-primary-500 disabled:opacity-60"
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  className="py-2 px-4 text-sm font-medium text-secondary-300 bg-transparent border border-secondary-600 rounded-lg cursor-pointer hover:bg-secondary-700"
                >
                  Cancel
                </button>
              </div>
              {saveError && <p className="m-0 text-sm text-red-400">{saveError}</p>}
            </form>
          </section>
        )}

        <section className="mb-8">
          <h2 className="m-0 mb-4 text-base font-semibold text-secondary-400 uppercase tracking-wider">
            All blogs
          </h2>
          {isLoading && (
            <p className="m-0 p-6 text-[0.9375rem] text-secondary-400 bg-secondary-800/50 border border-dashed border-secondary-600 rounded-xl">
              Loading…
            </p>
          )}
          {isError && (
            <p className="m-0 p-6 text-[0.9375rem] text-red-400 bg-secondary-800/50 border border-dashed border-secondary-600 rounded-xl">
              {error instanceof Error ? error.message : 'Failed to load blogs'}
            </p>
          )}
          {data && (
            <div className="overflow-x-auto rounded-xl border border-secondary-600">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-secondary-600">
                    <th className="py-2 px-3">Slug</th>
                    <th className="py-2 px-3">Title</th>
                    <th className="py-2 px-3">Author</th>
                    <th className="py-2 px-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item) => (
                    <tr key={item._id} className="border-b border-secondary-700 hover:bg-secondary-800/50 transition-colors">
                      <td className="py-2 px-3 font-mono text-sm">{item.slug}</td>
                      <td className="py-2 px-3">{item.title}</td>
                      <td className="py-2 px-3">{item.authorName}</td>
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
                          className="py-1 px-2 text-sm text-red-400 hover:underline"
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
              No blogs yet. Add a blog to get started.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
