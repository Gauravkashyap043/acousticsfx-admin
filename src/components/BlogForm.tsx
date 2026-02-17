import { BlogRichEditor } from './BlogRichEditor';
import { ImageUploadField } from './ImageUploadField';

const inputClass =
  'w-full py-2 px-3 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400/30';
const labelClass = 'block text-sm font-medium text-gray-600 mb-1';

function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export interface BlogFormState {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  heroImage: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  authorImage: string;
  metaDescription: string;
  tags: string;
  isPublished: boolean;
  publishedAt: string;
}

interface BlogFormProps {
  form: BlogFormState;
  setForm: React.Dispatch<React.SetStateAction<BlogFormState>>;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  saving: boolean;
  saveError: string | null;
  /** Unique key for the rich editor (e.g. editing._id or 'new') so it remounts when switching add/edit */
  editorKey: string;
  /** When true, slug is auto-generated from title as the user types (add mode) */
  autoSlugFromTitle?: boolean;
}

export function BlogForm({
  form,
  setForm,
  onSubmit,
  onCancel,
  saving,
  saveError,
  editorKey,
  autoSlugFromTitle = false,
}: BlogFormProps) {
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setForm((f) => {
      const next = { ...f, title };
      if (autoSlugFromTitle) next.slug = slugify(title);
      return next;
    });
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    setForm((f) => ({ ...f, slug: v }));
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <label>
        <span className={labelClass}>Title</span>
        <input
          type="text"
          value={form.title}
          onChange={handleTitleChange}
          required
          className={inputClass}
          placeholder="Your blog title"
        />
      </label>
      <label>
        <span className={labelClass}>URL slug</span>
        <p className="text-xs text-gray-500 mb-1">
          {autoSlugFromTitle ? 'Generated from title. You can edit if needed.' : 'Used in the article link. Use lowercase letters, numbers and hyphens only.'}
        </p>
        <input
          type="text"
          value={form.slug}
          onChange={handleSlugChange}
          required
          className={inputClass}
          placeholder="my-article-name"
        />
      </label>
      <label>
        <span className={labelClass}>Short summary</span>
        <p className="text-xs text-gray-500 mb-1">Shown in blog listings and previews. One or two sentences.</p>
        <textarea
          value={form.excerpt}
          onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
          rows={2}
          className={`${inputClass} resize-y`}
          placeholder="A brief description of the article..."
        />
      </label>
      <BlogRichEditor
        key={editorKey}
        value={form.content}
        onChange={(html) => setForm((f) => ({ ...f, content: html }))}
      />
      <ImageUploadField
        label="Cover image"
        hint="Main image shown at the top of the article. Upload a file or paste a URL."
        value={form.heroImage}
        onChange={(url) => setForm((f) => ({ ...f, heroImage: url }))}
      />
      <label>
        <span className={labelClass}>Author name</span>
        <input
          type="text"
          value={form.authorName}
          onChange={(e) => setForm((f) => ({ ...f, authorName: e.target.value }))}
          className={inputClass}
          placeholder="e.g. Jane Smith"
        />
      </label>
      <label>
        <span className={labelClass}>Author email (optional)</span>
        <input
          type="email"
          value={form.authorEmail}
          onChange={(e) => setForm((f) => ({ ...f, authorEmail: e.target.value }))}
          className={inputClass}
          placeholder="author@example.com"
        />
      </label>
      <label>
        <span className={labelClass}>Author ID (optional)</span>
        <input
          type="text"
          value={form.authorId}
          onChange={(e) => setForm((f) => ({ ...f, authorId: e.target.value }))}
          className={inputClass}
          placeholder="User or system ID"
        />
      </label>
      <ImageUploadField
        label="Author photo (optional)"
        hint="Small picture shown next to the author name."
        value={form.authorImage}
        onChange={(url) => setForm((f) => ({ ...f, authorImage: url }))}
      />
      <label>
        <span className={labelClass}>Meta description (optional)</span>
        <p className="text-xs text-gray-500 mb-1">For SEO. Shown in search results.</p>
        <textarea
          value={form.metaDescription}
          onChange={(e) => setForm((f) => ({ ...f, metaDescription: e.target.value }))}
          rows={2}
          className={`${inputClass} resize-y`}
          placeholder="Short description for search engines"
        />
      </label>
      <label>
        <span className={labelClass}>Tags</span>
        <p className="text-xs text-gray-500 mb-1">Comma-separated (e.g. Insights, Strategy, Acoustics).</p>
        <input
          type="text"
          value={form.tags}
          onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
          className={inputClass}
          placeholder="Insights, Strategy"
        />
      </label>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={form.isPublished}
          onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))}
          className="rounded border-gray-300"
        />
        <span className={labelClass}>Published (show on public site)</span>
      </label>
      <label>
        <span className={labelClass}>Publish date (optional)</span>
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
          className="py-2 px-4 text-sm font-medium text-white bg-primary-600 border-0 rounded-lg cursor-pointer hover:bg-primary-700 disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="py-2 px-4 text-sm font-medium text-gray-600 bg-transparent border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-200"
        >
          Cancel
        </button>
      </div>
      {saveError && <p className="m-0 text-sm text-red-600">{saveError}</p>}
    </form>
  );
}
