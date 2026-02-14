import './Dashboard.css';

export default function Blogs() {
  return (
    <div className="dashboard-page">
      <header className="dashboard-page-header">
        <h1>Blogs & articles</h1>
      </header>
      <div className="dashboard-page-content">
        <section className="dashboard-section">
          <p className="dashboard-placeholder">
            Create and manage blog posts and articles. Draft, publish, and organize content.
          </p>
        </section>
      </div>
    </div>
  );
}
