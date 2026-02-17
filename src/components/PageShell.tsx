import type { ReactNode } from 'react';

interface PageShellProps {
  title: string;
  /** Optional action rendered in the header (e.g. "Add" button) */
  action?: ReactNode;
  children: ReactNode;
}

export default function PageShell({ title, action, children }: PageShellProps) {
  return (
    <div className="min-h-screen flex flex-col text-gray-900">
      <header className="py-4 px-6 border-b border-gray-300 flex items-center justify-between gap-4 flex-wrap">
        <h1 className="m-0 text-xl font-semibold tracking-tight">{title}</h1>
        {action}
      </header>
      <div className="flex-1 p-6 max-w-6xl mx-auto w-full">{children}</div>
    </div>
  );
}
