import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <h1 className="page-title">SCBingoBook</h1>
      <p className="page-subtitle">
        Track your Star Citizen collection and bingo progress. Built for mobile and desktop.
      </p>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <p style={{ margin: '0 0 1rem' }}>
          {isAuthenticated
            ? 'Browse the catalog and update your collection anytime.'
            : 'Create an account to start tracking items across your bingo book.'}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          <Link to="/catalog" className="btn btn-primary">
            View catalog
          </Link>
          {isAuthenticated ? (
            <Link to="/collection" className="btn btn-ghost">
              My collection
            </Link>
          ) : (
            <Link to="/register" className="btn btn-ghost">
              Get started
            </Link>
          )}
        </div>
      </div>

      <section className="card">
        <h2 style={{ marginTop: 0, fontSize: '1.125rem' }}>API ready</h2>
        <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--color-text-muted)' }}>
          <li>JWT authentication</li>
          <li>REST endpoints for items &amp; collection</li>
          <li>PostgreSQL + Prisma ORM</li>
          <li>Docker Compose for local dev</li>
        </ul>
      </section>
    </>
  );
}
