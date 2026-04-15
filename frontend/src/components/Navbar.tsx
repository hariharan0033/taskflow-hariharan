import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Navbar() {
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container navbar__inner">
        <Link to="/projects" className="navbar__logo">⚡ TaskFlow</Link>
        <div className="navbar__right">
          {user && <span className="navbar__user">👤 {user.name}</span>}
          <button className="btn btn--ghost btn--sm" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
