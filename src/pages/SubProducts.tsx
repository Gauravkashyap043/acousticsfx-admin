import { useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  listSubProducts,
  createSubProduct,
  updateSubProduct,
  deleteSubProduct,
  type SubProduct,
  type SubProductListItem,
  type SubProductSpec,
  type SubProductGalleryImage,
  type SubProductSubstratesSection,
  type SubProductAboutTab,
  type SubProductFinishesSection,
  type SubProductCertification,
} from '../api/subProducts';
import { listProducts } from '../api/products';
import { uploadImage } from '../api/upload';
import Modal from '../components/Modal';
import { inputClass, labelClass, cancelBtnClass, deleteBtnClass } from '../lib/styles';
import PageShell from '../components/PageShell';
import { EmptyState, ErrorState, InlineLoader } from '../components/EmptyState';
import { slugify } from '../lib/slugify';

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="m-0 mt-4 mb-2 text-sm font-semibold text-gray-600 border-b border-gray-200 pb-1 first:mt-0">
      {children}
    </h3>
  );
}

function SubProductForm({
  productId,
  productTitle,
  initial,
  onSave,
  onCancel,
  isSaving,
  error,
  hideTitle,
}: {
  productId: string;
  productTitle?: string;
  initial: SubProduct | null;
  onSave: (body: SubProduct) => void;
  onCancel: () => void;
  isSaving: boolean;
  error: string | null;
  hideTitle?: boolean;
}) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [showTrademark, setShowTrademark] = useState(initial?.showTrademark === true);
  const [description, setDescription] = useState(initial?.description ?? '');
  const [image, setImage] = useState(initial?.image ?? '');
  const [specSectionTitle, setSpecSectionTitle] = useState(initial?.specSectionTitle ?? '');
  const [specDescription, setSpecDescription] = useState(initial?.specDescription ?? '');
  const [specs, setSpecs] = useState<SubProductSpec[]>(initial?.specs ?? []);
  const [certificationsSectionTitle, setCertificationsSectionTitle] = useState(
    initial?.certificationsSectionTitle ?? ''
  );
  const [certificationsSectionDescription, setCertificationsSectionDescription] = useState(
    initial?.certificationsSectionDescription ?? ''
  );
  const [certificationItems, setCertificationItems] = useState<SubProductCertification[]>(
    initial?.certifications ?? []
  );
  const [galleryImages, setGalleryImages] = useState<SubProductGalleryImage[]>(
    initial?.galleryImages ??
      (initial?.gallerySlides?.length
        ? initial.gallerySlides.flatMap((s) => [{ url: s.large }, { url: s.small }]).filter((x) => !!x.url)
        : [])
  );
  const fileRef = useRef<HTMLInputElement>(null);
  const certFileRef = useRef<HTMLInputElement>(null);
  const [certUploadIndex, setCertUploadIndex] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingCert, setUploadingCert] = useState(false);

  // Substrates state
  type SubstrateItem = NonNullable<SubProductSubstratesSection['items']>[number];
  const [substratesTitle, setSubstratesTitle] = useState(initial?.substratesSection?.title ?? '');
  const [substratesDescription, setSubstratesDescription] = useState(
    initial?.substratesSection?.description ?? ''
  );
  const [substrateItems, setSubstrateItems] = useState<SubstrateItem[]>(
    initial?.substratesSection?.items ?? []
  );

  // About the product tabs
  const aboutTabDefs: Array<Pick<SubProductAboutTab, 'key' | 'title'>> = [
    { key: 'advantages', title: 'Advantages' },
    { key: 'key-features', title: 'Key Features' },
    { key: 'application-areas', title: 'Application Areas' },
    { key: 'characteristics', title: 'Characteristics' },
    { key: 'maintenance', title: 'Maintenance' },
  ];
  const [aboutTabText, setAboutTabText] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const def of aboutTabDefs) {
      const existing =
        initial?.aboutTabs?.find((t) => t.key === def.key) ??
        initial?.aboutTabs?.find((t) => t.title === def.title);
      map[def.key] = existing?.rows?.join('\n') ?? '';
    }
    return map;
  });

  // Finishes & shades state
  type FinishItem = NonNullable<SubProductFinishesSection['items']>[number];
  const [finishesTitle, setFinishesTitle] = useState(initial?.finishesSection?.title ?? '');
  const [finishesDescription, setFinishesDescription] = useState(
    initial?.finishesSection?.description ?? ''
  );
  const [finishItems, setFinishItems] = useState<FinishItem[]>(initial?.finishesSection?.items ?? []);

  const addSpec = () => setSpecs((prev) => [...prev, { label: '', value: '' }]);
  const updateSpec = (i: number, field: 'label' | 'value', value: string) => {
    setSpecs((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: value };
      return next;
    });
  };
  const removeSpec = (i: number) => setSpecs((prev) => prev.filter((_, j) => j !== i));

  const addCertification = () =>
    setCertificationItems((prev) => [...prev, { name: '', image: '', description: '' }]);
  const updateCertification = <K extends keyof SubProductCertification>(
    i: number,
    field: K,
    value: SubProductCertification[K]
  ) => {
    setCertificationItems((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: value };
      return next;
    });
  };
  const removeCertification = (i: number) =>
    setCertificationItems((prev) => prev.filter((_, idx) => idx !== i));

  const handleCertImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (certUploadIndex == null || !file?.type.startsWith('image/')) {
      setCertUploadIndex(null);
      return;
    }
    setUploadingCert(true);
    try {
      const { url } = await uploadImage(file);
      setCertificationItems((prev) => {
        const next = [...prev];
        if (next[certUploadIndex]) {
          next[certUploadIndex] = { ...next[certUploadIndex], image: url };
        }
        return next;
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploadingCert(false);
      setCertUploadIndex(null);
    }
  };

  const addGalleryImage = () => setGalleryImages((prev) => [...prev, { url: '', alt: '' }]);
  const updateGalleryImage = (i: number, field: 'url' | 'alt', value: string) => {
    setGalleryImages((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: value };
      return next;
    });
  };
  const removeGalleryImage = (i: number) => setGalleryImages((prev) => prev.filter((_, j) => j !== i));

  const addSubstrate = () =>
    setSubstrateItems((prev) => [...prev, { name: '', thickness: '', description: '', image: '' }]);
  const updateSubstrate = <K extends keyof SubstrateItem>(i: number, field: K, value: SubstrateItem[K]) => {
    setSubstrateItems((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: value };
      return next;
    });
  };
  const removeSubstrate = (i: number) =>
    setSubstrateItems((prev) => prev.filter((_, idx) => idx !== i));

  const addFinish = () =>
    setFinishItems((prev) => [...prev, { name: '', description: '', image: '' }]);
  const updateFinish = <K extends keyof FinishItem>(i: number, field: K, value: FinishItem[K]) => {
    setFinishItems((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: value };
      return next;
    });
  };
  const removeFinish = (i: number) => setFinishItems((prev) => prev.filter((_, idx) => idx !== i));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file?.type.startsWith('image/')) {
      alert('Please choose an image (JPEG, PNG, GIF, or WebP).');
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const aboutTabs: SubProductAboutTab[] =
      aboutTabDefs
        .map((def) => {
          const lines = (aboutTabText[def.key] ?? '')
            .split('\n')
            .map((l) => l.trim())
            .filter(Boolean);
          if (!lines.length) return null;
          return { key: def.key, title: def.title, rows: lines };
        })
        .filter((t): t is SubProductAboutTab => !!t) ?? [];
    const substratesClean = substrateItems
      .map((s) => ({
        name: s.name.trim(),
        thickness: s.thickness?.trim() || undefined,
        description: s.description?.trim() || undefined,
        image: s.image?.trim() || undefined,
      }))
      .filter((s) => s.name);
    const finishesClean = finishItems
      .map((f) => ({
        name: f.name.trim(),
        description: f.description?.trim() || undefined,
        image: f.image.trim(),
      }))
      .filter((f) => f.name && f.image);
    const certificationsClean = certificationItems
      .map((c) => ({
        name: c.name.trim(),
        image: c.image.trim(),
        description: c.description?.trim() || undefined,
      }))
      .filter((c) => c.name && c.image);
    const body: SubProduct = {
      slug: slugify(title.trim()),
      title: title.trim(),
      description: description.trim(),
      image: image.trim(),
      showTrademark,
      specSectionTitle: specSectionTitle.trim(),
      certificationsSectionTitle: certificationsSectionTitle.trim(),
      certificationsSectionDescription: certificationsSectionDescription.trim(),
      ...(specDescription.trim() && { specDescription: specDescription.trim() }),
      ...(specs.filter((s) => s.label.trim() || s.value.trim()).length > 0 && {
        specs: specs
          .filter((s) => s.label.trim() || s.value.trim())
          .map((s) => ({ label: s.label.trim() || '—', value: s.value.trim() || '—' })),
      }),
      ...(galleryImages.filter((g) => g.url.trim()).length > 0 && {
        galleryImages: galleryImages.filter((g) => g.url.trim()).map((g) => ({ url: g.url.trim(), alt: g.alt?.trim() || undefined })),
      }),
      ...(aboutTabs.length > 0 && { aboutTabs }),
      ...((substratesTitle.trim() ||
        substratesDescription.trim() ||
        substratesClean.length > 0) && {
        substratesSection: {
          title: substratesTitle.trim() || undefined,
          description: substratesDescription.trim() || undefined,
          items: substratesClean,
        },
      }),
      ...((finishesTitle.trim() ||
        finishesDescription.trim() ||
        finishesClean.length > 0) && {
        finishesSection: {
          title: finishesTitle.trim() || undefined,
          description: finishesDescription.trim() || undefined,
          items: finishesClean,
        },
      }),
      certifications: certificationsClean,
    };
    onSave(body);
  };

  return (
    <section className={hideTitle ? undefined : 'mb-6'}>
      {!hideTitle && (
        <h2 className="m-0 mb-4 text-base font-semibold text-gray-600">
          {initial ? 'Edit sub-product' : 'Add sub-product'}
        </h2>
      )}
      {productTitle && (
        <p className="mb-3 text-sm text-gray-600">
          Product: <strong>{productTitle}</strong>
        </p>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-h-[85vh] overflow-y-auto pr-1">
        <SectionHeading>Basic info</SectionHeading>
        <label>
          <span className={labelClass}>Title</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Linearlux"
            required
            className={inputClass}
          />
          <p className="m-0 mt-1 text-xs text-gray-500">
            URL slug (auto): <span className="font-mono">{slugify(title) || '—'}</span> — …/product/
            {slugify(title) || '…'}/…
          </p>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showTrademark}
            onChange={(e) => setShowTrademark(e.target.checked)}
            className="rounded border-gray-300"
          />
          <span className={labelClass}>Show ™ after sub-product name on the website</span>
        </label>
        <label>
          <span className={labelClass}>Description</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className={`${inputClass} resize-y`}
          />
        </label>
        <label>
          <span className={labelClass}>Image</span>
          <div className="flex gap-2 items-center flex-wrap">
            {image && (
              <img src={image} alt="" className="h-12 w-12 rounded object-cover border border-gray-300 shrink-0" />
            )}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="py-1.5 px-3 text-sm font-medium text-primary-600 border border-primary-400 rounded-lg hover:bg-primary-50 disabled:opacity-50"
            >
              {uploading ? 'Uploading…' : 'Upload'}
            </button>
            <input
              type="file"
              ref={fileRef}
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="hidden"
              onChange={handleImageUpload}
            />
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="Image URL"
              className={`${inputClass} flex-1 min-w-0`}
            />
          </div>
        </label>

        <SectionHeading>Specifications</SectionHeading>
        <label>
          <span className={labelClass}>Spec section title (optional)</span>
          <input
            type="text"
            value={specSectionTitle}
            onChange={(e) => setSpecSectionTitle(e.target.value)}
            placeholder="Defaults to “Product Specification” on the site if empty"
            className={inputClass}
          />
        </label>
        <label>
          <span className={labelClass}>Spec description (optional)</span>
          <textarea
            value={specDescription}
            onChange={(e) => setSpecDescription(e.target.value)}
            rows={2}
            className={`${inputClass} resize-y`}
          />
        </label>
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className={labelClass}>Spec rows (label / value)</span>
            <button type="button" onClick={addSpec} className="text-xs text-primary-600 hover:underline">
              + Add spec
            </button>
          </div>
          {specs.map((spec, i) => (
            <div key={i} className="flex gap-2 items-center mb-1">
              <input
                placeholder="Label"
                value={spec.label}
                onChange={(e) => updateSpec(i, 'label', e.target.value)}
                className={`${inputClass} flex-1 text-sm`}
              />
              <input
                placeholder="Value"
                value={spec.value}
                onChange={(e) => updateSpec(i, 'value', e.target.value)}
                className={`${inputClass} flex-1 text-sm`}
              />
              <button type="button" onClick={() => removeSpec(i)} className={deleteBtnClass}>
                Remove
              </button>
            </div>
          ))}
        </div>

        <SectionHeading>Certifications</SectionHeading>
        <p className="m-0 text-xs text-gray-500 mb-2">
          Logo grid on the detail page. Add name + image URL (or upload). Leave empty to hide the block.
        </p>
        <label>
          <span className={labelClass}>Certifications heading (optional)</span>
          <input
            type="text"
            value={certificationsSectionTitle}
            onChange={(e) => setCertificationsSectionTitle(e.target.value)}
            placeholder="Defaults to “Certifications” if empty"
            className={inputClass}
          />
        </label>
        <label>
          <span className={labelClass}>Certifications intro (optional)</span>
          <textarea
            value={certificationsSectionDescription}
            onChange={(e) => setCertificationsSectionDescription(e.target.value)}
            rows={2}
            className={`${inputClass} resize-y`}
          />
        </label>
        <input
          type="file"
          ref={certFileRef}
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
          onChange={handleCertImageUpload}
        />
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className={labelClass}>Certification logos</span>
            <button type="button" onClick={addCertification} className="text-xs text-primary-600 hover:underline">
              + Add certification
            </button>
          </div>
          {certificationItems.map((c, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2 items-start">
              <input
                placeholder="Name (e.g. FSC® CERTIFIED)"
                value={c.name}
                onChange={(e) => updateCertification(i, 'name', e.target.value)}
                className={`${inputClass} text-sm md:col-span-2`}
              />
              <div className="flex gap-1 items-center md:col-span-2">
                {c.image && (
                  <img src={c.image} alt="" className="h-10 w-10 rounded object-cover border border-gray-300 shrink-0" />
                )}
                <button
                  type="button"
                  onClick={() => {
                    setCertUploadIndex(i);
                    certFileRef.current?.click();
                  }}
                  disabled={uploadingCert}
                  className="py-1 px-2 text-xs font-medium text-primary-600 border border-primary-400 rounded-lg hover:bg-primary-50 disabled:opacity-50 shrink-0"
                >
                  {uploadingCert && certUploadIndex === i ? '…' : 'Upload'}
                </button>
                <input
                  type="url"
                  placeholder="Image URL"
                  value={c.image}
                  onChange={(e) => updateCertification(i, 'image', e.target.value)}
                  className={`${inputClass} text-sm flex-1 min-w-0`}
                />
              </div>
              <textarea
                placeholder="Description (optional)"
                value={c.description ?? ''}
                onChange={(e) => updateCertification(i, 'description', e.target.value)}
                rows={2}
                className={`${inputClass} text-sm md:col-span-3 resize-y`}
              />
              <button
                type="button"
                onClick={() => removeCertification(i)}
                className={`${deleteBtnClass} md:col-span-1 mt-1`}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <SectionHeading>Substrates (slider)</SectionHeading>
        <p className="m-0 text-xs text-gray-500 mb-2">
          Optional substrates section below the gallery. Leave blank to use the default design copy.
        </p>
        <label>
          <span className={labelClass}>Substrates title</span>
          <input
            type="text"
            value={substratesTitle}
            onChange={(e) => setSubstratesTitle(e.target.value)}
            className={inputClass}
          />
        </label>
        <label>
          <span className={labelClass}>Substrates description</span>
          <textarea
            value={substratesDescription}
            onChange={(e) => setSubstratesDescription(e.target.value)}
            rows={2}
            className={`${inputClass} resize-y`}
          />
        </label>
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className={labelClass}>Substrate items</span>
            <button type="button" onClick={addSubstrate} className="text-xs text-primary-600 hover:underline">
              + Add substrate
            </button>
          </div>
          {substrateItems.map((item, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
              <input
                placeholder="Name (e.g. MOISTURE RESISTANT MDF)"
                value={item.name}
                onChange={(e) => updateSubstrate(i, 'name', e.target.value)}
                className={`${inputClass} text-sm md:col-span-2`}
              />
              <input
                placeholder="Thickness (e.g. 12, 16, 18MM)"
                value={item.thickness ?? ''}
                onChange={(e) => updateSubstrate(i, 'thickness', e.target.value)}
                className={`${inputClass} text-sm`}
              />
              <input
                placeholder="Image URL"
                value={item.image ?? ''}
                onChange={(e) => updateSubstrate(i, 'image', e.target.value)}
                className={`${inputClass} text-sm`}
              />
              <textarea
                placeholder="Description (optional)"
                value={item.description ?? ''}
                onChange={(e) => updateSubstrate(i, 'description', e.target.value)}
                rows={2}
                className={`${inputClass} text-sm md:col-span-3 resize-y`}
              />
              <button
                type="button"
                onClick={() => removeSubstrate(i)}
                className={`${deleteBtnClass} md:col-span-1 mt-1`}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <SectionHeading>About the product tabs</SectionHeading>
        <p className="m-0 text-xs text-gray-500 mb-2">
          Content for the \"About the product\" tabs. One line per row inside the tab.
        </p>
        {aboutTabDefs.map((def) => (
          <label key={def.key} className="block mb-2">
            <span className={labelClass}>{def.title}</span>
            <textarea
              value={aboutTabText[def.key] ?? ''}
              onChange={(e) =>
                setAboutTabText((prev) => ({
                  ...prev,
                  [def.key]: e.target.value,
                }))
              }
              rows={3}
              className={`${inputClass} resize-y`}
              placeholder="One item per line"
            />
          </label>
        ))}

        <SectionHeading>Finishes &amp; shades</SectionHeading>
        <p className="m-0 text-xs text-gray-500 mb-2">
          Optional finishes slider. Leave blank to use the static defaults.
        </p>
        <label>
          <span className={labelClass}>Finishes title</span>
          <input
            type="text"
            value={finishesTitle}
            onChange={(e) => setFinishesTitle(e.target.value)}
            className={inputClass}
          />
        </label>
        <label>
          <span className={labelClass}>Finishes description</span>
          <textarea
            value={finishesDescription}
            onChange={(e) => setFinishesDescription(e.target.value)}
            rows={2}
            className={`${inputClass} resize-y`}
          />
        </label>
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className={labelClass}>Finish items</span>
            <button type="button" onClick={addFinish} className="text-xs text-primary-600 hover:underline">
              + Add finish
            </button>
          </div>
          {finishItems.map((item, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
              <input
                placeholder="Name (e.g. Natural Teak)"
                value={item.name}
                onChange={(e) => updateFinish(i, 'name', e.target.value)}
                className={`${inputClass} text-sm`}
              />
              <input
                placeholder="Image URL"
                value={item.image}
                onChange={(e) => updateFinish(i, 'image', e.target.value)}
                className={`${inputClass} text-sm`}
              />
              <textarea
                placeholder="Description (optional)"
                value={item.description ?? ''}
                onChange={(e) => updateFinish(i, 'description', e.target.value)}
                rows={2}
                className={`${inputClass} text-sm md:col-span-2 resize-y`}
              />
              <button
                type="button"
                onClick={() => removeFinish(i)}
                className={`${deleteBtnClass} md:col-span-1 mt-1`}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <SectionHeading>Gallery</SectionHeading>
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className={labelClass}>Gallery images</span>
            <button type="button" onClick={addGalleryImage} className="text-xs text-primary-600 hover:underline">
              + Add image
            </button>
          </div>
          {galleryImages.map((img, i) => (
            <div key={i} className="flex gap-2 items-center mb-1">
              <input
                placeholder="Image URL"
                value={img.url}
                onChange={(e) => updateGalleryImage(i, 'url', e.target.value)}
                className={`${inputClass} flex-1 text-sm`}
              />
              <input
                placeholder="Alt text (optional)"
                value={img.alt ?? ''}
                onChange={(e) => updateGalleryImage(i, 'alt', e.target.value)}
                className={`${inputClass} w-48 text-sm`}
              />
              <button type="button" onClick={() => removeGalleryImage(i)} className={deleteBtnClass}>
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-3 border-t border-gray-200">
          <button
            type="submit"
            disabled={isSaving || !title.trim() || !image.trim()}
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
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin', 'sub-products'],
    queryFn: listSubProducts,
  });
  const { data: productsData } = useQuery({
    queryKey: ['admin', 'products'],
    queryFn: listProducts,
  });
  const [adding, setAdding] = useState(false);
  const [addProductId, setAddProductId] = useState('');
  const [editing, setEditing] = useState<SubProductListItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'sub-products'] });
    queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
  };

  const products = productsData?.items ?? [];

  async function handleCreate(body: SubProduct) {
    if (!addProductId) return;
    setSaving(true);
    setSaveError(null);
    try {
      await createSubProduct(addProductId, body);
      setAdding(false);
      setAddProductId('');
      invalidate();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Failed to create');
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(body: SubProduct) {
    if (!editing) return;
    setSaving(true);
    setSaveError(null);
    try {
      await updateSubProduct(editing.productId, editing.subProduct.slug, body);
      setEditing(null);
      invalidate();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Failed to update');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item: SubProductListItem) {
    if (!confirm(`Delete sub-product "${item.subProduct.title}"?`)) return;
    try {
      await deleteSubProduct(item.productId, item.subProduct.slug);
      invalidate();
      if (editing?.productId === item.productId && editing?.subProduct.slug === item.subProduct.slug) {
        setEditing(null);
      }
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
        onClose={() => {
          setAdding(false);
          setAddProductId('');
          setSaveError(null);
        }}
        title="Add sub-product"
        maxWidth="max-w-2xl"
      >
        {adding && (
          <>
            <label className="block mb-3">
              <span className={labelClass}>Product</span>
              <select
                value={addProductId}
                onChange={(e) => setAddProductId(e.target.value)}
                className={inputClass}
                required
              >
                <option value="">— Select product —</option>
                {products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.title} ({p.slug})
                  </option>
                ))}
              </select>
            </label>
            {addProductId ? (
              <SubProductForm
                productId={addProductId}
                productTitle={products.find((p) => p._id === addProductId)?.title}
                initial={null}
                onSave={handleCreate}
                onCancel={() => {
                  setAdding(false);
                  setAddProductId('');
                  setSaveError(null);
                }}
                isSaving={saving}
                error={saveError}
                hideTitle
              />
            ) : (
              <p className="text-sm text-gray-500">Select a product above to add a sub-product.</p>
            )}
          </>
        )}
      </Modal>

      <Modal
        open={!!editing}
        onClose={() => {
          setEditing(null);
          setSaveError(null);
        }}
        title={editing ? `Edit: ${editing.subProduct.title}` : ''}
        maxWidth="max-w-2xl"
      >
        {editing && (
          <SubProductForm
            productId={editing.productId}
            productTitle={editing.productTitle}
            initial={editing.subProduct}
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
          All sub-products
        </h2>
        {isLoading && <InlineLoader />}
        {isError && (
          <ErrorState message={error instanceof Error ? error.message : 'Failed to load sub-products'} />
        )}
        {data && (
          <div className="overflow-x-auto rounded-xl border border-gray-300">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="py-2 px-3">Image</th>
                  <th className="py-2 px-3">Product</th>
                  <th className="py-2 px-3">Slug</th>
                  <th className="py-2 px-3">Title</th>
                  <th className="py-2 px-3"></th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item) => (
                  <tr
                    key={`${item.productId}-${item.subProduct.slug}`}
                    className="border-b border-gray-200 hover:bg-blue-50/60 transition-colors"
                  >
                    <td className="py-2 px-3">
                      {item.subProduct.image ? (
                        <img
                          src={item.subProduct.image}
                          alt=""
                          className="h-10 w-10 rounded object-cover"
                        />
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="py-2 px-3">
                      <span className="text-gray-700">{item.productTitle}</span>
                      {item.categorySlug && (
                        <span className="ml-1 text-xs text-gray-400">({item.categorySlug})</span>
                      )}
                    </td>
                    <td className="py-2 px-3 font-mono text-sm">{item.subProduct.slug}</td>
                    <td className="py-2 px-3">{item.subProduct.title}</td>
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
                        onClick={() => handleDelete(item)}
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
          <EmptyState message="No sub-products yet. Add one via this page or from the Products form." />
        )}
      </section>
    </PageShell>
  );
}
