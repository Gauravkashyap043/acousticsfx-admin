import { useState } from 'react';
import { useProductsList } from '../hooks/useProductsList';
import { useCategoriesList } from '../hooks/useCategoriesList';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  type ProductItem,
  type CreateProductBody,
} from '../api/products';
import { useQueryClient } from '@tanstack/react-query';
import type { CategoryItem } from '../api/categories';
import Modal from '../components/Modal';
import { ImageUploadField } from '../components/ImageUploadField';
import { inputClass, labelClass, cancelBtnClass } from '../lib/styles';
import { slugify } from '../lib/slugify';
import PageShell from '../components/PageShell';
import { EmptyState, ErrorState, InlineLoader } from '../components/EmptyState';
import { Link } from 'react-router-dom';

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="m-0 mt-4 mb-2 text-sm font-semibold text-gray-600 border-b border-gray-200 pb-1 first:mt-0">
      {children}
    </h3>
  );
}

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
  onSave: (body: CreateProductBody) => void;
  onCancel: () => void;
  isSaving: boolean;
  error: string | null;
  hideTitle?: boolean;
}) {
  const [slug] = useState(product?.slug ?? '');
  const [title, setTitle] = useState(product?.title ?? '');
  const isNew = !product?._id;
  const effectiveSlug = isNew ? (slugify(title.trim()) || slug) : slug;
  const [shortDescription, setShortDescription] = useState(product?.shortDescription ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [image, setImage] = useState(product?.image ?? '');
  const [heroImage, setHeroImage] = useState(product?.heroImage ?? '');
  const [categorySlug, setCategorySlug] = useState(product?.categorySlug ?? '');
  const [order, setOrder] = useState(product?.order ?? 0);
  const [panelsSectionTitle, setPanelsSectionTitle] = useState(product?.panelsSectionTitle ?? '');
  const [panelsSectionDescription, setPanelsSectionDescription] = useState(
    product?.panelsSectionDescription ?? ''
  );
  const [metaTitle, setMetaTitle] = useState(product?.metaTitle ?? '');
  const [metaDescription, setMetaDescription] = useState(product?.metaDescription ?? '');
  // Keep sub-products read-only here; managed in Sub-products page.
  const [subProducts] = useState(product?.subProducts?.length ? product.subProducts.map((s) => ({ ...s })) : []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      slug: (isNew ? slugify(title.trim()) : slug).trim(),
      title: title.trim(),
      description: description.trim(),
      image: image.trim(),
      heroImage: heroImage.trim() || undefined,
      subProducts,
      categorySlug: categorySlug.trim() || undefined,
      order,
      panelsSectionTitle: panelsSectionTitle.trim() || undefined,
      panelsSectionDescription: panelsSectionDescription.trim() || undefined,
      shortDescription: shortDescription.trim() || undefined,
      metaTitle: metaTitle.trim() || undefined,
      metaDescription: metaDescription.trim() || undefined,
    });
  };

  return (
    <section className={hideTitle ? undefined : 'mb-6'}>
      {!hideTitle && (
        <h2 className="m-0 mb-4 text-base font-semibold text-gray-600">
          {product ? 'Edit product' : 'Add product'}
        </h2>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-h-[80vh] overflow-y-auto pr-2">
        {product?._id ? (
          <div className="rounded-lg border border-gray-200 bg-white p-3">
            <p className="m-0 text-xs text-gray-500">Product ID</p>
            <p className="m-0 mt-1 font-mono text-sm text-gray-800">{product._id}</p>
            <p className="m-0 mt-2 text-xs text-gray-500">
              Manage sub-products in{' '}
              <Link to={`/dashboard/sub-products?productId=${encodeURIComponent(product._id)}`} className="text-primary-600 hover:underline">
                Sub-products
              </Link>
              .
            </p>
          </div>
        ) : null}
        <SectionHeading>Basic info</SectionHeading>
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
          {isNew && effectiveSlug && (
            <p className="m-0 text-xs text-gray-500">URL slug will be: <span className="font-mono">{effectiveSlug || '…'}</span></p>
          )}
        <label>
          <span className={labelClass}>Short description (optional)</span>
          <input
            type="text"
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            placeholder="Teaser for cards; leave blank to use main description excerpt"
            className={inputClass}
          />
        </label>
        <label>
          <span className={labelClass}>Description</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Full product description for the product page."
            className={`${inputClass} resize-y`}
          />
        </label>

        <SectionHeading>Media</SectionHeading>
        <ImageUploadField
          label="Image"
          hint="Card and listing image. Upload or paste URL."
          value={image}
          onChange={setImage}
        />
        <ImageUploadField
          label="Hero image (optional)"
          hint="Large hero on product page. Upload or paste URL."
          value={heroImage}
          onChange={setHeroImage}
        />

        <SectionHeading>Category & order</SectionHeading>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </label>
          <label>
            <span className={labelClass}>Order</span>
            <input
              type="number"
              value={order}
              onChange={(e) => setOrder(Number(e.target.value) || 0)}
              className={inputClass}
            />
            <p className="m-0 mt-1 text-xs text-gray-500">Lower numbers appear first.</p>
          </label>
        </div>

        <SectionHeading>Panels section (product page)</SectionHeading>
        <label>
          <span className={labelClass}>Panels section title (optional)</span>
          <input
            type="text"
            value={panelsSectionTitle}
            onChange={(e) => setPanelsSectionTitle(e.target.value)}
            placeholder="e.g. OUR ACOUSTIC PANELS"
            className={inputClass}
          />
        </label>
        <label>
          <span className={labelClass}>Panels section description (optional)</span>
          <textarea
            value={panelsSectionDescription}
            onChange={(e) => setPanelsSectionDescription(e.target.value)}
            rows={2}
            placeholder="Intro text above the panel list."
            className={`${inputClass} resize-y`}
          />
        </label>

        <SectionHeading>Sub-products (product details)</SectionHeading>
        <div className="border-t border-gray-200 pt-3">
          <p className="m-0 text-sm text-gray-600">
            Sub-products are managed in the <strong>Sub-products</strong> tab (linked to this product ID).
          </p>
          {subProducts.length > 0 ? (
            <div className="mt-3 overflow-x-auto rounded-lg border border-gray-200 bg-white">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-2 px-3">Sub-product ID</th>
                    <th className="py-2 px-3">Slug</th>
                    <th className="py-2 px-3">Title</th>
                  </tr>
                </thead>
                <tbody>
                  {subProducts.map((s, idx) => (
                    <tr key={`${s.slug}-${idx}`} className="border-b border-gray-100">
                      <td className="py-2 px-3 font-mono text-xs text-gray-600">{(s as any).id ?? '—'}</td>
                      <td className="py-2 px-3 font-mono text-xs">{s.slug}</td>
                      <td className="py-2 px-3">{s.title}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="m-0 mt-2 text-xs text-gray-500">No sub-products yet.</p>
          )}
        </div>

        <SectionHeading>SEO (optional)</SectionHeading>
        <label>
          <span className={labelClass}>Meta title</span>
          <input
            type="text"
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            placeholder="Leave blank to use product title"
            className={inputClass}
          />
        </label>
        <label>
          <span className={labelClass}>Meta description</span>
          <textarea
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            rows={2}
            placeholder="For search results; 150–160 chars recommended."
            className={`${inputClass} resize-y`}
          />
        </label>

        <div className="flex gap-2 pt-2 border-t border-gray-200">
          <button
            type="submit"
            disabled={isSaving || !title.trim() || (isNew ? !slugify(title.trim()) : !slug.trim())}
            className="py-2 px-4 text-sm font-medium text-white bg-primary-600 border-0 rounded-lg cursor-pointer hover:bg-primary-700 disabled:opacity-60"
          >
            {isSaving ? 'Saving…' : 'Save'}
          </button>
          <button type="button" onClick={onCancel} className={cancelBtnClass}>
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

  async function handleCreate(body: CreateProductBody) {
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

  async function handleUpdate(body: CreateProductBody) {
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
        onClose={() => {
          setAdding(false);
          setSaveError(null);
        }}
        title="Add product"
        maxWidth="max-w-3xl"
      >
        <ProductForm
          product={null}
          categories={categoriesData?.items ?? []}
          onSave={handleCreate}
          onCancel={() => {
            setAdding(false);
            setSaveError(null);
          }}
          isSaving={saving}
          error={saveError}
          hideTitle
        />
      </Modal>
      <Modal
        open={!!editing}
        onClose={() => {
          setEditing(null);
          setSaveError(null);
        }}
        title={editing ? `Edit: ${editing.title}` : ''}
        maxWidth="max-w-3xl"
      >
        {editing && (
          <ProductForm
            product={editing}
            categories={categoriesData?.items ?? []}
            onSave={handleUpdate}
            onCancel={() => {
              setEditing(null);
              setSaveError(null);
            }}
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
        {isError && (
          <ErrorState
            message={error instanceof Error ? error.message : 'Failed to load products'}
          />
        )}
        {data && (
          <div className="overflow-x-auto rounded-xl border border-gray-300">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="py-2 px-3">Image</th>
                  <th className="py-2 px-3">Slug</th>
                  <th className="py-2 px-3">Title</th>
                  <th className="py-2 px-3">Category</th>
                  <th className="py-2 px-3">Panels section</th>
                  <th className="py-2 px-3">Sub-products</th>
                  <th className="py-2 px-3">Order</th>
                  <th className="py-2 px-3"></th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item) => (
                  <tr
                    key={item._id}
                    className="border-b border-gray-200 hover:bg-blue-50/60 transition-colors"
                  >
                    <td className="py-2 px-3">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="h-10 w-auto max-w-[80px] rounded object-cover"
                        />
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="py-2 px-3 font-mono text-sm">{item.slug}</td>
                    <td className="py-2 px-3">{item.title}</td>
                    <td className="py-2 px-3 text-gray-500">{item.categorySlug ?? '—'}</td>
                    <td className="py-2 px-3 text-gray-500 text-xs max-w-[120px] truncate">
                      {item.panelsSectionTitle || '—'}
                    </td>
                    <td className="py-2 px-3">{item.subProducts?.length ?? 0}</td>
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
                        className="py-1 px-2 text-sm text-red-600 hover:underline cursor-pointer"
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
          <EmptyState message="No products yet. Run backend seed:products or Add product." />
        )}
      </section>
    </PageShell>
  );
}
