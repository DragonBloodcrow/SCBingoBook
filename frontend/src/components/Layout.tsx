import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/layout.css';

export function Layout() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <>
      <header className="app-header">
        <NavLink to="/" className="app-header__brand">
          SCBingoBook
        </NavLink>
        <nav className="app-nav" aria-label="Main">
          <NavLink to="/catalog">Catalog</NavLink>
          {isAuthenticated ? (
            <>
              <NavLink to="/collection">My Collection</NavLink>
              <button type="button" className="btn btn-ghost" onClick={logout}>
                Log out ({user?.username})
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login">Log in</NavLink>
              <NavLink to="/register">Sign up</NavLink>
            </>
          )}
        </nav>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </>
  );
}
