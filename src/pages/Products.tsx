import { useRef, useState } from 'react';
import { useProductsList } from '../hooks/useProductsList';
import { useCategoriesList } from '../hooks/useCategoriesList';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  type ProductItem,
  type SubProduct,
} from '../api/products';
import { useQueryClient } from '@tanstack/react-query';
import type { CategoryItem } from '../api/categories';
import Modal from '../components/Modal';
import { ImageUploadField } from '../components/ImageUploadField';
import { uploadImage } from '../api/upload';
import { inputClass, labelClass, cancelBtnClass } from '../lib/styles';
import PageShell from '../components/PageShell';
import { EmptyState, ErrorState, InlineLoader } from '../components/EmptyState';

const emptySubProduct: SubProduct = {
  slug: '',
  title: '',
  description: '',
  image: '',
};

function ProductForm({
  product,
  categories,
  onSave,
  onCancel,
  isSaving,
  error,
  hideTitle,
}: {
  product: ProductItem | null;
  categories: CategoryItem[];
  onSave: (body: {
    slug: string;
    title: string;
    description: string;
    image: string;
    heroImage?: string;
    subProducts: SubProduct[];
    categorySlug?: string;
    order: number;
  }) => void;
  onCancel: () => void;
  isSaving: boolean;
  error: string | null;
  hideTitle?: boolean;
}) {
  const [slug, setSlug] = useState(product?.slug ?? '');
  const [title, setTitle] = useState(product?.title ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [image, setImage] = useState(product?.image ?? '');
  const [heroImage, setHeroImage] = useState(product?.heroImage ?? '');
  const [categorySlug, setCategorySlug] = useState(product?.categorySlug ?? '');
  const [order, setOrder] = useState(product?.order ?? 0);
  const [subProducts, setSubProducts] = useState<SubProduct[]>(
    product?.subProducts?.length ? [...product.subProducts] : []
  );
  const subProductFileRef = useRef<HTMLInputElement>(null);
  const subProductUploadRowRef = useRef<number | null>(null);
  const [subProductUploading, setSubProductUploading] = useState(false);

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

  const handleSubProductFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    const idx = subProductUploadRowRef.current;
    subProductUploadRowRef.current = null;
    if (!file || idx == null) return;
    if (!file.type.startsWith('image/')) {
      alert('Please choose an image (JPEG, PNG, GIF, WebP, or AVIF).');
      return;
    }
    setSubProductUploading(true);
    try {
      const { url } = await uploadImage(file);
      updateSub(idx, 'image', url);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setSubProductUploading(false);
    }
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
      categorySlug: categorySlug.trim() || undefined,
      order,
    });
  };

  return (
    <section className={hideTitle ? undefined : 'mb-6'}>
      {!hideTitle && (
        <h2 className="m-0 mb-4 text-base font-semibold text-gray-600">
          {product ? 'Edit product' : 'Add product'}
        </h2>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
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
        <ImageUploadField
          label="Image"
          hint="Upload via ImageKit or paste URL."
          value={image}
          onChange={setImage}
        />
        <ImageUploadField
          label="Hero image (optional)"
          hint="Upload via ImageKit or paste URL."
          value={heroImage}
          onChange={setHeroImage}
        />
        <label>
          <span className={labelClass}>Category</span>
          <select
            value={categorySlug}
            onChange={(e) => setCategorySlug(e.target.value)}
            className={inputClass}
          >
            <option value="">— None —</option>
            {categories.map((c) => (
              <option key={c._id} value={c.slug}>
                {c.name} ({c.slug})
              </option>
            ))}
          </select>
          <p className="m-0 mt-1 text-xs text-gray-500">
            Assigns product to a category for /products/{categorySlug || '…'} pages.
          </p>
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
            <span className="text-sm text-gray-600">Sub-products</span>
            <button
              type="button"
              onClick={addSub}
              className="py-1 px-2 text-sm text-primary-400 hover:underline"
            >
              Add row
            </button>
          </div>
          <input
            ref={subProductFileRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp,image/avif"
            className="hidden"
            onChange={handleSubProductFile}
          />
          {subProducts.map((sub, i) => (
            <div
              key={i}
              className="border border-gray-300 p-2 mb-2 grid grid-cols-[1fr_1fr_2fr_auto_auto] gap-2 items-center rounded-lg"
            >
              <input
                placeholder="slug"
                value={sub.slug}
                onChange={(e) => updateSub(i, 'slug', e.target.value)}
                className="py-1 px-2 text-sm bg-gray-50 border border-gray-300 rounded text-gray-900"
              />
              <input
                placeholder="title"
                value={sub.title}
                onChange={(e) => updateSub(i, 'title', e.target.value)}
                className="py-1 px-2 text-sm bg-gray-50 border border-gray-300 rounded text-gray-900"
              />
              <input
                placeholder="description"
                value={sub.description}
                onChange={(e) => updateSub(i, 'description', e.target.value)}
                className="py-1 px-2 text-sm bg-gray-50 border border-gray-300 rounded text-gray-900"
              />
              <div className="flex gap-1 items-center flex-wrap">
                {sub.image && (
                  <img src={sub.image} alt="" className="h-8 w-8 rounded object-cover border border-gray-300 shrink-0" />
                )}
                <button
                  type="button"
                  onClick={() => { subProductUploadRowRef.current = i; subProductFileRef.current?.click(); }}
                  disabled={subProductUploading}
                  className="py-1 px-2 text-sm font-medium text-primary-400 hover:underline cursor-pointer disabled:opacity-50"
                >
                  {subProductUploading ? 'Uploading…' : 'Upload'}
                </button>
                <input
                  placeholder="image URL"
                  value={sub.image}
                  onChange={(e) => updateSub(i, 'image', e.target.value)}
                  className="py-1 px-2 text-sm bg-gray-50 border border-gray-300 rounded text-gray-900 flex-1 min-w-0"
                />
              </div>
              <button
                type="button"
                onClick={() => removeSub(i)}
                className="py-1 px-2 text-sm text-red-600 hover:underline cursor-pointer"
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
            className="py-2 px-4 text-sm font-medium text-white bg-primary-600 border-0 rounded-lg cursor-pointer hover:bg-primary-700 disabled:opacity-60"
          >
            {isSaving ? 'Saving…' : 'Save'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className={cancelBtnClass}
          >
            Cancel
          </button>
        </div>
        {error && <p className="m-0 text-sm text-red-600">{error}</p>}
      </form>
    </section>
  );
}

export default function Products() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = useProductsList();
  const { data: categoriesData } = useCategoriesList();
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
    <PageShell
      title="Products"
      action={
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="py-2 px-4 text-sm font-medium text-white bg-primary-600 border-0 rounded-lg cursor-pointer hover:bg-primary-700"
        >
          Add product
        </button>
      }
    >
        <Modal
          open={adding}
          onClose={() => { setAdding(false); setSaveError(null); }}
          title="Add product"
          maxWidth="max-w-2xl"
        >
          <ProductForm
            product={null}
            categories={categoriesData?.items ?? []}
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
          title={editing ? `Edit: ${editing.title}` : ''}
          maxWidth="max-w-2xl"
        >
          {editing && (
            <ProductForm
              product={editing}
              categories={categoriesData?.items ?? []}
              onSave={handleUpdate}
              onCancel={() => { setEditing(null); setSaveError(null); }}
              isSaving={saving}
              error={saveError}
              hideTitle
            />
          )}
        </Modal>

        <section className="mb-8">
          <h2 className="m-0 mb-4 text-base font-semibold text-gray-500 uppercase tracking-wider">
            All products
          </h2>
          {isLoading && <InlineLoader />}
          {isError && <ErrorState message={error instanceof Error ? error.message : 'Failed to load products'} />}
          {data && (
            <div className="overflow-x-auto rounded-xl border border-gray-300">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="py-2 px-3">Image</th>
                    <th className="py-2 px-3">Slug</th>
                    <th className="py-2 px-3">Title</th>
                    <th className="py-2 px-3">Category</th>
                    <th className="py-2 px-3">Sub-products</th>
                    <th className="py-2 px-3">Order</th>
                    <th className="py-2 px-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item) => (
                    <tr key={item._id} className="border-b border-gray-200 hover:bg-gray-100 transition-colors">
                      <td className="py-2 px-3">
                        {item.image ? (
                          <img src={item.image} alt={item.title} className="h-10 w-auto max-w-[80px] rounded object-cover" />
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="py-2 px-3 font-mono text-sm">{item.slug}</td>
                      <td className="py-2 px-3">{item.title}</td>
                      <td className="py-2 px-3 text-gray-500">{item.categorySlug ?? '—'}</td>
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
            <EmptyState message="No products yet. Run backend seed:products to add defaults, or Add product." />
          )}
        </section>
    </PageShell>
  );
}
