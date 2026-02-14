import './Dashboard.css';

export default function Products() {
  return (
    <div className="dashboard-page">
      <header className="dashboard-page-header">
        <h1>Products</h1>
      </header>
      <div className="dashboard-page-content">
        <section className="dashboard-section">
          <p className="dashboard-placeholder">
            Product list and actions will go here. Add, edit, and manage products.
          </p>
        </section>
      </div>
    </div>
  );
}
