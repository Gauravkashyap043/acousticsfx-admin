import { useState } from 'react';
import { useTestimonialsList } from '../hooks/useTestimonialsList';
import {
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  type TestimonialItem,
} from '../api/testimonials';
import { useQueryClient } from '@tanstack/react-query';
import Modal from '../components/Modal';
import { ImageUploadField } from '../components/ImageUploadField';
import { inputClass, labelClass, cancelBtnClass } from '../lib/styles';
import PageShell from '../components/PageShell';
import { EmptyState, ErrorState, InlineLoader } from '../components/EmptyState';

function TestimonialForm({
  testimonial,
  onSave,
  onCancel,
  isSaving,
  error,
}: {
  testimonial: TestimonialItem | null;
  onSave: (body: {
    company: string;
    companyLogo: string;
    text: string;
    name: string;
    role: string;
    avatar: string;
    order?: number;
  }) => void;
  onCancel: () => void;
  isSaving: boolean;
  error: string | null;
}) {
  const [company, setCompany] = useState(testimonial?.company ?? '');
  const [companyLogo, setCompanyLogo] = useState(testimonial?.companyLogo ?? '');
  const [text, setText] = useState(testimonial?.text ?? '');
  const [name, setName] = useState(testimonial?.name ?? '');
  const [role, setRole] = useState(testimonial?.role ?? '');
  const [avatar, setAvatar] = useState(testimonial?.avatar ?? '');
  const [order, setOrder] = useState(testimonial?.order ?? 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      company: company.trim(),
      companyLogo: companyLogo.trim(),
      text: text.trim(),
      name: name.trim(),
      role: role.trim(),
      avatar: avatar.trim(),
      order,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label>
        <span className={labelClass}>Company</span>
        <input
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="e.g. VMware"
          required
          className={inputClass}
        />
      </label>
      <ImageUploadField
        label="Company logo"
        hint="Upload or paste URL."
        value={companyLogo}
        onChange={setCompanyLogo}
      />
      <label>
        <span className={labelClass}>Quote text</span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          required
          className={`${inputClass} resize-y`}
        />
      </label>
      <label>
        <span className={labelClass}>Name</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. John Doe"
          required
          className={inputClass}
        />
      </label>
      <label>
        <span className={labelClass}>Role</span>
        <input
          type="text"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="e.g. Design Team Lead at VMware"
          className={inputClass}
        />
      </label>
      <ImageUploadField
        label="Avatar"
        hint="Upload or paste URL."
        value={avatar}
        onChange={setAvatar}
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
          disabled={isSaving || !company.trim() || !text.trim() || !name.trim()}
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
  );
}

export default function Testimonials() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error } = useTestimonialsList();
  const [editing, setEditing] = useState<TestimonialItem | null>(null);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['admin', 'testimonials'] });

  async function handleCreate(body: Parameters<typeof createTestimonial>[0]) {
    setSaving(true);
    setSaveError(null);
    try {
      await createTestimonial(body);
      setAdding(false);
      invalidate();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Failed to create');
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(body: Parameters<typeof updateTestimonial>[1]) {
    if (!editing) return;
    setSaving(true);
    setSaveError(null);
    try {
      await updateTestimonial(editing._id, body);
      setEditing(null);
      invalidate();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Failed to update');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this testimonial?')) return;
    try {
      await deleteTestimonial(id);
      invalidate();
      if (editing?._id === id) setEditing(null);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to delete');
    }
  }

  return (
    <PageShell
      title="Testimonials"
      action={
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="py-2 px-4 text-sm font-medium text-white bg-primary-600 border-0 rounded-lg cursor-pointer hover:bg-primary-700"
        >
          Add testimonial
        </button>
      }
    >
        <Modal
          open={adding}
          onClose={() => {
            setAdding(false);
            setSaveError(null);
          }}
          title="Add testimonial"
          maxWidth="max-w-lg"
        >
          <TestimonialForm
            testimonial={null}
            onSave={handleCreate}
            onCancel={() => {
              setAdding(false);
              setSaveError(null);
            }}
            isSaving={saving}
            error={saveError}
          />
        </Modal>
        <Modal
          open={!!editing}
          onClose={() => {
            setEditing(null);
            setSaveError(null);
          }}
          title={editing ? `Edit: ${editing.company} – ${editing.name}` : ''}
          maxWidth="max-w-lg"
        >
          {editing && (
            <TestimonialForm
              testimonial={editing}
              onSave={handleUpdate}
              onCancel={() => {
                setEditing(null);
                setSaveError(null);
              }}
              isSaving={saving}
              error={saveError}
            />
          )}
        </Modal>

        <section className="mb-8">
          <h2 className="m-0 mb-4 text-base font-semibold text-gray-500 uppercase tracking-wider">
            All testimonials
          </h2>
          {isLoading && <InlineLoader />}
          {isError && <ErrorState message={error instanceof Error ? error.message : 'Failed to load testimonials'} />}
          {data && data.items.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-gray-300">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="py-2 px-3">Avatar</th>
                    <th className="py-2 px-3">Company</th>
                    <th className="py-2 px-3">Logo</th>
                    <th className="py-2 px-3">Name</th>
                    <th className="py-2 px-3">Role</th>
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
                        {item.avatar ? (
                          <img src={item.avatar} alt={item.name} className="h-8 w-8 rounded-full object-cover" />
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="py-2 px-3">{item.company}</td>
                      <td className="py-2 px-3">
                        {item.companyLogo ? (
                          <img src={item.companyLogo} alt={item.company} className="h-8 w-auto max-w-[80px] object-contain" />
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="py-2 px-3">{item.name}</td>
                      <td className="py-2 px-3 text-gray-500 max-w-[200px] truncate">
                        {item.role || '—'}
                      </td>
                      <td className="py-2 px-3">{item.order ?? 0}</td>
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
            <EmptyState message="No testimonials yet. Add one to show on the home page." />
          )}
        </section>
    </PageShell>
  );
}
