import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, LayoutDashboard, FolderKanban, CheckSquare } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar glass">
      <Link to="/" className="navbar-brand">TaskFlow</Link>
      
      <div className="nav-links">
        {user ? (
          <>
            <Link to="/dashboard" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <LayoutDashboard size={18} /> Dashboard
            </Link>
            <Link to="/my-tasks" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <CheckSquare size={18} /> My Tasks
            </Link>
            <Link to="/projects" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <FolderKanban size={18} /> Projects
            </Link>
            <Link to="/tasks" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <CheckSquare size={18} /> Tasks
            </Link>
            
            <div style={{ marginLeft: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                {user.name} ({user.role})
              </span>
              <button onClick={handleLogout} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px' }}>
                <LogOut size={16} /> Logout
              </button>
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="btn btn-primary">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
