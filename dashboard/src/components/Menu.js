import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Dashboard as DashboardIcon,
  Receipt,
  BusinessCenter,
  TrendingUp,
  AccountBalanceWallet,
  Notifications,
  Apps,
  Settings,
  Logout,
  Person,
  ExpandMore,
  Assessment,
  Description,
  Calculate,
  CompareArrows,
  Book,
  Newspaper,
} from "@mui/icons-material";
import "./Menu.css";

const Menu = () => {
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const name = localStorage.getItem("userName") || "User";
    setUserName(name);
  }, []);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("userName");
      window.location.href = "/login";
    }
  };

  const menuItems = [
    { path: "/dashboard", icon: <DashboardIcon />, label: "Dashboard" },
    { path: "/dashboard/orders", icon: <Receipt />, label: "Orders" },
    { path: "/dashboard/holdings", icon: <BusinessCenter />, label: "Holdings" },
    { path: "/dashboard/positions", icon: <TrendingUp />, label: "Positions" },
    { path: "/dashboard/funds", icon: <AccountBalanceWallet />, label: "Funds" },
    { path: "/dashboard/alerts", icon: <Notifications />, label: "Alerts" },
    { path: "/dashboard/portfolio", icon: <Assessment />, label: "Portfolio" },
    { path: "/dashboard/reports", icon: <Description />, label: "Reports" },
    { path: "/dashboard/calculator", icon: <Calculate />, label: "Calculator" },
    { path: "/dashboard/compare", icon: <CompareArrows />, label: "Compare" },
    { path: "/dashboard/journal", icon: <Book />, label: "Journal" },
    { path: "/dashboard/news", icon: <Newspaper />, label: "News" },
    { path: "/dashboard/apps", icon: <Apps />, label: "Apps" },
  ];

  const isActive = (path) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="menu-sidebar">
      {/* Logo */}
      <div className="menu-logo">
        <Link to="/dashboard" style={{ textDecoration: "none" }}>
          <div className="logo-container">
            <div className="logo-icon">📈</div>
            <span className="logo-text">TradePro</span>
          </div>
        </Link>
      </div>

      {/* Menu Items */}
      <nav className="menu-nav">
        {menuItems.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            className={`menu-item ${isActive(item.path) ? "active" : ""}`}
            style={{ textDecoration: "none" }}
          >
            <span className="menu-icon">{item.icon}</span>
            <span className="menu-label">{item.label}</span>
            {isActive(item.path) && <div className="active-indicator" />}
          </Link>
        ))}
      </nav>

      {/* Profile Section */}
      <div className="menu-profile">
        <div
          className="profile-trigger"
          onClick={() => setIsProfileOpen(!isProfileOpen)}
        >
          <div className="profile-avatar">
            {userName.substring(0, 2).toUpperCase()}
          </div>
          <div className="profile-info">
            <span className="profile-name">{userName}</span>
            <span className="profile-email">view profile</span>
          </div>
          <ExpandMore className={`profile-arrow ${isProfileOpen ? "open" : ""}`} />
        </div>

        {isProfileOpen && (
          <div className="profile-dropdown-menu">
            <Link to="/dashboard/profile" className="dropdown-item">
              <Person style={{ fontSize: "1.1rem" }} />
              <span>My Profile</span>
            </Link>
            <Link to="/dashboard/settings" className="dropdown-item">
              <Settings style={{ fontSize: "1.1rem" }} />
              <span>Settings</span>
            </Link>
            <div className="dropdown-divider" />
            <button className="dropdown-item logout-btn" onClick={handleLogout}>
              <Logout style={{ fontSize: "1.1rem" }} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;