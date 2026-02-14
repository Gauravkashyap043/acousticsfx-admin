export default function Categories() {
  return (
    <div className="min-h-screen flex flex-col text-secondary-100">
      <header className="py-4 px-6 border-b border-secondary-600">
        <h1 className="m-0 text-xl font-semibold tracking-tight">Categories</h1>
      </header>
      <div className="flex-1 p-6 max-w-6xl mx-auto w-full">
        <section className="mb-8">
          <p className="m-0 p-6 text-[0.9375rem] text-secondary-400 bg-secondary-800/50 border border-dashed border-secondary-600 rounded-xl">
            Category list and actions will go here. Create, edit, and reorder categories.
          </p>
        </section>
      </div>
    </div>
  );
}
