import { useState } from 'react';
import { useProductsList } from '../hooks/useProductsList';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  type ProductItem,
  type SubProduct,
} from '../api/products';
import { useQueryClient } from '@tanstack/react-query';

const emptySubProduct: SubProduct = {
  slug: '',
  title: '',
  description: '',
  image: '',
};

function ProductForm({
  product,
  onSave,
  onCancel,
  isSaving,
  error,
}: {
  product: ProductItem | null;
  onSave: (body: {
    slug: string;
    title: string;
    description: string;
    image: string;
    heroImage?: string;
    subProducts: SubProduct[];
    order: number;
  }) => void;
  onCancel: () => void;
  isSaving: boolean;
  error: string | null;
}) {
  const [slug, setSlug] = useState(product?.slug ?? '');
  const [title, setTitle] = useState(product?.title ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [image, setImage] = useState(product?.image ?? '');
  const [heroImage, setHeroImage] = useState(product?.heroImage ?? '');
  const [order, setOrder] = useState(product?.order ?? 0);
  const [subProducts, setSubProducts] = useState<SubProduct[]>(
    product?.subProducts?.length ? [...product.subProducts] : []
  );

  const addSub = () => {
    setSubProducts((prev) => [...prev, { ...emptySubProduct }]);
  };

  const updateSub = (index: number, field: keyof SubProduct, value: string) => {
    setSubProducts((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const removeSub = (index: number) => {
    setSubProducts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      slug: slug.trim(),
      title: title.trim(),
      description: description.trim(),
      image: image.trim(),
      heroImage: heroImage.trim() || undefined,
      subProducts: subProducts.filter((s) => s.slug.trim()),
      order,
    });
  };

  const inputClass =
    'w-full py-2 px-3 text-secondary-100 bg-secondary-900 border border-secondary-600 rounded-lg outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400/30';
  const labelClass = 'block text-sm font-medium text-secondary-300 mb-1';

  return (
    <section className="mb-6">
      <h2 className="m-0 mb-4 text-base font-semibold text-secondary-300">
        {product ? 'Edit product' : 'Add product'}
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-[640px]">
        <label>
          <span className={labelClass}>Slug</span>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="e.g. wood-acoustic-panel"
            required
            className={inputClass}
          />
        </label>
        <label>
          <span className={labelClass}>Title</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
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
        <label>
          <span className={labelClass}>Image URL</span>
          <input
            type="text"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="/assets/product/..."
            className={inputClass}
          />
        </label>
        <label>
          <span className={labelClass}>Hero image URL (optional)</span>
          <input
            type="text"
            value={heroImage}
            onChange={(e) => setHeroImage(e.target.value)}
            className={inputClass}
          />
        </label>
        <label>
          <span className={labelClass}>Order</span>
          <input
            type="number"
            value={order}
            onChange={(e) => setOrder(Number(e.target.value) || 0)}
            className={inputClass}
          />
        </label>
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-secondary-300">Sub-products</span>
            <button
              type="button"
              onClick={addSub}
              className="py-1 px-2 text-sm text-primary-400 hover:underline"
            >
              Add row
            </button>
          </div>
          {subProducts.map((sub, i) => (
            <div
              key={i}
              className="border border-secondary-600 p-2 mb-2 grid grid-cols-[1fr_1fr_2fr_1fr_auto] gap-2 items-center rounded-lg"
            >
              <input
                placeholder="slug"
                value={sub.slug}
                onChange={(e) => updateSub(i, 'slug', e.target.value)}
                className="py-1 px-2 text-sm bg-secondary-900 border border-secondary-600 rounded text-secondary-100"
              />
              <input
                placeholder="title"
                value={sub.title}
                onChange={(e) => updateSub(i, 'title', e.target.value)}
                className="py-1 px-2 text-sm bg-secondary-900 border border-secondary-600 rounded text-secondary-100"
              />
              <input
                placeholder="description"
                value={sub.description}
                onChange={(e) => updateSub(i, 'description', e.target.value)}
                className="py-1 px-2 text-sm bg-secondary-900 border border-secondary-600 rounded text-secondary-100"
              />
              <input
                placeholder="image URL"
                value={sub.image}
                onChange={(e) => updateSub(i, 'image', e.target.value)}
                className="py-1 px-2 text-sm bg-secondary-900 border border-secondary-600 rounded text-secondary-100"
              />
              <button
                type="button"
                onClick={() => removeSub(i)}
                className="py-1 px-2 text-sm text-red-400 hover:underline"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isSaving || !slug.trim() || !title.trim()}
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

export default function Products() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = useProductsList();
  const [editing, setEditing] = useState<ProductItem | null>(null);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });

  async function handleCreate(body: Parameters<typeof createProduct>[0]) {
    setSaving(true);
    setSaveError(null);
    try {
      await createProduct(body);
      setAdding(false);
      invalidate();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Failed to create');
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(body: Parameters<typeof updateProduct>[1]) {
    if (!editing) return;
    setSaving(true);
    setSaveError(null);
    try {
      await updateProduct(editing._id, body);
      setEditing(null);
      invalidate();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Failed to update');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this product?')) return;
    try {
      await deleteProduct(id);
      invalidate();
      if (editing?._id === id) setEditing(null);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to delete');
    }
  }

  return (
    <div className="min-h-screen flex flex-col text-secondary-100">
      <header className="py-4 px-6 border-b border-secondary-600 flex items-center justify-between">
        <h1 className="m-0 text-xl font-semibold tracking-tight">Products</h1>
        {!adding && !editing && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="py-2 px-4 text-sm font-medium text-white bg-primary-600 border-0 rounded-lg cursor-pointer hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-400"
          >
            Add product
          </button>
        )}
      </header>
      <div className="flex-1 p-6 max-w-6xl mx-auto w-full">
        {adding && (
          <ProductForm
            product={null}
            onSave={handleCreate}
            onCancel={() => { setAdding(false); setSaveError(null); }}
            isSaving={saving}
            error={saveError}
          />
        )}
        {editing && (
          <ProductForm
            product={editing}
            onSave={handleUpdate}
            onCancel={() => { setEditing(null); setSaveError(null); }}
            isSaving={saving}
            error={saveError}
          />
        )}

        <section className="mb-8">
          <h2 className="m-0 mb-4 text-base font-semibold text-secondary-400 uppercase tracking-wider">
            All products
          </h2>
          {isLoading && (
            <p className="m-0 p-6 text-[0.9375rem] text-secondary-400 bg-secondary-800/50 border border-dashed border-secondary-600 rounded-xl">
              Loading…
            </p>
          )}
          {isError && (
            <p className="m-0 p-6 text-[0.9375rem] text-red-400 bg-secondary-800/50 border border-dashed border-secondary-600 rounded-xl">
              {error instanceof Error ? error.message : 'Failed to load products'}
            </p>
          )}
          {data && (
            <div className="overflow-x-auto rounded-xl border border-secondary-600">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-secondary-600">
                    <th className="py-2 px-3">Slug</th>
                    <th className="py-2 px-3">Title</th>
                    <th className="py-2 px-3">Sub-products</th>
                    <th className="py-2 px-3">Order</th>
                    <th className="py-2 px-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item) => (
                    <tr key={item._id} className="border-b border-secondary-700 hover:bg-secondary-800/50 transition-colors">
                      <td className="py-2 px-3 font-mono text-sm">{item.slug}</td>
                      <td className="py-2 px-3">{item.title}</td>
                      <td className="py-2 px-3">{item.subProducts?.length ?? 0}</td>
                      <td className="py-2 px-3">{item.order}</td>
                      <td className="py-2 px-3">
                        <button
                          type="button"
                          onClick={() => setEditing(item)}
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
              No products yet. Run backend seed:products to add defaults, or Add product.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
