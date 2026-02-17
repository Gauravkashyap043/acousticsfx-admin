import { useState } from 'react';
import { useNewsletterSubscriptionsList } from '../hooks/useNewsletterSubscriptionsList';
import Modal from '../components/Modal';

const inputClass =
  'w-full py-2 px-3 text-secondary-100 bg-secondary-900 border border-secondary-600 rounded-lg outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400/30';
const labelClass = 'block text-sm font-medium text-secondary-300 mb-1';

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function Newsletter() {
  const { data, isLoading, isError, error } = useNewsletterSubscriptionsList();
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sendStatus, setSendStatus] = useState<'idle' | 'success' | 'info'>('idle');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const items = data?.items ?? [];
  const subscriberCount = items.length;
  const selectedCount = selectedIds.size;
  const allSelected = subscriberCount > 0 && selectedCount === subscriberCount;

  const handleSelectAll = () => {
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(items.map((i) => i._id)));
  };

  const handleToggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleOpenSendModal = () => {
    setSubject('');
    setMessage('');
    setSendStatus('idle');
    setSendModalOpen(true);
  };

  const handleSendNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    // Frontend only for now – no API call
    setSendStatus('info');
  };

  return (
    <div className="min-h-screen flex flex-col text-secondary-100">
      <header className="py-4 px-6 border-b border-secondary-600 flex items-center justify-between">
        <h1 className="m-0 text-xl font-semibold tracking-tight">Newsletter</h1>
        <button
          type="button"
          onClick={handleOpenSendModal}
          className="py-2 px-4 text-sm font-medium text-white bg-primary-600 border-0 rounded-lg cursor-pointer hover:bg-primary-500"
        >
          Send newsletter
        </button>
      </header>
      <div className="flex-1 p-6 max-w-6xl mx-auto w-full">

        <Modal
          open={sendModalOpen}
          onClose={() => setSendModalOpen(false)}
          title="Send newsletter email"
          maxWidth="max-w-lg"
        >
          <p className="text-secondary-400 text-sm mb-4">
            {subscriberCount === 0
              ? 'No subscribers yet. Add signups from the public site first.'
              : selectedCount === 0
                ? 'No subscribers selected. Use Select all or check individuals in the list below, then open this again.'
                : `This will send an email to ${selectedCount} selected subscriber${selectedCount === 1 ? '' : 's'}.`}
          </p>
          <form onSubmit={handleSendNewsletter} className="flex flex-col gap-4">
            <label>
              <span className={labelClass}>Subject</span>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Newsletter subject"
                required
                className={inputClass}
              />
            </label>
            <label>
              <span className={labelClass}>Message</span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your newsletter content..."
                rows={6}
                required
                className={`${inputClass} resize-y`}
              />
            </label>
            {sendStatus === 'info' && (
              <p className="text-amber-400 text-sm">
                Frontend only — sending is not connected to the backend yet.
              </p>
            )}
            {sendStatus === 'success' && (
              <p className="text-green-400 text-sm">Email sent successfully.</p>
            )}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={subscriberCount === 0 || selectedCount === 0}
                className="py-2 px-4 text-sm font-medium text-white bg-primary-600 border-0 rounded-lg cursor-pointer hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send newsletter
              </button>
              <button
                type="button"
                onClick={() => setSendModalOpen(false)}
                className="py-2 px-4 text-sm font-medium text-secondary-300 bg-transparent border border-secondary-600 rounded-lg cursor-pointer hover:bg-secondary-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
        <section>
          <p className="m-0 mb-2 text-[0.9375rem] text-secondary-400">
            Emails submitted via the newsletter signup on the public site.
          </p>
          {items.length > 0 && (
            <div className="mb-3 flex items-center gap-4">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-sm text-primary-400 hover:underline cursor-pointer"
              >
                {allSelected ? 'Deselect all' : 'Select all'}
              </button>
              {selectedCount > 0 && (
                <span className="text-secondary-400 text-sm">
                  {selectedCount} selected
                </span>
              )}
            </div>
          )}
          {isLoading && <p className="text-secondary-400 text-sm">Loading…</p>}
          {isError && (
            <p className="text-red-400 text-sm">
              {error instanceof Error ? error.message : 'Failed to load subscriptions'}
            </p>
          )}
          {items.length === 0 && (
            <p className="text-secondary-400 text-sm">No subscriptions yet.</p>
          )}
          {items.length > 0 && (
            <div className="overflow-x-auto border border-secondary-600 rounded-lg">
              <table className="w-full text-sm text-left">
                <thead className="bg-secondary-800/80 text-secondary-300">
                  <tr>
                    <th className="px-4 py-3 w-10">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={handleSelectAll}
                        aria-label={allSelected ? 'Deselect all' : 'Select all'}
                        className="rounded border-secondary-600 cursor-pointer"
                      />
                    </th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-700">
                  {items.map((row) => (
                    <tr key={row._id} className="bg-secondary-900/50 hover:bg-secondary-800/50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(row._id)}
                          onChange={() => handleToggleOne(row._id)}
                          aria-label={`Select ${row.email}`}
                          className="rounded border-secondary-600 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3 text-secondary-400 whitespace-nowrap">
                        {formatDate(row.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <a href={`mailto:${row.email}`} className="text-primary-400 hover:underline">
                          {row.email}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
