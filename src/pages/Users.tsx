import './Dashboard.css';

export default function Users() {
  return (
    <div className="dashboard-page">
      <header className="dashboard-page-header">
        <h1>User management</h1>
      </header>
      <div className="dashboard-page-content">
        <section className="dashboard-section">
          <p className="dashboard-placeholder">
            User list and actions will go here. Add, edit, and remove users.
          </p>
        </section>
      </div>
    </div>
  );
}
