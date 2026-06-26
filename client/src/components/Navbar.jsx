import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      {/* Logo */}
      <Link to="/" className="navbar-logo">
        <div className="logo-icon" style={{ background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="8" cy="12" r="4"/><circle cx="16" cy="12" r="4"/>
          </svg>
        </div>
        <div>Split<span>ly</span></div>
      </Link>

      {/* Right side */}
      <div className="navbar-right">
        <div className="navbar-user">
          <div className="avatar" title={user?.name}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <span className="navbar-user-name">{user?.name}</span>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={logout}>
          Log out
        </button>
      </div>
    </nav>
  );
}
