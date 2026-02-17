import { useState } from 'react';
import { useBlogsList } from '../hooks/useBlogsList';
import { createBlog, updateBlog, deleteBlog, type BlogItem } from '../api/blogs';
import { useQueryClient } from '@tanstack/react-query';
import Modal from '../components/Modal';
import { BlogForm } from '../components/BlogForm';
import PageShell from '../components/PageShell';
import { EmptyState, ErrorState, InlineLoader } from '../components/EmptyState';

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
    content: '',
    heroImage: '',
    authorId: '',
    authorName: '',
    authorEmail: '',
    authorImage: '',
    metaDescription: '',
    tags: '',
    isPublished: true,
    publishedAt: '',
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin', 'blogs'] });

  const emptyForm = () => ({
    slug: '', title: '', excerpt: '', content: '', heroImage: '',
    authorId: '', authorName: '', authorEmail: '', authorImage: '', metaDescription: '',
    tags: '', isPublished: true, publishedAt: '',
  });

  const openAdd = () => {
    setAdding(true);
    setEditing(null);
    setForm(emptyForm());
    setSaveError(null);
  };

  const openEdit = (item: BlogItem) => {
    setEditing(item);
    setAdding(false);
    setForm({
      slug: item.slug,
      title: item.title,
      excerpt: item.excerpt ?? '',
      content: item.content ?? '',
      heroImage: item.heroImage ?? '',
      authorId: item.authorId ?? '',
      authorName: item.authorName ?? '',
      authorEmail: item.authorEmail ?? '',
      authorImage: item.authorImage ?? '',
      metaDescription: item.metaDescription ?? '',
      tags: Array.isArray(item.tags) ? item.tags.join(', ') : '',
      isPublished: item.isPublished !== false,
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
      const tags = form.tags.trim() ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : undefined;
      const body: Parameters<typeof updateBlog>[1] = {
        slug: form.slug.trim(),
        title: form.title.trim(),
        excerpt: form.excerpt.trim() || undefined,
        content: form.content.trim() || undefined,
        heroImage: form.heroImage.trim(),
        authorId: form.authorId.trim() || undefined,
        authorName: form.authorName.trim(),
        authorEmail: form.authorEmail.trim() || undefined,
        authorImage: form.authorImage.trim() || undefined,
        metaDescription: form.metaDescription.trim() || undefined,
        tags,
        isPublished: form.isPublished,
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
    <PageShell
      title="Blogs & articles"
      action={
        <button
          type="button"
          onClick={openAdd}
          className="py-2 px-4 text-sm font-medium text-white bg-primary-600 border-0 rounded-lg cursor-pointer hover:bg-primary-700"
        >
          Add blog
        </button>
      }
    >
        <Modal
          open={adding}
          onClose={closeForm}
          title="Add blog"
          maxWidth="max-w-4xl"
        >
          <BlogForm
            form={form}
            setForm={setForm}
            onSubmit={handleSubmit}
            onCancel={closeForm}
            saving={saving}
            saveError={saveError}
            editorKey="new"
            autoSlugFromTitle
          />
        </Modal>

        <Modal
          open={!!editing}
          onClose={closeForm}
          title={editing ? `Edit: ${editing.title}` : ''}
          maxWidth="max-w-4xl"
        >
          {editing && (
            <BlogForm
              form={form}
              setForm={setForm}
              onSubmit={handleSubmit}
              onCancel={closeForm}
              saving={saving}
              saveError={saveError}
              editorKey={editing._id}
              autoSlugFromTitle={false}
            />
          )}
        </Modal>

        <section className="mb-8">
          <h2 className="m-0 mb-4 text-base font-semibold text-gray-500 uppercase tracking-wider">
            All blogs
          </h2>
          {isLoading && <InlineLoader />}
          {isError && <ErrorState message={error instanceof Error ? error.message : 'Failed to load blogs'} />}
          {data && (
            <div className="overflow-x-auto rounded-xl border border-gray-300">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="py-2 px-3">Hero</th>
                    <th className="py-2 px-3">Slug</th>
                    <th className="py-2 px-3">Title</th>
                    <th className="py-2 px-3">Author</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3">Views</th>
                    <th className="py-2 px-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item) => (
                    <tr key={item._id} className="border-b border-gray-200 hover:bg-gray-100 transition-colors">
                      <td className="py-2 px-3">
                        {item.heroImage ? (
                          <img src={item.heroImage} alt={item.title} className="h-10 w-auto max-w-[80px] rounded object-cover" />
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="py-2 px-3 font-mono text-sm">{item.slug}</td>
                      <td className="py-2 px-3">{item.title}</td>
                      <td className="py-2 px-3">{item.authorName}</td>
                      <td className="py-2 px-3">{item.isPublished !== false ? 'Published' : 'Draft'}</td>
                      <td className="py-2 px-3 text-gray-500">{item.views ?? 0}</td>
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
            <EmptyState message="No blogs yet. Add a blog to get started." />
          )}
        </section>
    </PageShell>
  );
}
