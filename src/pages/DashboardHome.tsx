export default function DashboardHome() {
  return (
    <div className="min-h-screen flex flex-col text-secondary-100">
      <header className="py-4 px-6 border-b border-secondary-600">
        <h1 className="m-0 text-xl font-semibold tracking-tight">Overview</h1>
      </header>
      <div className="flex-1 p-6 max-w-6xl mx-auto w-full">
        <section className="mb-8">
          <h2 className="m-0 mb-4 text-base font-semibold text-secondary-400 uppercase tracking-wider">
            Stats
          </h2>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
            <div className="p-5 bg-secondary-800/80 border border-secondary-600 rounded-xl flex flex-col gap-2 transition-colors hover:border-secondary-500 hover:bg-secondary-800">
              <span className="text-[0.8125rem] text-secondary-400">Total users</span>
              <span className="text-2xl font-semibold text-secondary-100">—</span>
            </div>
            <div className="p-5 bg-secondary-800/80 border border-secondary-600 rounded-xl flex flex-col gap-2 transition-colors hover:border-secondary-500 hover:bg-secondary-800">
              <span className="text-[0.8125rem] text-secondary-400">Categories</span>
              <span className="text-2xl font-semibold text-secondary-100">—</span>
            </div>
            <div className="p-5 bg-secondary-800/80 border border-secondary-600 rounded-xl flex flex-col gap-2 transition-colors hover:border-secondary-500 hover:bg-secondary-800">
              <span className="text-[0.8125rem] text-secondary-400">Products</span>
              <span className="text-2xl font-semibold text-secondary-100">—</span>
            </div>
          </div>
        </section>
        <section className="mb-8">
          <h2 className="m-0 mb-4 text-base font-semibold text-secondary-400 uppercase tracking-wider">
            Recent activity
          </h2>
          <p className="m-0 p-6 text-[0.9375rem] text-secondary-400 bg-secondary-800/50 border border-dashed border-secondary-600 rounded-xl">
            No recent activity.
          </p>
        </section>
      </div>
    </div>
  );
}
