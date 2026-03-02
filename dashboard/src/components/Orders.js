import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./Orders.css";

const Orders = () => {
  const [allOrders, setAllOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filters
  const [typeFilter, setTypeFilter] = useState("ALL"); // ALL, BUY, SELL
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("ALL"); // ALL, TODAY, WEEK, MONTH
  const [sortBy, setSortBy] = useState("LATEST"); // LATEST, OLDEST, PRICE_HIGH, PRICE_LOW

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [allOrders, typeFilter, searchQuery, dateFilter, sortBy]);

  const fetchOrders = async () => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      setError("Please login first");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get("http://localhost:3002/allOrders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("✅ Orders fetched:", response.data);
      setAllOrders(response.data);
      setLoading(false);
    } catch (err) {
      console.error("❌ Error:", err);
      setError(err.response?.data?.message || "Failed to fetch orders");
      setLoading(false);

      if (err.response?.status === 401) {
        alert("Session expired. Please login again.");
        localStorage.clear();
        window.location.href = "/";
      }
    }
  };

  const applyFilters = () => {
    let filtered = [...allOrders];

    // Type filter (BUY/SELL)
    if (typeFilter !== "ALL") {
      filtered = filtered.filter((order) => order.mode === typeFilter);
    }

    // Search filter
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter((order) =>
        order.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Date filter
    if (dateFilter !== "ALL") {
      const now = new Date();
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.createdAt);
        const diffTime = Math.abs(now - orderDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (dateFilter === "TODAY") return diffDays === 0;
        if (dateFilter === "WEEK") return diffDays <= 7;
        if (dateFilter === "MONTH") return diffDays <= 30;
        return true;
      });
    }

    // Sorting
    filtered.sort((a, b) => {
      if (sortBy === "LATEST") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (sortBy === "OLDEST") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      if (sortBy === "PRICE_HIGH") {
        return b.price - a.price;
      }
      if (sortBy === "PRICE_LOW") {
        return a.price - b.price;
      }
      return 0;
    });

    setFilteredOrders(filtered);
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) {
      return;
    }

    const token = localStorage.getItem("token");

    try {
      await axios.delete(`http://localhost:3002/deleteOrder/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Order deleted successfully!");
      fetchOrders(); // Refresh orders
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete order");
    }
  };

  const exportToCSV = () => {
    if (filteredOrders.length === 0) {
      alert("No orders to export!");
      return;
    }

    const headers = ["Date", "Time", "Type", "Stock", "Quantity", "Price", "Total Value"];
    const rows = filteredOrders.map((order) => {
      const date = new Date(order.createdAt);
      return [
        date.toLocaleDateString("en-IN"),
        date.toLocaleTimeString("en-IN"),
        order.mode,
        order.name,
        order.qty,
        order.price.toFixed(2),
        (order.qty * order.price).toFixed(2),
      ];
    });

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += headers.join(",") + "\n";
    rows.forEach((row) => {
      csvContent += row.join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `orders_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate statistics
  const stats = {
    total: filteredOrders.length,
    buyOrders: filteredOrders.filter((o) => o.mode === "BUY").length,
    sellOrders: filteredOrders.filter((o) => o.mode === "SELL").length,
    totalValue: filteredOrders.reduce((sum, o) => sum + o.qty * o.price, 0),
    totalQty: filteredOrders.reduce((sum, o) => sum + o.qty, 0),
  };

  if (loading) {
    return (
      <div className="orders">
        <h3 className="title">Orders</h3>
        <p className="loading-text">Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders">
        <h3 className="title">Orders</h3>
        <p className="error-text">{error}</p>
      </div>
    );
  }

  if (allOrders.length === 0) {
    return (
      <div className="orders">
        <div className="no-orders">
          <p>You haven't placed any orders yet</p>
          <Link to={"/"} className="btn">
            Get started
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="orders">
      {/* Header with Stats */}
      <div className="orders-header">
        <h3 className="title">Orders ({stats.total})</h3>
        <button className="btn-refresh" onClick={fetchOrders} title="Refresh">
          🔄 Refresh
        </button>
      </div>

      {/* Statistics Dashboard */}
      <div className="stats-dashboard">
        <div className="stat-card">
          <div className="stat-label">Total Orders</div>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className="stat-card buy-stat">
          <div className="stat-label">Buy Orders</div>
          <div className="stat-value">{stats.buyOrders}</div>
        </div>
        <div className="stat-card sell-stat">
          <div className="stat-label">Sell Orders</div>
          <div className="stat-value">{stats.sellOrders}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Quantity</div>
          <div className="stat-value">{stats.totalQty}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Value</div>
          <div className="stat-value">₹{stats.totalValue.toFixed(2)}</div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        {/* Type Filter */}
        <div className="filter-group">
          <label>Type:</label>
          <div className="filter-buttons">
            <button
              className={typeFilter === "ALL" ? "filter-btn active" : "filter-btn"}
              onClick={() => setTypeFilter("ALL")}
            >
              All
            </button>
            <button
              className={typeFilter === "BUY" ? "filter-btn active buy" : "filter-btn buy"}
              onClick={() => setTypeFilter("BUY")}
            >
              Buy
            </button>
            <button
              className={typeFilter === "SELL" ? "filter-btn active sell" : "filter-btn sell"}
              onClick={() => setTypeFilter("SELL")}
            >
              Sell
            </button>
          </div>
        </div>

        {/* Date Filter */}
        <div className="filter-group">
          <label>Date:</label>
          <div className="filter-buttons">
            <button
              className={dateFilter === "ALL" ? "filter-btn active" : "filter-btn"}
              onClick={() => setDateFilter("ALL")}
            >
              All Time
            </button>
            <button
              className={dateFilter === "TODAY" ? "filter-btn active" : "filter-btn"}
              onClick={() => setDateFilter("TODAY")}
            >
              Today
            </button>
            <button
              className={dateFilter === "WEEK" ? "filter-btn active" : "filter-btn"}
              onClick={() => setDateFilter("WEEK")}
            >
              This Week
            </button>
            <button
              className={dateFilter === "MONTH" ? "filter-btn active" : "filter-btn"}
              onClick={() => setDateFilter("MONTH")}
            >
              This Month
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="filter-group search-group">
          <label>Search:</label>
          <input
            type="text"
            placeholder="Search by stock name..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Sort */}
        <div className="filter-group">
          <label>Sort By:</label>
          <select
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="LATEST">Latest First</option>
            <option value="OLDEST">Oldest First</option>
            <option value="PRICE_HIGH">Price: High to Low</option>
            <option value="PRICE_LOW">Price: Low to High</option>
          </select>
        </div>

        {/* Export Button */}
        <div className="filter-group">
          <button className="btn-export" onClick={exportToCSV}>
            📥 Export CSV
          </button>
        </div>
      </div>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <p className="no-results">No orders match your filters</p>
      ) : (
        <div className="order-table">
          <table>
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Type</th>
                <th>Instrument</th>
                <th>Qty.</th>
                <th>Price</th>
                <th>Total Value</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.map((order) => {
                const orderDate = order.createdAt
                  ? new Date(order.createdAt)
                  : new Date();

                const timeString = orderDate.toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                const dateString = orderDate.toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                });

                const totalValue = order.qty * order.price;

                return (
                  <tr key={order._id}>
                    <td className="align-left">
                      <div className="date-cell">
                        <div className="date">{dateString}</div>
                        <div className="time">{timeString}</div>
                      </div>
                    </td>

                    <td>
                      <span className={`order-type ${order.mode.toLowerCase()}`}>
                        {order.mode}
                      </span>
                    </td>

                    <td className="stock-name">{order.name}</td>

                    <td>{order.qty}</td>

                    <td>₹{order.price.toFixed(2)}</td>

                    <td className="total-value">₹{totalValue.toFixed(2)}</td>

                    <td>
                      <span className="status-badge complete">Complete</span>
                    </td>

                    <td>
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteOrder(order._id)}
                        title="Delete order"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Orders;