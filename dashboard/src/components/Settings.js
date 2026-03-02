import React, { useState } from "react";
import {
  Brightness4,
  Brightness7,
  Notifications,
  Security,
  Language,
  Palette,
  VolumeUp,
  Download,
  DeleteForever,
  Save,
} from "@mui/icons-material";
import "./Settings.css";

const Settings = () => {
  const [settings, setSettings] = useState({
    darkMode: false,
    notifications: {
      orderUpdates: true,
      priceAlerts: true,
      marketNews: false,
      emailNotifications: true,
      smsNotifications: false,
    },
    trading: {
      confirmOrders: true,
      soundEffects: true,
      autoRefresh: true,
      defaultOrderType: "MARKET",
      defaultQuantity: 1,
    },
    display: {
      compactView: false,
      showPercentage: true,
      currency: "INR",
      dateFormat: "DD/MM/YYYY",
    },
  });

  const [activeTab, setActiveTab] = useState("general");

  const handleToggle = (category, key) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: !prev[category][key],
      },
    }));
  };

  const handleSave = () => {
    localStorage.setItem("appSettings", JSON.stringify(settings));
    alert("Settings saved successfully! ✅");
  };

  const handleReset = () => {
    if (window.confirm("Reset all settings to default?")) {
      // Reset logic
      alert("Settings reset to default!");
    }
  };

  const handleExportData = () => {
    alert("Exporting your trading data...");
  };

  const handleDeleteAccount = () => {
    if (
      window.confirm(
        "⚠️ Are you absolutely sure? This will permanently delete your account and all data!"
      )
    ) {
      const confirm2 = window.prompt('Type "DELETE" to confirm:');
      if (confirm2 === "DELETE") {
        alert("Account deletion initiated. You will receive confirmation email.");
      }
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h2>Settings</h2>
        <div className="header-actions">
          <button className="btn btn-grey" onClick={handleReset}>
            Reset to Default
          </button>
          <button className="btn btn-blue" onClick={handleSave}>
            <Save style={{ fontSize: "1rem" }} />
            Save Changes
          </button>
        </div>
      </div>

      <div className="settings-container">
        {/* Tabs */}
        <div className="settings-tabs">
          <button
            className={activeTab === "general" ? "tab active" : "tab"}
            onClick={() => setActiveTab("general")}
          >
            <Palette style={{ fontSize: "1.1rem" }} />
            General
          </button>
          <button
            className={activeTab === "notifications" ? "tab active" : "tab"}
            onClick={() => setActiveTab("notifications")}
          >
            <Notifications style={{ fontSize: "1.1rem" }} />
            Notifications
          </button>
          <button
            className={activeTab === "trading" ? "tab active" : "tab"}
            onClick={() => setActiveTab("trading")}
          >
            📊 Trading
          </button>
          <button
            className={activeTab === "security" ? "tab active" : "tab"}
            onClick={() => setActiveTab("security")}
          >
            <Security style={{ fontSize: "1.1rem" }} />
            Security
          </button>
        </div>

        {/* Content */}
        <div className="settings-content">
          {/* General Settings */}
          {activeTab === "general" && (
            <div className="settings-section">
              <h3>Appearance</h3>

              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-label">
                    {settings.darkMode ? <Brightness4 /> : <Brightness7 />}
                    <span>Dark Mode</span>
                  </div>
                  <p className="setting-desc">
                    Switch between light and dark theme
                  </p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.darkMode}
                    onChange={() =>
                      setSettings({ ...settings, darkMode: !settings.darkMode })
                    }
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-label">
                    <Palette />
                    <span>Compact View</span>
                  </div>
                  <p className="setting-desc">Reduce spacing for more content</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.display.compactView}
                    onChange={() => handleToggle("display", "compactView")}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-label">
                    <Language />
                    <span>Currency</span>
                  </div>
                  <p className="setting-desc">Display currency format</p>
                </div>
                <select className="setting-select">
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
            </div>
          )}

          {/* Notifications Settings */}
          {activeTab === "notifications" && (
            <div className="settings-section">
              <h3>Notification Preferences</h3>

              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-label">
                    <Notifications />
                    <span>Order Updates</span>
                  </div>
                  <p className="setting-desc">
                    Get notified when orders are executed
                  </p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.notifications.orderUpdates}
                    onChange={() => handleToggle("notifications", "orderUpdates")}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-label">
                    <Notifications />
                    <span>Price Alerts</span>
                  </div>
                  <p className="setting-desc">
                    Alert when stocks hit target price
                  </p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.notifications.priceAlerts}
                    onChange={() => handleToggle("notifications", "priceAlerts")}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-label">
                    <Notifications />
                    <span>Market News</span>
                  </div>
                  <p className="setting-desc">Breaking news and market updates</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.notifications.marketNews}
                    onChange={() => handleToggle("notifications", "marketNews")}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-label">
                    📧 <span>Email Notifications</span>
                  </div>
                  <p className="setting-desc">Receive updates via email</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.notifications.emailNotifications}
                    onChange={() =>
                      handleToggle("notifications", "emailNotifications")
                    }
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          )}

          {/* Trading Settings */}
          {activeTab === "trading" && (
            <div className="settings-section">
              <h3>Trading Preferences</h3>

              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-label">
                    <VolumeUp />
                    <span>Sound Effects</span>
                  </div>
                  <p className="setting-desc">Play sound on order execution</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.trading.soundEffects}
                    onChange={() => handleToggle("trading", "soundEffects")}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-label">
                    ✅ <span>Confirm Orders</span>
                  </div>
                  <p className="setting-desc">
                    Show confirmation before placing orders
                  </p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.trading.confirmOrders}
                    onChange={() => handleToggle("trading", "confirmOrders")}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-label">
                    📝 <span>Default Order Type</span>
                  </div>
                  <p className="setting-desc">Set default order type for trades</p>
                </div>
                <select className="setting-select">
                  <option value="MARKET">Market Order</option>
                  <option value="LIMIT">Limit Order</option>
                  <option value="STOP_LOSS">Stop Loss</option>
                </select>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-label">
                    🔢 <span>Default Quantity</span>
                  </div>
                  <p className="setting-desc">Default quantity for orders</p>
                </div>
                <input
                  type="number"
                  className="setting-input"
                  value={settings.trading.defaultQuantity}
                  min="1"
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      trading: {
                        ...settings.trading,
                        defaultQuantity: parseInt(e.target.value),
                      },
                    })
                  }
                />
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === "security" && (
            <div className="settings-section">
              <h3>Security & Privacy</h3>

              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-label">
                    <Security />
                    <span>Two-Factor Authentication</span>
                  </div>
                  <p className="setting-desc">Add extra security to your account</p>
                </div>
                <button className="btn btn-blue">Enable 2FA</button>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-label">
                    🔑 <span>Change Password</span>
                  </div>
                  <p className="setting-desc">Update your account password</p>
                </div>
                <button className="btn btn-grey">Change Password</button>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <div className="setting-label">
                    <Download />
                    <span>Export Data</span>
                  </div>
                  <p className="setting-desc">
                    Download all your trading data and history
                  </p>
                </div>
                <button className="btn btn-blue" onClick={handleExportData}>
                  Export Data
                </button>
              </div>

              <div className="setting-item danger-zone">
                <div className="setting-info">
                  <div className="setting-label">
                    <DeleteForever />
                    <span>Delete Account</span>
                  </div>
                  <p className="setting-desc">
                    Permanently delete your account and all data
                  </p>
                </div>
                <button className="btn btn-danger" onClick={handleDeleteAccount}>
                  Delete Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;