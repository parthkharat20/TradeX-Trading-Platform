import React, { useState } from "react";
import { Speed, TrendingUp, TrendingDown, Close } from "@mui/icons-material";
import "./QuickActions.css";

const QuickActions = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showQuickTrade, setShowQuickTrade] = useState(false);
  const [tradeType, setTradeType] = useState("BUY");

  const quickStocks = ["RELIANCE", "TCS", "INFY", "HDFC", "ITC"];

  const handleQuickTrade = (stock, type) => {
    alert(`Quick ${type}: ${stock} - Opening trade window...`);
    // Integrate with your existing buy/sell logic
  };

  return (
    <>
      {/* Floating Action Button */}
      <button 
        className="quick-actions-fab"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <Close /> : <Speed />}
      </button>

      {/* Quick Actions Menu */}
      {isOpen && (
        <div className="quick-actions-menu">
          <button 
            className="quick-action buy"
            onClick={() => {
              setShowQuickTrade(true);
              setTradeType("BUY");
            }}
          >
            <TrendingUp />
            Quick Buy
          </button>
          <button 
            className="quick-action sell"
            onClick={() => {
              setShowQuickTrade(true);
              setTradeType("SELL");
            }}
          >
            <TrendingDown />
            Quick Sell
          </button>
        </div>
      )}

      {/* Quick Trade Panel */}
      {showQuickTrade && (
        <div className="quick-trade-panel">
          <div className="panel-header">
            <h4>Quick {tradeType}</h4>
            <button onClick={() => setShowQuickTrade(false)}>
              <Close />
            </button>
          </div>
          <div className="quick-stocks">
            {quickStocks.map((stock) => (
              <button
                key={stock}
                className={`stock-btn ${tradeType.toLowerCase()}`}
                onClick={() => handleQuickTrade(stock, tradeType)}
              >
                {stock}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default QuickActions;