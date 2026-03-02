import React, { useState, useEffect } from "react";
import { 
  Close, 
  TrendingUp, 
  TrendingDown, 
  ShowChart,
  Info
} from "@mui/icons-material";
import "./StockDetailModal.css";

const StockDetailModal = ({ stock, onClose }) => {
  const [activeTab, setActiveTab] = useState("overview"); // overview, fundamentals, technicals

  if (!stock) return null;

  const priceChange = parseFloat(stock.percent);
  const isPositive = priceChange >= 0;

  // Mock data (can be replaced with real API)
  const stockDetails = {
    companyName: `${stock.name} Limited`,
    sector: "Technology",
    marketCap: "₹2,45,678 Cr",
    peRatio: "25.43",
    eps: "₹48.50",
    week52High: "₹" + (stock.price * 1.2).toFixed(2),
    week52Low: "₹" + (stock.price * 0.8).toFixed(2),
    volume: "1.2M",
    avgVolume: "1.5M",
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="stock-detail-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="header-left">
            <h2>{stock.name}</h2>
            <p className="company-name">{stockDetails.companyName}</p>
          </div>
          <button className="close-btn" onClick={onClose}>
            <Close />
          </button>
        </div>

        {/* Price Section */}
        <div className="price-section">
          <div className="current-price">
            <span className="price-value">₹{stock.price.toFixed(2)}</span>
            <div className={`price-change ${isPositive ? 'up' : 'down'}`}>
              {isPositive ? <TrendingUp /> : <TrendingDown />}
              <span>{isPositive ? '+' : ''}{priceChange.toFixed(2)}%</span>
            </div>
          </div>
          <div className="price-range">
            <div className="range-item">
              <span className="range-label">Day Range</span>
              <span className="range-value">
                ₹{(stock.price * 0.98).toFixed(2)} - ₹{(stock.price * 1.02).toFixed(2)}
              </span>
            </div>
            <div className="range-item">
              <span className="range-label">52 Week</span>
              <span className="range-value">
                {stockDetails.week52Low} - {stockDetails.week52High}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="modal-tabs">
          <button
            className={activeTab === "overview" ? "tab-btn active" : "tab-btn"}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button
            className={activeTab === "fundamentals" ? "tab-btn active" : "tab-btn"}
            onClick={() => setActiveTab("fundamentals")}
          >
            Fundamentals
          </button>
          <button
            className={activeTab === "technicals" ? "tab-btn active" : "tab-btn"}
            onClick={() => setActiveTab("technicals")}
          >
            Technicals
          </button>
        </div>

        {/* Content */}
        <div className="modal-content">
          {activeTab === "overview" && (
            <div className="overview-content">
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Market Cap</span>
                  <span className="info-value">{stockDetails.marketCap}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Sector</span>
                  <span className="info-value">{stockDetails.sector}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Volume</span>
                  <span className="info-value">{stockDetails.volume}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Avg Volume</span>
                  <span className="info-value">{stockDetails.avgVolume}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "fundamentals" && (
            <div className="fundamentals-content">
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">P/E Ratio</span>
                  <span className="info-value">{stockDetails.peRatio}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">EPS</span>
                  <span className="info-value">{stockDetails.eps}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Book Value</span>
                  <span className="info-value">₹125.50</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Dividend Yield</span>
                  <span className="info-value">1.2%</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "technicals" && (
            <div className="technicals-content">
              <div className="technical-indicator">
                <span className="indicator-label">RSI (14)</span>
                <div className="indicator-bar">
                  <div className="indicator-fill" style={{ width: '65%' }}></div>
                </div>
                <span className="indicator-value">65.2</span>
              </div>
              <div className="technical-indicator">
                <span className="indicator-label">MACD</span>
                <span className="indicator-value positive">+2.4</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockDetailModal;