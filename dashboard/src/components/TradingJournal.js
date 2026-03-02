import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Book,
  Add,
  Edit,
  Delete,
  Save,
  Close,
  FilterList,
  TrendingUp,
  TrendingDown,
} from "@mui/icons-material";
import "./TradingJournal.css";

const TradingJournal = () => {
  const [entries, setEntries] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [filter, setFilter] = useState("all"); // all, profit, loss
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    stock: "",
    action: "BUY",
    quantity: 0,
    entryPrice: 0,
    exitPrice: 0,
    pnl: 0,
    notes: "",
    emotion: "neutral", // confident, nervous, neutral, excited
    strategy: "",
  });

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = () => {
    const userId = localStorage.getItem("userName");
    const saved = localStorage.getItem(`tradingJournal_${userId}`);
    if (saved) {
      setEntries(JSON.parse(saved));
    }
  };

  const saveEntries = (newEntries) => {
    const userId = localStorage.getItem("userName");
    localStorage.setItem(`tradingJournal_${userId}`, JSON.stringify(newEntries));
    setEntries(newEntries);
  };

  const handleAddEntry = () => {
    const pnl = (formData.exitPrice - formData.entryPrice) * formData.quantity;
    const newEntry = {
      ...formData,
      pnl,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    };

    const updated = [newEntry, ...entries];
    saveEntries(updated);
    resetForm();
    setShowAddModal(false);
  };

  const handleEditEntry = () => {
    const pnl = (formData.exitPrice - formData.entryPrice) * formData.quantity;
    const updated = entries.map((entry) =>
      entry.id === editingEntry.id ? { ...formData, pnl, id: entry.id } : entry
    );
    saveEntries(updated);
    resetForm();
    setEditingEntry(null);
  };

  const handleDeleteEntry = (id) => {
    if (window.confirm("Delete this journal entry?")) {
      const updated = entries.filter((entry) => entry.id !== id);
      saveEntries(updated);
    }
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split("T")[0],
      stock: "",
      action: "BUY",
      quantity: 0,
      entryPrice: 0,
      exitPrice: 0,
      pnl: 0,
      notes: "",
      emotion: "neutral",
      strategy: "",
    });
  };

  const startEdit = (entry) => {
    setFormData(entry);
    setEditingEntry(entry);
  };

  const getFilteredEntries = () => {
    if (filter === "profit") return entries.filter((e) => e.pnl > 0);
    if (filter === "loss") return entries.filter((e) => e.pnl < 0);
    return entries;
  };

  const filteredEntries = getFilteredEntries();

  // Calculate stats
  const stats = {
    total: entries.length,
    profitable: entries.filter((e) => e.pnl > 0).length,
    losses: entries.filter((e) => e.pnl < 0).length,
    totalPnL: entries.reduce((sum, e) => sum + e.pnl, 0),
    winRate: entries.length
      ? ((entries.filter((e) => e.pnl > 0).length / entries.length) * 100).toFixed(1)
      : 0,
  };

  return (
    <div className="trading-journal-page">
      <div className="journal-header">
        <h2>
          <Book style={{ fontSize: "1.5rem" }} />
          Trading Journal
        </h2>
        <button className="btn btn-blue" onClick={() => setShowAddModal(true)}>
          <Add style={{ fontSize: "1rem" }} />
          New Entry
        </button>
      </div>

      {/* Stats Cards */}
      <div className="journal-stats">
        <div className="stat-card">
          <span className="stat-label">Total Trades</span>
          <span className="stat-value">{stats.total}</span>
        </div>
        <div className="stat-card profit">
          <span className="stat-label">Profitable</span>
          <span className="stat-value">{stats.profitable}</span>
        </div>
        <div className="stat-card loss">
          <span className="stat-label">Losses</span>
          <span className="stat-value">{stats.losses}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Win Rate</span>
          <span className="stat-value">{stats.winRate}%</span>
        </div>
        <div className={`stat-card ${stats.totalPnL >= 0 ? "profit" : "loss"}`}>
          <span className="stat-label">Total P&L</span>
          <span className="stat-value">
            {stats.totalPnL >= 0 ? "+" : ""}₹{stats.totalPnL.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="journal-filters">
        <button
          className={filter === "all" ? "filter-btn active" : "filter-btn"}
          onClick={() => setFilter("all")}
        >
          All ({entries.length})
        </button>
        <button
          className={filter === "profit" ? "filter-btn active" : "filter-btn"}
          onClick={() => setFilter("profit")}
        >
          <TrendingUp style={{ fontSize: "1rem" }} />
          Profitable ({stats.profitable})
        </button>
        <button
          className={filter === "loss" ? "filter-btn active" : "filter-btn"}
          onClick={() => setFilter("loss")}
        >
          <TrendingDown style={{ fontSize: "1rem" }} />
          Losses ({stats.losses})
        </button>
      </div>

      {/* Entries List */}
      <div className="journal-entries">
        {filteredEntries.length === 0 ? (
          <div className="no-entries">
            <Book style={{ fontSize: "3rem", color: "rgb(200, 200, 200)" }} />
            <p>No journal entries yet</p>
            <button className="btn btn-blue" onClick={() => setShowAddModal(true)}>
              Create First Entry
            </button>
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <div key={entry.id} className="journal-entry">
              <div className="entry-header">
                <div className="entry-date">
                  <span className="date">{new Date(entry.date).toLocaleDateString("en-IN")}</span>
                  <span className={`action-badge ${entry.action.toLowerCase()}`}>
                    {entry.action}
                  </span>
                </div>
                <div className="entry-actions">
                  <button className="icon-btn" onClick={() => startEdit(entry)}>
                    <Edit style={{ fontSize: "1rem" }} />
                  </button>
                  <button
                    className="icon-btn delete"
                    onClick={() => handleDeleteEntry(entry.id)}
                  >
                    <Delete style={{ fontSize: "1rem" }} />
                  </button>
                </div>
              </div>

              <div className="entry-body">
                <div className="entry-stock">
                  <h3>{entry.stock}</h3>
                  <span className="emotion-badge">{entry.emotion}</span>
                </div>

                <div className="entry-details">
                  <div className="detail-item">
                    <span className="label">Quantity:</span>
                    <span className="value">{entry.quantity}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Entry:</span>
                    <span className="value">₹{entry.entryPrice.toFixed(2)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Exit:</span>
                    <span className="value">₹{entry.exitPrice.toFixed(2)}</span>
                  </div>
                  <div className="detail-item pnl">
                    <span className="label">P&L:</span>
                    <span className={`value ${entry.pnl >= 0 ? "profit" : "loss"}`}>
                      {entry.pnl >= 0 ? "+" : ""}₹{entry.pnl.toFixed(2)}
                    </span>
                  </div>
                </div>

                {entry.strategy && (
                  <div className="entry-strategy">
                    <strong>Strategy:</strong> {entry.strategy}
                  </div>
                )}

                {entry.notes && (
                  <div className="entry-notes">
                    <strong>Notes:</strong> {entry.notes}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingEntry) && (
        <div className="modal-overlay" onClick={() => {
          setShowAddModal(false);
          setEditingEntry(null);
          resetForm();
        }}>
          <div className="modal-content journal-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingEntry ? "Edit Entry" : "New Journal Entry"}</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingEntry(null);
                  resetForm();
                }}
              >
                <Close />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Stock</label>
                  <input
                    type="text"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: e.target.value.toUpperCase() })
                    }
                    placeholder="e.g., RELIANCE"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Action</label>
                  <select
                    value={formData.action}
                    onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                  >
                    <option value="BUY">BUY</option>
                    <option value="SELL">SELL</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Quantity</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity: Number(e.target.value) })
                    }
                    min="1"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Entry Price (₹)</label>
                  <input
                    type="number"
                    value={formData.entryPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, entryPrice: Number(e.target.value) })
                    }
                    step="0.05"
                  />
                </div>

                <div className="form-group">
                  <label>Exit Price (₹)</label>
                  <input
                    type="number"
                    value={formData.exitPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, exitPrice: Number(e.target.value) })
                    }
                    step="0.05"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Emotion</label>
                  <select
                    value={formData.emotion}
                    onChange={(e) => setFormData({ ...formData, emotion: e.target.value })}
                  >
                    <option value="confident">😎 Confident</option>
                    <option value="nervous">😰 Nervous</option>
                    <option value="neutral">😐 Neutral</option>
                    <option value="excited">🤩 Excited</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Strategy</label>
                  <input
                    type="text"
                    value={formData.strategy}
                    onChange={(e) => setFormData({ ...formData, strategy: e.target.value })}
                    placeholder="e.g., Breakout, Support"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="What did you learn from this trade?"
                  rows="4"
                />
              </div>

              {/* P&L Preview */}
              <div className="pnl-preview">
                <span>Calculated P&L:</span>
                <span
                  className={`pnl-value ${
                    (formData.exitPrice - formData.entryPrice) * formData.quantity >= 0
                      ? "profit"
                      : "loss"
                  }`}
                >
                  {(formData.exitPrice - formData.entryPrice) * formData.quantity >= 0
                    ? "+"
                    : ""}
                  ₹
                  {(
                    (formData.exitPrice - formData.entryPrice) *
                    formData.quantity
                  ).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-blue"
                onClick={editingEntry ? handleEditEntry : handleAddEntry}
              >
                <Save style={{ fontSize: "1rem" }} />
                {editingEntry ? "Update" : "Save Entry"}
              </button>
              <button
                className="btn btn-grey"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingEntry(null);
                  resetForm();
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradingJournal;