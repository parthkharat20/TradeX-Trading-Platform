import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Person, 
  Email, 
  Phone, 
  Edit,
  Save,
  Cancel 
} from "@mui/icons-material";
import "./Profile.css";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    name: localStorage.getItem("userName") || "",
    email: "",
    phone: "",
    address: "",
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    // Save to backend
    localStorage.setItem("userName", userData.name);
    setIsEditing(false);
    alert("Profile updated successfully!");
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h2>My Profile</h2>
        {!isEditing ? (
          <button className="btn btn-blue" onClick={handleEdit}>
            <Edit style={{ fontSize: '1rem' }} />
            Edit Profile
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-green" onClick={handleSave}>
              <Save style={{ fontSize: '1rem' }} />
              Save
            </button>
            <button className="btn btn-grey" onClick={handleCancel}>
              <Cancel style={{ fontSize: '1rem' }} />
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="profile-card">
        <div className="profile-avatar-large">
          {userData.name.substring(0, 2).toUpperCase()}
        </div>

        <div className="profile-form">
          <div className="form-row">
            <Person className="form-icon" />
            <div className="form-field">
              <label>Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={userData.name}
                  onChange={(e) => setUserData({...userData, name: e.target.value})}
                />
              ) : (
                <p>{userData.name}</p>
              )}
            </div>
          </div>

          <div className="form-row">
            <Email className="form-icon" />
            <div className="form-field">
              <label>Email</label>
              {isEditing ? (
                <input
                  type="email"
                  value={userData.email}
                  onChange={(e) => setUserData({...userData, email: e.target.value})}
                  placeholder="your.email@example.com"
                />
              ) : (
                <p>{userData.email || "Not provided"}</p>
              )}
            </div>
          </div>

          <div className="form-row">
            <Phone className="form-icon" />
            <div className="form-field">
              <label>Phone</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={userData.phone}
                  onChange={(e) => setUserData({...userData, phone: e.target.value})}
                  placeholder="+91 XXXXXXXXXX"
                />
              ) : (
                <p>{userData.phone || "Not provided"}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="account-stats">
        <h3>Account Statistics</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">Member Since</span>
            <span className="stat-value">Jan 2024</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total Trades</span>
            <span className="stat-value">156</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Win Rate</span>
            <span className="stat-value success">68%</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Avg Return</span>
            <span className="stat-value success">+12.5%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;