import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Summary.css";

const Summary = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/";
      return;
    }

    try {
      const response = await axios.get("http://localhost:3002/dashboard/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error:", err);
      setLoading(false);
      if (err.response?.status === 401) {
        localStorage.clear();
        window.location.href = "/";
      }
    }
  };

  if (loading) return <p>Loading dashboard...</p>;

  const userName = localStorage.getItem("userName") || "User";

  return (
    <>
      <div className="username">
        <h6>Hi, {userName}!</h6>
        <hr className="divider" />
      </div>

      {/* Quick Stats Cards */}
      <div className="dashboard-cards">
        <div className="stat-card">
          <div className="stat-label">Portfolio Value</div>
          <div className="stat-value">
            ₹{stats?.totalCurrentValue?.toFixed(2) || "0.00"}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total P&L</div>
          <div className={`stat-value ${stats?.totalPnL >= 0 ? 'profit' : 'loss'}`}>
            {stats?.totalPnL >= 0 ? '+' : ''}₹{stats?.totalPnL?.toFixed(2) || "0.00"}
            <span className="stat-percent">
              ({stats?.totalPnLPercent || "0.00"}%)
            </span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Today's P&L</div>
          <div className={`stat-value ${stats?.todayPnL >= 0 ? 'profit' : 'loss'}`}>
            {stats?.todayPnL >= 0 ? '+' : ''}₹{stats?.todayPnL?.toFixed(2) || "0.00"}
          </div>
        </div>
      </div>

      {/* Equity Section */}
      <div className="section">
        <span>
          <p>Equity</p>
        </span>

        <div className="data">
          <div className="first">
            <h3>{stats?.funds?.availableBalance?.toFixed(2) || "0.00"}k</h3>
            <p>Margin available</p>
          </div>
          <hr />

          <div className="second">
            <p>
              Margins used <span>{stats?.funds?.usedMargin?.toFixed(2) || "0"}</span>
            </p>
            <p>
              Opening balance <span>{stats?.funds?.balance?.toFixed(2) || "0"}k</span>
            </p>
          </div>
        </div>
        <hr className="divider" />
      </div>

      {/* Holdings Section */}
      <div className="section">
        <span>
          <p>Holdings ({stats?.holdingsCount || 0})</p>
        </span>

        <div className="data">
          <div className="first">
            <h3 className={stats?.totalPnL >= 0 ? 'profit' : 'loss'}>
              {stats?.totalPnL?.toFixed(2) || "0.00"}{" "}
              <small>
                {stats?.totalPnL >= 0 ? '+' : ''}{stats?.totalPnLPercent || "0.00"}%
              </small>
            </h3>
            <p>P&L</p>
          </div>
          <hr />

          <div className="second">
            <p>
              Current Value <span>{stats?.totalCurrentValue?.toFixed(2) || "0.00"}k</span>
            </p>
            <p>
              Investment <span>{stats?.totalInvestment?.toFixed(2) || "0.00"}k</span>
            </p>
          </div>
        </div>
        <hr className="divider" />
      </div>

      {/* Top Gainers & Losers */}
      {(stats?.topGainers?.length > 0 || stats?.topLosers?.length > 0) && (
        <div className="performers-section">
          {stats?.topGainers?.length > 0 && (
            <div className="performers-card">
              <h4>Top Gainers</h4>
              {stats.topGainers.map((stock, idx) => (
                <div key={idx} className="performer-item">
                  <span className="stock-name">{stock.name}</span>
                  <span className="stock-gain profit">
                    +{stock.pnlPercent?.toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
          )}

          {stats?.topLosers?.length > 0 && (
            <div className="performers-card">
              <h4>Top Losers</h4>
              {stats.topLosers.map((stock, idx) => (
                <div key={idx} className="performer-item">
                  <span className="stock-name">{stock.name}</span>
                  <span className="stock-loss loss">
                    {stock.pnlPercent?.toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Summary;