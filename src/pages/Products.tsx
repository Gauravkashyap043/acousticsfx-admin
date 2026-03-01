import { useState } from 'react';
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
import { inputClass, labelClass, cancelBtnClass } from '../lib/styles';
import PageShell from '../components/PageShell';
import { EmptyState, ErrorState, InlineLoader } from '../components/EmptyState';

const DEFAULT_PANELS_TITLE = 'OUR ACOUSTIC PANELS';
const DEFAULT_PANELS_DESCRIPTION =
  'A premium workspace faced disruptive noise and poor sound clarity. We designed and installed bespoke acoustic panels tailored to their architecture. The result: enhanced productivity, elegant aesthetics, and a healthier environment. Proof that purposeful design delivers measurable impact.';

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
    panelsSectionTitle?: string;
    panelsSectionDescription?: string;
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
  const [panelsSectionTitle, setPanelsSectionTitle] = useState(
    product?.panelsSectionTitle ?? DEFAULT_PANELS_TITLE
  );
  const [panelsSectionDescription, setPanelsSectionDescription] = useState(
    product?.panelsSectionDescription ?? DEFAULT_PANELS_DESCRIPTION
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      slug: slug.trim(),
      title: title.trim(),
      description: description.trim(),
      image: image.trim(),
      heroImage: heroImage.trim() || undefined,
      subProducts: product?.subProducts ?? [],
      categorySlug: categorySlug.trim() || undefined,
      order,
      panelsSectionTitle: panelsSectionTitle.trim() || undefined,
      panelsSectionDescription: panelsSectionDescription.trim() || undefined,
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
        <label>
          <span className={labelClass}>Panels section title</span>
          <input
            type="text"
            value={panelsSectionTitle}
            onChange={(e) => setPanelsSectionTitle(e.target.value)}
            placeholder={DEFAULT_PANELS_TITLE}
            className={inputClass}
          />
          <p className="m-0 mt-1 text-xs text-gray-500">
            Heading for the &quot;Our Acoustic Panels&quot; block on the product page (e.g. OUR ACOUSTIC PANELS).
          </p>
        </label>
        <label>
          <span className={labelClass}>Panels section description</span>
          <textarea
            value={panelsSectionDescription}
            onChange={(e) => setPanelsSectionDescription(e.target.value)}
            rows={4}
            placeholder={DEFAULT_PANELS_DESCRIPTION}
            className={`${inputClass} resize-y`}
          />
          <p className="m-0 mt-1 text-xs text-gray-500">
            Body copy shown below the title in that section.
          </p>
        </label>
        <p className="m-0 text-xs text-gray-500">
          Manage sub-products (e.g. linearlux, acoperf) from the <strong>Sub-products</strong> section in the sidebar.
        </p>
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
