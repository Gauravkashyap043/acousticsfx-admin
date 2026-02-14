import './Dashboard.css';

export default function DashboardHome() {
  return (
    <div className="dashboard-page">
      <header className="dashboard-page-header">
        <h1>Overview</h1>
      </header>
      <div className="dashboard-page-content">
        <section className="dashboard-section">
          <h2>Stats</h2>
          <div className="dashboard-cards">
            <div className="dashboard-card">
              <span className="dashboard-card-label">Total users</span>
              <span className="dashboard-card-value">—</span>
            </div>
            <div className="dashboard-card">
              <span className="dashboard-card-label">Categories</span>
              <span className="dashboard-card-value">—</span>
            </div>
            <div className="dashboard-card">
              <span className="dashboard-card-label">Products</span>
              <span className="dashboard-card-value">—</span>
            </div>
          </div>
        </section>
        <section className="dashboard-section">
          <h2>Recent activity</h2>
          <p className="dashboard-placeholder">No recent activity.</p>
        </section>
      </div>
    </div>
  );
}
