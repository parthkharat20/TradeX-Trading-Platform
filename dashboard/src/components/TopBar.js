import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Menu from "./Menu";
import { 
  Notifications, 
  NotificationsActive,
  AddCircleOutline,
  AccountBalanceWallet,
  TrendingUp,
  ShowChart
} from "@mui/icons-material";
import "./TopBar.css";

const TopBar = () => {
  const [funds, setFunds] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [marketStatus, setMarketStatus] = useState("OPEN"); // OPEN, CLOSED, PRE_OPEN

  useEffect(() => {
    fetchFunds();
    checkMarketStatus();
    
    const fundsInterval = setInterval(fetchFunds, 30000); // Every 30 sec
    const marketInterval = setInterval(checkMarketStatus, 60000); // Every minute
    
    return () => {
      clearInterval(fundsInterval);
      clearInterval(marketInterval);
    };
  }, []);

  const fetchFunds = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await axios.get("http://localhost:3002/funds", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFunds(response.data);
    } catch (err) {
      console.error("Error fetching funds:", err);
    }
  };

  const checkMarketStatus = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTime = hours * 60 + minutes;

    const marketOpen = 9 * 60 + 15; // 9:15 AM
    const marketClose = 15 * 60 + 30; // 3:30 PM
    const preOpen = 9 * 60; // 9:00 AM

    if (currentTime >= preOpen && currentTime < marketOpen) {
      setMarketStatus("PRE_OPEN");
    } else if (currentTime >= marketOpen && currentTime < marketClose) {
      setMarketStatus("OPEN");
    } else {
      setMarketStatus("CLOSED");
    }
  };

  const getMarketStatusColor = () => {
    switch (marketStatus) {
      case "OPEN": return "#4caf50";
      case "PRE_OPEN": return "#ff9800";
      case "CLOSED": return "#f44336";
      default: return "#999";
    }
  };

  // Sample indices data (can be replaced with real API)
  const indices = [
    { name: "NIFTY 50", value: "24,188.65", change: "+0.42%", isUp: true },
    { name: "SENSEX", value: "79,943.26", change: "+0.38%", isUp: true },
    { name: "BANKNIFTY", value: "52,156.80", change: "+0.55%", isUp: true },
    { name: "FINNIFTY", value: "23,442.10", change: "+0.48%", isUp: true },
  ];

  return (
    <div className="topbar-container">
      {/* Logo Section */}
      <div className="topbar-logo">
        <Link to="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="logo-icon">
            <ShowChart style={{ fontSize: '2rem', color: '#4184f3' }} />
          </div>
          <div className="logo-text">
            <span className="app-name">TradePro</span>
            <span className="market-status" style={{ color: getMarketStatusColor() }}>
              ● {marketStatus === "PRE_OPEN" ? "PRE OPEN" : marketStatus}
            </span>
          </div>
        </Link>
      </div>

      {/* Indices Section */}
      <div className="indices-container">
        {indices.map((index, i) => (
          <div key={i} className="index-item">
            <p className="index-name">{index.name}</p>
            <div className="index-data">
              <p className="index-value">{index.value}</p>
              <p className={`index-change ${index.isUp ? 'up' : 'down'}`}>
                {index.change}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Menu */}
      <Menu />

      {/* Right Section - Funds + Notifications */}
      <div className="topbar-right">
        {/* Funds Display */}
        <Link to="/dashboard/funds" style={{ textDecoration: 'none' }}>
          <div className="funds-widget">
            <div className="funds-icon">
              <AccountBalanceWallet style={{ fontSize: '1.2rem' }} />
            </div>
            <div className="funds-info">
              <p className="funds-label">Available</p>
              <p className="funds-value">
                ₹{funds?.availableBalance?.toFixed(2) || "0.00"}
              </p>
            </div>
            <Link 
              to="/dashboard/funds" 
              className="add-funds-btn"
              onClick={(e) => e.stopPropagation()}
            >
              <AddCircleOutline style={{ fontSize: '1rem' }} />
            </Link>
          </div>
        </Link>

        {/* P&L Widget */}
        {funds && funds.usedMargin > 0 && (
          <div className="pnl-widget">
            <TrendingUp style={{ fontSize: '1rem', color: '#4caf50' }} />
            <div className="pnl-info">
              <p className="pnl-label">Day's P&L</p>
              <p className="pnl-value profit">+₹124.50</p>
            </div>
          </div>
        )}

        {/* Notifications */}
        <div className="notifications-container">
          <button 
            className="notifications-btn"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            {notifications.length > 0 ? (
              <>
                <NotificationsActive style={{ fontSize: '1.3rem' }} />
                <span className="notification-badge">{notifications.length}</span>
              </>
            ) : (
              <Notifications style={{ fontSize: '1.3rem' }} />
            )}
          </button>

          {showNotifications && (
            <div className="notifications-dropdown">
              <div className="notifications-header">
                <h4>Notifications</h4>
                <button onClick={() => setShowNotifications(false)}>×</button>
              </div>
              <div className="notifications-body">
                {notifications.length === 0 ? (
                  <p className="no-notifications">No new notifications</p>
                ) : (
                  notifications.map((notif, i) => (
                    <div key={i} className="notification-item">
                      <p>{notif.message}</p>
                      <span>{notif.time}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopBar;