import React, { useState, useEffect } from "react";
import "./LiveIndicator.css";

const LiveIndicator = ({ isActive = true, lastUpdated = null }) => {
  const [pulse, setPulse] = useState(true);

  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        setPulse(prev => !prev);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isActive]);

  const formatTime = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="live-indicator-wrapper">
      <div className={`live-status ${isActive ? 'active' : 'inactive'} ${pulse ? 'pulse' : ''}`}>
        <span className="live-dot"></span>
        <span className="live-label">LIVE</span>
      </div>
      {lastUpdated && (
        <span className="update-time">
          {formatTime(lastUpdated)}
        </span>
      )}
    </div>
  );
};

export default LiveIndicator;