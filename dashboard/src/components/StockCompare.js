import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  CompareArrows,
  TrendingUp,
  TrendingDown,
  Close,
  Refresh,
} from "@mui/icons-material";
import "./StockCompare.css";

const StockCompare = () => {
  const [holdings, setHoldings] = useState([]);
  const [stock1, setStock1] = useState(null);
  const [stock2, setStock2] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHoldings();
  }, []);

  const fetchHoldings = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await axios.get("http://localhost:3002/allHoldings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHoldings(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error:", err);
      setLoading(false);
    }
  };

  const calculateMetrics = (holding) => {
    if (!holding) return null;

    const invested = holding.avg * holding.qty;
    const current = holding.price * holding.qty;
    const pnl = current - invested;
    const pnlPercent = ((pnl / invested) * 100).toFixed(2);
    const dayChange = ((holding.price - holding.avg) / holding.avg * 100).toFixed(2);

    return {
      invested,
      current,
      pnl,
      pnlPercent,
      dayChange,
      avgPrice: holding.avg,
      currentPrice: holding.price,
      quantity: holding.qty,
    };
  };

  const metrics1 = calculateMetrics(stock1);
  const metrics2 = calculateMetrics(stock2);

  const compareMetric = (metric, key) => {
    if (!metrics1 || !metrics2) return null;
    const val1 = metrics1[key];
    const val2 = metrics2[key];
    
    if (val1 > val2) return "better1";
    if (val2 > val1) return "better2";
    return "equal";
  };

  if (loading) {
    return (
      <div className="stock-compare-page">
        <div className="loading-spinner"></div>
        <p>Loading holdings...</p>
      </div>
    );
  }

  return (
    <div className="stock-compare-page">
      <div className="compare-header">
        <h2>
          <CompareArrows style={{ fontSize: "1.5rem" }} />
          Compare Stocks
        </h2>
        <button className="btn btn-blue" onClick={fetchHoldings}>
          <Refresh style={{ fontSize: "1rem" }} />
          Refresh
        </button>
      </div>

      {holdings.length < 2 && (
        <div className="no-holdings-msg">
          <p>You need at least 2 holdings to compare stocks.</p>
        </div>
      )}

      {holdings.length >= 2 && (
        <>
          {/* Stock Selectors */}
          <div className="stock-selectors">
            <div className="selector">
              <label>Select Stock 1</label>
              <select
                value={stock1?.name || ""}
                onChange={(e) => {
                  const selected = holdings.find((h) => h.name === e.target.value);
                  setStock1(selected);
                }}
              >
                <option value="">Choose...</option>
                {holdings.map((h) => (
                  <option key={h.name} value={h.name}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="vs-badge">VS</div>

            <div className="selector">
              <label>Select Stock 2</label>
              <select
                value={stock2?.name || ""}
                onChange={(e) => {
                  const selected = holdings.find((h) => h.name === e.target.value);
                  setStock2(selected);
                }}
              >
                <option value="">Choose...</option>
                {holdings.map((h) => (
                  <option key={h.name} value={h.name}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Comparison Result */}
          {stock1 && stock2 && (
            <div className="comparison-result">
              {/* Header Cards */}
              <div className="comparison-cards">
                <div className="compare-card stock1">
                  <h3>{stock1.name}</h3>
                  <div className="card-price">
                    ₹{metrics1.currentPrice.toFixed(2)}
                  </div>
                  <div
                    className={`card-change ${
                      metrics1.pnl >= 0 ? "profit" : "loss"
                    }`}
                  >
                    {metrics1.pnl >= 0 ? <TrendingUp /> : <TrendingDown />}
                    {metrics1.pnl >= 0 ? "+" : ""}
                    {metrics1.pnlPercent}%
                  </div>
                </div>

                <div className="compare-card stock2">
                  <h3>{stock2.name}</h3>
                  <div className="card-price">
                    ₹{metrics2.currentPrice.toFixed(2)}
                  </div>
                  <div
                    className={`card-change ${
                      metrics2.pnl >= 0 ? "profit" : "loss"
                    }`}
                  >
                    {metrics2.pnl >= 0 ? <TrendingUp /> : <TrendingDown />}
                    {metrics2.pnl >= 0 ? "+" : ""}
                    {metrics2.pnlPercent}%
                  </div>
                </div>
              </div>

              {/* Comparison Table */}
              <div className="comparison-table">
                <table>
                  <thead>
                    <tr>
                      <th>Metric</th>
                      <th>{stock1.name}</th>
                      <th>{stock2.name}</th>
                      <th>Winner</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="metric-name">Quantity</td>
                      <td>{metrics1.quantity}</td>
                      <td>{metrics2.quantity}</td>
                      <td>
                        <span
                          className={`winner-badge ${compareMetric(
                            metrics1,
                            "quantity"
                          )}`}
                        >
                          {compareMetric(metrics1, "quantity") === "better1"
                            ? stock1.name
                            : compareMetric(metrics1, "quantity") === "better2"
                            ? stock2.name
                            : "Equal"}
                        </span>
                      </td>
                    </tr>

                    <tr>
                      <td className="metric-name">Avg. Buy Price</td>
                      <td>₹{metrics1.avgPrice.toFixed(2)}</td>
                      <td>₹{metrics2.avgPrice.toFixed(2)}</td>
                      <td>-</td>
                    </tr>

                    <tr>
                      <td className="metric-name">Current Price</td>
                      <td>₹{metrics1.currentPrice.toFixed(2)}</td>
                      <td>₹{metrics2.currentPrice.toFixed(2)}</td>
                      <td>
                        <span
                          className={`winner-badge ${compareMetric(
                            metrics1,
                            "currentPrice"
                          )}`}
                        >
                          {compareMetric(metrics1, "currentPrice") === "better1"
                            ? stock1.name
                            : stock2.name}
                        </span>
                      </td>
                    </tr>

                    <tr>
                      <td className="metric-name">Total Invested</td>
                      <td>₹{metrics1.invested.toFixed(2)}</td>
                      <td>₹{metrics2.invested.toFixed(2)}</td>
                      <td>
                        <span
                          className={`winner-badge ${compareMetric(
                            metrics1,
                            "invested"
                          )}`}
                        >
                          {compareMetric(metrics1, "invested") === "better1"
                            ? stock1.name
                            : stock2.name}
                        </span>
                      </td>
                    </tr>

                    <tr>
                      <td className="metric-name">Current Value</td>
                      <td>₹{metrics1.current.toFixed(2)}</td>
                      <td>₹{metrics2.current.toFixed(2)}</td>
                      <td>
                        <span
                          className={`winner-badge ${compareMetric(
                            metrics1,
                            "current"
                          )}`}
                        >
                          {compareMetric(metrics1, "current") === "better1"
                            ? stock1.name
                            : stock2.name}
                        </span>
                      </td>
                    </tr>

                    <tr className="highlight-row">
                      <td className="metric-name">Total P&L</td>
                      <td
                        className={metrics1.pnl >= 0 ? "profit" : "loss"}
                      >
                        {metrics1.pnl >= 0 ? "+" : ""}₹
                        {metrics1.pnl.toFixed(2)}
                      </td>
                      <td
                        className={metrics2.pnl >= 0 ? "profit" : "loss"}
                      >
                        {metrics2.pnl >= 0 ? "+" : ""}₹
                        {metrics2.pnl.toFixed(2)}
                      </td>
                      <td>
                        <span
                          className={`winner-badge ${compareMetric(
                            metrics1,
                            "pnl"
                          )}`}
                        >
                          {compareMetric(metrics1, "pnl") === "better1"
                            ? stock1.name
                            : stock2.name}
                        </span>
                      </td>
                    </tr>

                    <tr className="highlight-row">
                      <td className="metric-name">P&L %</td>
                      <td
                        className={
                          metrics1.pnlPercent >= 0 ? "profit" : "loss"
                        }
                      >
                        {metrics1.pnlPercent >= 0 ? "+" : ""}
                        {metrics1.pnlPercent}%
                      </td>
                      <td
                        className={
                          metrics2.pnlPercent >= 0 ? "profit" : "loss"
                        }
                      >
                        {metrics2.pnlPercent >= 0 ? "+" : ""}
                        {metrics2.pnlPercent}%
                      </td>
                      <td>
                        <span
                          className={`winner-badge ${compareMetric(
                            metrics1,
                            "pnlPercent"
                          )}`}
                        >
                          {compareMetric(metrics1, "pnlPercent") === "better1"
                            ? stock1.name
                            : stock2.name}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Winner Summary */}
              <div className="winner-summary">
                <h3>📊 Performance Summary</h3>
                <div className="summary-text">
                  {metrics1.pnlPercent > metrics2.pnlPercent ? (
                    <p>
                      <strong>{stock1.name}</strong> is performing{" "}
                      <strong className="profit">
                        {(metrics1.pnlPercent - metrics2.pnlPercent).toFixed(2)}%
                        better
                      </strong>{" "}
                      than {stock2.name} in terms of returns.
                    </p>
                  ) : metrics2.pnlPercent > metrics1.pnlPercent ? (
                    <p>
                      <strong>{stock2.name}</strong> is performing{" "}
                      <strong className="profit">
                        {(metrics2.pnlPercent - metrics1.pnlPercent).toFixed(2)}%
                        better
                      </strong>{" "}
                      than {stock1.name} in terms of returns.
                    </p>
                  ) : (
                    <p>Both stocks are performing equally.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StockCompare;
