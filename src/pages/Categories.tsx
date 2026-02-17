import { useState } from 'react';
import { useCategoriesList } from '../hooks/useCategoriesList';
import {
  createCategory,
  updateCategory,
  deleteCategory,
  type CategoryItem,
} from '../api/categories';
import { useQueryClient } from '@tanstack/react-query';
import Modal from '../components/Modal';
import { ImageUploadField } from '../components/ImageUploadField';

function CategoryForm({
  category,
  onSave,
  onCancel,
  isSaving,
  error,
  hideTitle,
}: {
  category: CategoryItem | null;
  onSave: (body: {
    slug: string;
    name: string;
    description?: string;
    image?: string;
    order: number;
  }) => void;
  onCancel: () => void;
  isSaving: boolean;
  error: string | null;
  hideTitle?: boolean;
}) {
  const [slug, setSlug] = useState(category?.slug ?? '');
  const [name, setName] = useState(category?.name ?? '');
  const [description, setDescription] = useState(category?.description ?? '');
  const [image, setImage] = useState(category?.image ?? '');
  const [order, setOrder] = useState(category?.order ?? 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      slug: slug.trim(),
      name: name.trim(),
      description: description.trim() || undefined,
      image: image.trim() || undefined,
      order,
    });
  };

  const inputClass =
    'w-full py-2 px-3 text-secondary-100 bg-secondary-900 border border-secondary-600 rounded-lg outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400/30';
  const labelClass = 'block text-sm font-medium text-secondary-300 mb-1';

  return (
    <section className={hideTitle ? undefined : 'mb-6'}>
      {!hideTitle && (
        <h2 className="m-0 mb-4 text-base font-semibold text-secondary-300">
          {category ? 'Edit category' : 'Add category'}
        </h2>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label>
          <span className={labelClass}>Slug</span>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="e.g. acoustic"
            required
            className={inputClass}
          />
          <p className="m-0 mt-1 text-xs text-secondary-400">
            Used in URLs: /products/{slug || '…'}
          </p>
        </label>
        <label>
          <span className={labelClass}>Name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Acoustic Solutions"
            required
            className={inputClass}
          />
        </label>
        <label>
          <span className={labelClass}>Description (optional)</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className={`${inputClass} resize-y`}
          />
        </label>
        <ImageUploadField
          label="Image (optional)"
          hint="Upload via ImageKit or paste URL."
          value={image}
          onChange={setImage}
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
            disabled={isSaving || !slug.trim() || !name.trim()}
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
    </section>
  );
}

export default function Categories() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = useCategoriesList();
  const [editing, setEditing] = useState<CategoryItem | null>(null);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });

  async function handleCreate(body: Parameters<typeof createCategory>[0]) {
    setSaving(true);
    setSaveError(null);
    try {
      await createCategory(body);
      setAdding(false);
      invalidate();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Failed to create');
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(body: Parameters<typeof updateCategory>[1]) {
    if (!editing) return;
    setSaving(true);
    setSaveError(null);
    try {
      await updateCategory(editing._id, body);
      setEditing(null);
      invalidate();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Failed to update');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this category? Products in this category will keep their categorySlug but the category will no longer appear in the nav.')) return;
    try {
      await deleteCategory(id);
      invalidate();
      if (editing?._id === id) setEditing(null);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to delete');
    }
  }

  return (
    <div className="min-h-screen flex flex-col text-secondary-100">
      <header className="py-4 px-6 border-b border-secondary-600 flex items-center justify-between">
        <h1 className="m-0 text-xl font-semibold tracking-tight">Categories</h1>
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="py-2 px-4 text-sm font-medium text-white bg-primary-600 border-0 rounded-lg cursor-pointer hover:bg-primary-500"
        >
          Add category
        </button>
      </header>
      <div className="flex-1 p-6 max-w-6xl mx-auto w-full">
        <Modal
          open={adding}
          onClose={() => { setAdding(false); setSaveError(null); }}
          title="Add category"
          maxWidth="max-w-lg"
        >
          <CategoryForm
            category={null}
            onSave={handleCreate}
            onCancel={() => { setAdding(false); setSaveError(null); }}
            isSaving={saving}
            error={saveError}
            hideTitle
          />
        </Modal>
        <Modal
          open={!!editing}
          onClose={() => { setEditing(null); setSaveError(null); }}
          title={editing ? `Edit: ${editing.name}` : ''}
          maxWidth="max-w-lg"
        >
          {editing && (
            <CategoryForm
              category={editing}
              onSave={handleUpdate}
              onCancel={() => { setEditing(null); setSaveError(null); }}
              isSaving={saving}
              error={saveError}
              hideTitle
            />
          )}
        </Modal>

        <section className="mb-8">
          <h2 className="m-0 mb-4 text-base font-semibold text-secondary-400 uppercase tracking-wider">
            All categories
          </h2>
          {isLoading && (
            <p className="m-0 p-6 text-[0.9375rem] text-secondary-400 bg-secondary-800/50 border border-dashed border-secondary-600 rounded-xl">
              Loading…
            </p>
          )}
          {isError && (
            <p className="m-0 p-6 text-[0.9375rem] text-red-400 bg-secondary-800/50 border border-dashed border-secondary-600 rounded-xl">
              {error instanceof Error ? error.message : 'Failed to load categories'}
            </p>
          )}
          {data && (
            <div className="overflow-x-auto rounded-xl border border-secondary-600">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-secondary-600">
                    <th className="py-2 px-3">Slug</th>
                    <th className="py-2 px-3">Name</th>
                    <th className="py-2 px-3">Description</th>
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
                      <td className="py-2 px-3 font-mono text-sm">{item.slug}</td>
                      <td className="py-2 px-3">{item.name}</td>
                      <td className="py-2 px-3 text-secondary-400 max-w-[200px] truncate">
                        {item.description || '—'}
                      </td>
                      <td className="py-2 px-3">{item.order}</td>
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
              No categories yet. Add a category or run backend seed:categories.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
