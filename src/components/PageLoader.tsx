import Spinner from './Spinner';

interface PageLoaderProps {
  /** Text shown below spinner */
  message?: string;
}

export default function PageLoader({ message = 'Loading…' }: PageLoaderProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 py-24">
      <Spinner size="lg" />
      <span className="text-sm text-gray-500">{message}</span>
    </div>
  );
}
