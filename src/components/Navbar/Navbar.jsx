import React, { useEffect, useState, useRef } from "react";
import "./Navbar.css";

export default function Navbar({ onNavigate }) {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const logout = () => {
    localStorage.clear();
    window.location.reload();
  };

  const handleNavigation = (page) => {
    setOpen(false);
    onNavigate(page);
  };

  if (!user) return null;

  return (
    <header className="nav">
      {/* LEFT */}
      <div className="nav-left">
        Jewellery Inventory
      </div>

      {/* RIGHT */}
      <div className="nav-right" ref={dropdownRef}>
        <button className="user-btn" onClick={() => setOpen(!open)}>
          <div className="avatar">
            {user.role?.charAt(0).toUpperCase()}
          </div>

          <div className="user-info">
            <span className="user-name">{user.fullName}</span>
            <span className="user-role">{user.role}</span>
          </div>
        </button>

        {/* DROPDOWN */}
        {open && (
          <div className="dropdown">
            <div className="dropdown-header">
              <strong>{user.username}</strong>
              <span>{user.email}</span>
              <span>{user.phone}</span>
            </div>

            <div className="dropdown-divider" />

            <button 
              className="dropdown-item" 
              onClick={() => handleNavigation('profile')}
            >
              <span className="icon">👤</span>
              My Profile
            </button>

            {/* ADMIN ONLY */}
            {user.role === "admin" && (
              <button 
                className="dropdown-item admin"
                onClick={() => handleNavigation('users')}
              >
                <span className="icon">⚙️</span>
                Manage Users
              </button>
            )}
            
            <div className="dropdown-divider" />

            <button className="dropdown-item danger" onClick={logout}>
              <span className="icon">🚪</span>
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}