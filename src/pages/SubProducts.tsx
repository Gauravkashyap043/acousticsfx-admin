import { useRef, useState } from 'react';
import { useProductsList } from '../hooks/useProductsList';
import {
  updateProduct,
  type ProductItem,
  type SubProduct,
  type SubProductGridIntro,
  type SubProductGridImage,
  type SubProductSpec,
  type SubProductGallerySlide,
} from '../api/products';
import { useQueryClient } from '@tanstack/react-query';
import Modal from '../components/Modal';
import { ImageUploadField } from '../components/ImageUploadField';
import { uploadImage } from '../api/upload';
import { inputClass, labelClass, cancelBtnClass, deleteBtnClass } from '../lib/styles';
import PageShell from '../components/PageShell';
import { EmptyState, ErrorState, InlineLoader } from '../components/EmptyState';

const DEFAULT_GRID_IMAGES: SubProductGridImage[] = [
  { url: '', alt: '' },
  { url: '', alt: '' },
  { url: '', alt: '' },
];

type FlatRow = {
  productId: string;
  productSlug: string;
  productTitle: string;
  subIndex: number;
  sub: SubProduct;
};

function flattenSubProducts(products: ProductItem[]): FlatRow[] {
  const rows: FlatRow[] = [];
  for (const p of products) {
    (p.subProducts ?? []).forEach((sub, i) => {
      rows.push({ productId: p._id, productSlug: p.slug, productTitle: p.title, subIndex: i, sub });
    });
  }
  return rows;
}

function SubProductForm({
  products,
  productId,
  subProduct,
  subIndex,
  onSave,
  onCancel,
  isSaving,
  error,
  hideTitle,
}: {
  products: ProductItem[];
  productId: string;
  subProduct: SubProduct | null;
  subIndex: number | null;
  onSave: (productId: string, sub: SubProduct, subIndex: number | null) => void;
  onCancel: () => void;
  isSaving: boolean;
  error: string | null;
  hideTitle?: boolean;
}) {
  const [selectedProductId, setSelectedProductId] = useState(productId || (products[0]?._id ?? ''));
  const [slug, setSlug] = useState(subProduct?.slug ?? '');
  const [title, setTitle] = useState(subProduct?.title ?? '');
  const [description, setDescription] = useState(subProduct?.description ?? '');
  const [image, setImage] = useState(subProduct?.image ?? '');
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const [gridIntroTitle, setGridIntroTitle] = useState(subProduct?.gridIntro?.title ?? '');
  const [gridIntroSubtitle, setGridIntroSubtitle] = useState(subProduct?.gridIntro?.subtitle ?? '');
  const [gridIntroBody, setGridIntroBody] = useState(subProduct?.gridIntro?.body ?? '');
  const [gridImages, setGridImages] = useState<SubProductGridImage[]>(
    subProduct?.gridImages?.length
      ? [...subProduct.gridImages]
      : DEFAULT_GRID_IMAGES.map(({ url, alt }) => ({ url: url || '', alt: alt || '' }))
  );
  const [specDescription, setSpecDescription] = useState(subProduct?.specDescription ?? '');
  const [specs, setSpecs] = useState<SubProductSpec[]>(
    subProduct?.specs?.length ? [...subProduct.specs] : [{ label: '', value: '' }]
  );
  const [gallerySlides, setGallerySlides] = useState<SubProductGallerySlide[]>(
    subProduct?.gallerySlides?.length ? [...subProduct.gallerySlides] : []
  );

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !file.type.startsWith('image/')) {
      if (file) alert('Please choose an image.');
      return;
    }
    setUploading(true);
    try {
      const { url } = await uploadImage(file);
      setImage(url);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const setGridImage = (i: number, field: 'url' | 'alt', value: string) => {
    setGridImages((prev) => {
      const next = [...prev];
      if (!next[i]) next[i] = { url: '', alt: '' };
      next[i] = { ...next[i], [field]: value };
      return next;
    });
  };

  const addSpec = () => setSpecs((prev) => [...prev, { label: '', value: '' }]);
  const removeSpec = (i: number) => setSpecs((prev) => prev.filter((_, idx) => idx !== i));
  const setSpec = (i: number, field: 'label' | 'value', value: string) => {
    setSpecs((prev) => {
      const next = [...prev];
      if (!next[i]) next[i] = { label: '', value: '' };
      next[i] = { ...next[i], [field]: value };
      return next;
    });
  };

  const addGallerySlide = () => setGallerySlides((prev) => [...prev, { large: '', small: '' }]);
  const removeGallerySlide = (i: number) => setGallerySlides((prev) => prev.filter((_, idx) => idx !== i));
  const setGallerySlide = (i: number, field: 'large' | 'small', value: string) => {
    setGallerySlides((prev) => {
      const next = [...prev];
      if (!next[i]) next[i] = { large: '', small: '' };
      next[i] = { ...next[i], [field]: value };
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sub: SubProduct = {
      slug: slug.trim(),
      title: title.trim(),
      description: description.trim(),
      image: image.trim(),
    };
    if (gridIntroTitle || gridIntroSubtitle || gridIntroBody) {
      sub.gridIntro = { title: gridIntroTitle || undefined, subtitle: gridIntroSubtitle || undefined, body: gridIntroBody || undefined };
    }
    const validGridImages = gridImages.filter((g) => g.url.trim());
    if (validGridImages.length) sub.gridImages = validGridImages;
    if (specDescription.trim()) sub.specDescription = specDescription.trim();
    const validSpecs = specs.filter((s) => s.label.trim() || s.value.trim());
    if (validSpecs.length) sub.specs = validSpecs;
    const validSlides = gallerySlides.filter((s) => s.large.trim() && s.small.trim());
    if (validSlides.length) sub.gallerySlides = validSlides;
    onSave(selectedProductId, sub, subIndex);
  };

  return (
    <section className={hideTitle ? undefined : 'mb-6'}>
      {!hideTitle && (
        <h2 className="m-0 mb-4 text-base font-semibold text-gray-600">
          {subProduct ? 'Edit sub-product' : 'Add sub-product'}
        </h2>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label>
          <span className={labelClass}>Product</span>
          {products.length === 0 && (
            <p className="m-0 mb-2 text-sm text-amber-600">Create a product first on the Products page.</p>
          )}
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className={inputClass}
            required
            disabled={!!subProduct || products.length === 0}
          >
            <option value="">— Select product —</option>
            {products.map((p) => (
              <option key={p._id} value={p._id}>
                {p.title} ({p.slug})
              </option>
            ))}
          </select>
          {subProduct && <p className="m-0 mt-1 text-xs text-gray-500">Product cannot be changed when editing.</p>}
        </label>
        <label>
          <span className={labelClass}>Slug</span>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="e.g. linearlux"
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
        <div>
          <span className={labelClass}>Image</span>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp,image/avif"
            className="hidden"
            onChange={handleFile}
          />
          <div className="flex gap-2 items-center flex-wrap mt-1">
            {image && (
              <img src={image} alt="" className="h-10 w-10 rounded object-cover border border-gray-300 shrink-0" />
            )}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="py-1 px-2 text-sm font-medium text-primary-400 hover:underline cursor-pointer disabled:opacity-50"
            >
              {uploading ? 'Uploading…' : 'Upload'}
            </button>
            <input
              type="text"
              placeholder="Or paste image URL"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className={`${inputClass} flex-1 min-w-0 max-w-md`}
            />
          </div>
        </div>

        <details className="border border-gray-200 rounded-lg">
          <summary className="px-3 py-2 cursor-pointer font-medium text-gray-700 bg-gray-50 rounded-t-lg hover:bg-gray-100">
            Page content (hero, grid, spec, gallery)
          </summary>
          <div className="p-3 pt-0 flex flex-col gap-4 border-t border-gray-200">
            <div>
              <span className={labelClass}>Grid section — intro (optional)</span>
              <div className="grid grid-cols-1 gap-2">
                <input
                  type="text"
                  value={gridIntroTitle}
                  onChange={(e) => setGridIntroTitle(e.target.value)}
                  placeholder="Intro title (e.g. NEW DESIGNS)"
                  className={inputClass}
                />
                <input
                  type="text"
                  value={gridIntroSubtitle}
                  onChange={(e) => setGridIntroSubtitle(e.target.value)}
                  placeholder="Intro subtitle (e.g. LINEARLUX)"
                  className={inputClass}
                />
                <textarea
                  value={gridIntroBody}
                  onChange={(e) => setGridIntroBody(e.target.value)}
                  placeholder="Intro body text"
                  rows={2}
                  className={`${inputClass} resize-y`}
                />
              </div>
            </div>
            <div>
              <span className={labelClass}>Grid section — images (up to 3, order: right small, left small, right big)</span>
              {[0, 1, 2].map((i) => (
                <div key={i} className="mt-2 flex flex-col gap-1">
                  <ImageUploadField
                    label={`Image ${i + 1}`}
                    value={gridImages[i]?.url ?? ''}
                    onChange={(url) => setGridImage(i, 'url', url)}
                  />
                  <input
                    type="text"
                    value={gridImages[i]?.alt ?? ''}
                    onChange={(e) => setGridImage(i, 'alt', e.target.value)}
                    placeholder={`Alt text for image ${i + 1}`}
                    className={inputClass}
                  />
                </div>
              ))}
            </div>
            <div>
              <span className={labelClass}>Spec section — description</span>
              <textarea
                value={specDescription}
                onChange={(e) => setSpecDescription(e.target.value)}
                placeholder="Long description above the spec grid"
                rows={3}
                className={`${inputClass} resize-y`}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className={labelClass}>Spec section — rows (label / value)</span>
                <button type="button" onClick={addSpec} className="text-sm text-primary-600 hover:underline">
                  + Add row
                </button>
              </div>
              {specs.map((spec, i) => (
                <div key={i} className="flex gap-2 items-start mb-2">
                  <input
                    type="text"
                    value={spec.label}
                    onChange={(e) => setSpec(i, 'label', e.target.value)}
                    placeholder="Label"
                    className={`${inputClass} flex-1`}
                  />
                  <input
                    type="text"
                    value={spec.value}
                    onChange={(e) => setSpec(i, 'value', e.target.value)}
                    placeholder="Value"
                    className={`${inputClass} flex-1`}
                  />
                  <button type="button" onClick={() => removeSpec(i)} className={deleteBtnClass}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className={labelClass}>Gallery — slides (large + small image per slide)</span>
                <button type="button" onClick={addGallerySlide} className="text-sm text-primary-600 hover:underline">
                  + Add slide
                </button>
              </div>
              {gallerySlides.map((slide, i) => (
                <div key={i} className="p-2 border border-gray-200 rounded mb-2 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Slide {i + 1}</span>
                    <button type="button" onClick={() => removeGallerySlide(i)} className={deleteBtnClass}>
                      Remove
                    </button>
                  </div>
                  <ImageUploadField
                    label="Large image"
                    value={slide.large}
                    onChange={(url) => setGallerySlide(i, 'large', url)}
                  />
                  <ImageUploadField
                    label="Small image"
                    value={slide.small}
                    onChange={(url) => setGallerySlide(i, 'small', url)}
                  />
                </div>
              ))}
            </div>
          </div>
        </details>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isSaving || !slug.trim() || !title.trim() || !selectedProductId}
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

export default function SubProducts() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = useProductsList();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<FlatRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
  const products = data?.items ?? [];
  const rows = flattenSubProducts(products);

  async function handleSave(productId: string, sub: SubProduct, subIndex: number | null) {
    const product = products.find((p) => p._id === productId);
    if (!product) return;
    setSaving(true);
    setSaveError(null);
    try {
      let nextSubs: SubProduct[];
      if (subIndex !== null) {
        nextSubs = (product.subProducts ?? []).map((s, i) => (i === subIndex ? sub : s));
      } else {
        nextSubs = [...(product.subProducts ?? []), sub];
      }
      await updateProduct(productId, {
        slug: product.slug,
        title: product.title,
        description: product.description,
        image: product.image,
        heroImage: product.heroImage,
        subProducts: nextSubs,
        categorySlug: product.categorySlug,
        order: product.order ?? 0,
        panelsSectionTitle: product.panelsSectionTitle,
        panelsSectionDescription: product.panelsSectionDescription,
      });
      setAdding(false);
      setEditing(null);
      invalidate();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(row: FlatRow) {
    if (!confirm(`Remove sub-product "${row.sub.title}" from ${row.productTitle}?`)) return;
    const product = products.find((p) => p._id === row.productId);
    if (!product) return;
    const nextSubs = (product.subProducts ?? []).filter((_, i) => i !== row.subIndex);
    try {
      await updateProduct(row.productId, {
        slug: product.slug,
        title: product.title,
        description: product.description,
        image: product.image,
        heroImage: product.heroImage,
        subProducts: nextSubs,
        categorySlug: product.categorySlug,
        order: product.order ?? 0,
        panelsSectionTitle: product.panelsSectionTitle,
        panelsSectionDescription: product.panelsSectionDescription,
      });
      invalidate();
      if (editing?.productId === row.productId && editing?.subIndex === row.subIndex) setEditing(null);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to delete');
    }
  }

  return (
    <PageShell
      title="Sub-products"
      action={
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="py-2 px-4 text-sm font-medium text-white bg-primary-600 border-0 rounded-lg cursor-pointer hover:bg-primary-700"
        >
          Add sub-product
        </button>
      }
    >
      <Modal
        open={adding}
        onClose={() => { setAdding(false); setSaveError(null); }}
        title="Add sub-product"
        maxWidth="max-w-2xl"
      >
        <SubProductForm
          products={products}
          productId=""
          subProduct={null}
          subIndex={null}
          onSave={handleSave}
          onCancel={() => { setAdding(false); setSaveError(null); }}
          isSaving={saving}
          error={saveError}
          hideTitle
        />
      </Modal>
      <Modal
        open={!!editing}
        onClose={() => { setEditing(null); setSaveError(null); }}
        title={editing ? `Edit: ${editing.sub.title}` : ''}
        maxWidth="max-w-2xl"
      >
        {editing && (
          <SubProductForm
            products={products}
            productId={editing.productId}
            subProduct={editing.sub}
            subIndex={editing.subIndex}
            onSave={handleSave}
            onCancel={() => { setEditing(null); setSaveError(null); }}
            isSaving={saving}
            error={saveError}
            hideTitle
          />
        )}
      </Modal>

      <section className="mb-8">
        <h2 className="m-0 mb-4 text-base font-semibold text-gray-500 uppercase tracking-wider">
          All sub-products
        </h2>
        {isLoading && <InlineLoader />}
        {isError && (
          <ErrorState message={error instanceof Error ? error.message : 'Failed to load products'} />
        )}
        {data && (
          <div className="overflow-x-auto rounded-xl border border-gray-300">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="py-2 px-3">Product</th>
                  <th className="py-2 px-3">Slug</th>
                  <th className="py-2 px-3">Title</th>
                  <th className="py-2 px-3">Description</th>
                  <th className="py-2 px-3">Image</th>
                  <th className="py-2 px-3"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={`${row.productId}-${row.subIndex}`} className="border-b border-gray-200 hover:bg-gray-100 transition-colors">
                    <td className="py-2 px-3">
                      <span className="font-medium">{row.productTitle}</span>
                      <span className="text-gray-500 text-xs ml-1">({row.productSlug})</span>
                    </td>
                    <td className="py-2 px-3 font-mono text-sm">{row.sub.slug}</td>
                    <td className="py-2 px-3">{row.sub.title}</td>
                    <td className="py-2 px-3 text-gray-600 max-w-[200px] truncate" title={row.sub.description}>
                      {row.sub.description || '—'}
                    </td>
                    <td className="py-2 px-3">
                      {row.sub.image ? (
                        <img src={row.sub.image} alt="" className="h-10 w-10 rounded object-cover border border-gray-300" />
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="py-2 px-3">
                      <button
                        type="button"
                        onClick={() => setEditing(row)}
                        className="py-1 px-2 text-sm text-primary-400 hover:underline mr-2"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(row)}
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
        {data && rows.length === 0 && !adding && (
          <EmptyState message="No sub-products yet. Add one via Add sub-product, or add sub-products to products on the Products page." />
        )}
      </section>
    </PageShell>
  );
}
