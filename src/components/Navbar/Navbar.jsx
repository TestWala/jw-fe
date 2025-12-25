import { useEffect, useState, useRef, useContext, useMemo } from "react";
import "./Navbar.css";
import { AppContext } from "../../context/AppContext";

export default function Navbar({ onNavigate }) {
  const { purity } = useContext(AppContext);

  /* =============================
     HEADER PRICES (LOCAL STORAGE)
  ============================= */
  const [headerPrices, setHeaderPrices] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem("metal_header_prices");
    if (stored) {
      setHeaderPrices(JSON.parse(stored));
    }
  }, []);

  const displayPrices = useMemo(() => {
    if (!headerPrices.length || !purity.length) return [];

    return headerPrices
      .map(hp => {
        const p = purity.find(p => p.id === hp.purityId);
        if (!p) return null;

        return {
          metalType: p.metalType,
          karat: p.karat,
          price: hp.price
        };
      })
      .filter(Boolean);
  }, [headerPrices, purity]);

  /* =============================
     USER / PROFILE DROPDOWN
  ============================= */
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
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
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

  const isAdmin = user.role === "admin" || user.role === "owner";

  return (
    <header className="nav">
      {/* LEFT */}
      <div className="nav-left">Jewellery Inventory</div>

      <div className="nav-right">
        {/* INLINE METAL PRICES */}
        <div className="price-wrapper-inline">
          {displayPrices.length === 0 ? (
            <span className="price-empty">Prices not set</span>
          ) : (
            displayPrices.map((p, idx) => (
              <span className="price-inline" key={idx}>
                <strong>
                  {p.metalType.toUpperCase()} ({p.karat})
                </strong>
                : ₹{p.price}/g
              </span>
            ))
          )}
        </div>

        {/* USER MENU */}
        <div className="nav-user-info" ref={dropdownRef}>
          <button className="user-btn" onClick={() => setOpen(!open)}>
            <div className="avatar">
              {user.role?.charAt(0).toUpperCase()}
            </div>

            <div className="user-info">
              <span className="user-name">{user.fullName}</span>
              <span className="user-role">{user.role}</span>
            </div>
          </button>

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
                onClick={() => handleNavigation("profile")}
              >
                👤 My Profile
              </button>

              <button
                className="dropdown-item"
                onClick={() => handleNavigation("set-prices")}
              >
                💰 Metal Prices
              </button>

              {isAdmin && (
                <>
                  <button
                    className="dropdown-item admin"
                    onClick={() => handleNavigation("users")}
                  >
                    👥 Manage Users
                  </button>

                </>
              )}

              <div className="dropdown-divider" />

              <button className="dropdown-item danger" onClick={logout}>
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
