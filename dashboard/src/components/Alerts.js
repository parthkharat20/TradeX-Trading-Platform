import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Alerts.css";

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    stockName: "",
    targetPrice: "",
    alertType: "ABOVE"
  });

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/";
      return;
    }

    try {
      const response = await axios.get("http://localhost:3002/alerts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlerts(response.data);
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

  const handleCreateAlert = async () => {
    if (!formData.stockName || !formData.targetPrice) {
      alert("Please fill all fields");
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const response = await axios.post(
        "http://localhost:3002/alerts",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(response.data.message);
      setFormData({ stockName: "", targetPrice: "", alertType: "ABOVE" });
      setShowCreateModal(false);
      fetchAlerts();
    } catch (err) {
      alert(err.response?.data?.message || "Error creating alert");
    }
  };

  const handleToggleAlert = async (alertId) => {
    const token = localStorage.getItem("token");
    try {
      await axios.patch(
        `http://localhost:3002/alerts/${alertId}/toggle`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAlerts();
    } catch (err) {
      alert(err.response?.data?.message || "Error toggling alert");
    }
  };

  const handleDeleteAlert = async (alertId) => {
    if (!window.confirm("Delete this alert?")) return;

    const token = localStorage.getItem("token");
    try {
      await axios.delete(`http://localhost:3002/alerts/${alertId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Alert deleted ✅");
      fetchAlerts();
    } catch (err) {
      alert(err.response?.data?.message || "Error deleting alert");
    }
  };

  if (loading) return <p>Loading alerts...</p>;

  return (
    <div className="alerts-container">
      <div className="alerts-header">
        <h3 className="title">Price Alerts ({alerts.length})</h3>
        <button className="btn btn-blue" onClick={() => setShowCreateModal(true)}>
          + Create Alert
        </button>
      </div>

      {alerts.length === 0 ? (
        <div className="no-alerts">
          <p>No price alerts set</p>
          <button className="btn btn-blue" onClick={() => setShowCreateModal(true)}>
            Create your first alert
          </button>
        </div>
      ) : (
        <div className="alerts-table">
          <table>
            <thead>
              <tr>
                <th>Stock</th>
                <th>Target Price</th>
                <th>Type</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert) => (
                <tr key={alert._id}>
                  <td style={{ fontWeight: '500' }}>{alert.stockName}</td>
                  <td>₹{alert.targetPrice.toFixed(2)}</td>
                  <td>
                    <span className={`alert-type ${alert.alertType.toLowerCase()}`}>
                      {alert.alertType}
                    </span>
                  </td>
                  <td>
                    <span className={`alert-status ${alert.triggered ? 'triggered' : (alert.isActive ? 'active' : 'inactive')}`}>
                      {alert.triggered ? 'TRIGGERED' : (alert.isActive ? 'ACTIVE' : 'INACTIVE')}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'rgb(136, 136, 136)' }}>
                    {new Date(alert.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td>
                    <div className="alert-actions">
                      <button
                        className="action-btn toggle"
                        onClick={() => handleToggleAlert(alert._id)}
                        title={alert.isActive ? "Disable" : "Enable"}
                      >
                        {alert.isActive ? "⏸" : "▶"}
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={() => handleDeleteAlert(alert._id)}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Alert Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Create Price Alert</h3>
            <div className="modal-body">
              <div className="form-group">
                <label>Stock Name</label>
                <input
                  type="text"
                  value={formData.stockName}
                  onChange={(e) => setFormData({...formData, stockName: e.target.value})}
                  placeholder="e.g., TCS, INFY, RELIANCE"
                />
              </div>

              <div className="form-group">
                <label>Target Price (₹)</label>
                <input
                  type="number"
                  value={formData.targetPrice}
                  onChange={(e) => setFormData({...formData, targetPrice: e.target.value})}
                  placeholder="Enter target price"
                  step="0.05"
                />
              </div>

              <div className="form-group">
                <label>Alert When Price</label>
                <div className="radio-group">
                  <label>
                    <input
                      type="radio"
                      value="ABOVE"
                      checked={formData.alertType === "ABOVE"}
                      onChange={(e) => setFormData({...formData, alertType: e.target.value})}
                    />
                    Goes Above Target
                  </label>
                  <label>
                    <input
                      type="radio"
                      value="BELOW"
                      checked={formData.alertType === "BELOW"}
                      onChange={(e) => setFormData({...formData, alertType: e.target.value})}
                    />
                    Goes Below Target
                  </label>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-blue" onClick={handleCreateAlert}>
                Create Alert
              </button>
              <button className="btn btn-grey" onClick={() => setShowCreateModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Alerts;