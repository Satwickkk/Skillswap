import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/skills', label: 'My Skills' },
    { to: '/matches', label: 'Matches' },
    { to: '/sessions', label: 'Sessions' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/dashboard" className="navbar-brand">
          <span className="brand-icon">⚡</span>
          <span className="brand-text">Skill<span className="brand-accent">Swap</span></span>
        </Link>

        <div className="navbar-links">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="navbar-right">
          <div className="credits-badge">
            <span className="credits-icon">💳</span>
            <span>{user?.credits ?? 0} Credits</span>
          </div>
          <div className="user-menu" onClick={() => setMenuOpen(!menuOpen)}>
            <div className="avatar">{user?.name?.[0]?.toUpperCase()}</div>
            <span className="user-name">{user?.name}</span>
            <span className="chevron">▾</span>
            {menuOpen && (
              <div className="dropdown">
                <Link to="/profile" className="dropdown-item">👤 Profile</Link>
                <button onClick={handleLogout} className="dropdown-item logout">🚪 Logout</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
