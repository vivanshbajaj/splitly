import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      {/* Logo */}
      <Link to="/dashboard" className="navbar-logo">
        <div className="logo-icon">💰</div>
        Split<span>ly</span>
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
