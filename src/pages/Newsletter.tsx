import { useNewsletterSubscriptionsList } from '../hooks/useNewsletterSubscriptionsList';

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function Newsletter() {
  const { data, isLoading, isError, error } = useNewsletterSubscriptionsList();

  return (
    <div className="min-h-screen flex flex-col text-secondary-100">
      <header className="py-4 px-6 border-b border-secondary-600">
        <h1 className="m-0 text-xl font-semibold tracking-tight">Newsletter</h1>
      </header>
      <div className="flex-1 p-6 max-w-6xl mx-auto w-full">
        <section>
          <p className="m-0 mb-4 text-[0.9375rem] text-secondary-400">
            Emails submitted via the newsletter signup on the public site.
          </p>
          {isLoading && <p className="text-secondary-400 text-sm">Loading…</p>}
          {isError && (
            <p className="text-red-400 text-sm">
              {error instanceof Error ? error.message : 'Failed to load subscriptions'}
            </p>
          )}
          {data?.items && data.items.length === 0 && (
            <p className="text-secondary-400 text-sm">No subscriptions yet.</p>
          )}
          {data?.items && data.items.length > 0 && (
            <div className="overflow-x-auto border border-secondary-600 rounded-lg">
              <table className="w-full text-sm text-left">
                <thead className="bg-secondary-800/80 text-secondary-300">
                  <tr>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-700">
                  {data.items.map((row) => (
                    <tr key={row._id} className="bg-secondary-900/50 hover:bg-secondary-800/50">
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
