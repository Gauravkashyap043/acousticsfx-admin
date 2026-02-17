import Spinner from './Spinner';

interface EmptyStateProps {
  message: string;
}

/** Dashed-border placeholder shown when a list has no items. */
export function EmptyState({ message }: EmptyStateProps) {
  return (
    <p className="m-0 p-6 text-[0.9375rem] text-gray-500 bg-gray-100 border border-dashed border-gray-300 rounded-xl">
      {message}
    </p>
  );
}

interface ErrorStateProps {
  message: string;
}

/** Dashed-border error display for failed data loads. */
export function ErrorState({ message }: ErrorStateProps) {
  return (
    <p className="m-0 p-6 text-[0.9375rem] text-red-600 bg-gray-100 border border-dashed border-gray-300 rounded-xl">
      {message}
    </p>
  );
}

/** Inline spinner shown while data is loading. */
export function InlineLoader() {
  return (
    <div className="flex items-center gap-3 p-6 bg-gray-50 border border-dashed border-gray-300 rounded-xl">
      <Spinner size="sm" />
      <span className="text-sm text-gray-500">Loading…</span>
    </div>
  );
}

/** Compact inline spinner for tables/lists (no border box). */
export function CompactLoader() {
  return (
    <div className="flex items-center gap-2 py-4">
      <Spinner size="sm" />
      <span className="text-sm text-gray-500">Loading…</span>
    </div>
  );
}
