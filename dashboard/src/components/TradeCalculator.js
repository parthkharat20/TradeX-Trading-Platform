import React, { useState, useEffect } from "react";
import axios from "axios";
import { Calculate, TrendingUp, TrendingDown, Info } from "@mui/icons-material";
import "./TradeCalculator.css";

const TradeCalculator = () => {
  const [funds, setFunds] = useState(null);
  const [holdings, setHoldings] = useState([]);
  const [calc, setCalc] = useState({
    stock: "",
    tradeType: "BUY",
    quantity: 1,
    buyPrice: 0,
    sellPrice: 0,
    targetPrice: 0,
    stopLoss: 0,
  });
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const [fundsRes, holdingsRes] = await Promise.all([
        axios.get("http://localhost:3002/funds", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:3002/allHoldings", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setFunds(fundsRes.data);
      setHoldings(holdingsRes.data);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const handleCalculate = () => {
    if (calc.tradeType === "BUY") {
      calculateBuy();
    } else {
      calculateSell();
    }
  };

  const calculateBuy = () => {
    const investment = calc.quantity * calc.buyPrice;
    const targetValue = calc.quantity * calc.targetPrice;
    const stopLossValue = calc.quantity * calc.stopLoss;

    const targetProfit = targetValue - investment;
    const stopLossLoss = stopLossValue - investment;

    const targetProfitPercent = ((targetProfit / investment) * 100).toFixed(2);
    const stopLossPercent = ((stopLossLoss / investment) * 100).toFixed(2);

    const brokerage = investment * 0.0003; // 0.03% brokerage
    const stt = investment * 0.001; // 0.1% STT
    const totalCharges = brokerage + stt;

    const canAfford = funds && investment <= funds.availableBalance;

    setResult({
      type: "BUY",
      investment,
      targetProfit,
      stopLossLoss,
      targetProfitPercent,
      stopLossPercent,
      brokerage: brokerage.toFixed(2),
      stt: stt.toFixed(2),
      totalCharges: totalCharges.toFixed(2),
      netProfit: (targetProfit - totalCharges).toFixed(2),
      canAfford,
      required: investment.toFixed(2),
      available: funds?.availableBalance.toFixed(2),
    });
  };

  const calculateSell = () => {
    const holding = holdings.find((h) => h.name === calc.stock);
    if (!holding) {
      alert("Please select a stock from your holdings");
      return;
    }

    const investment = holding.avg * calc.quantity;
    const saleValue = calc.quantity * calc.sellPrice;
    const profit = saleValue - investment;
    const profitPercent = ((profit / investment) * 100).toFixed(2);

    const brokerage = saleValue * 0.0003;
    const stt = saleValue * 0.001;
    const totalCharges = brokerage + stt;

    const canSell = calc.quantity <= holding.qty;

    setResult({
      type: "SELL",
      investment,
      saleValue,
      profit,
      profitPercent,
      brokerage: brokerage.toFixed(2),
      stt: stt.toFixed(2),
      totalCharges: totalCharges.toFixed(2),
      netProfit: (profit - totalCharges).toFixed(2),
      canSell,
      owned: holding.qty,
      requested: calc.quantity,
    });
  };

  return (
    <div className="trade-calculator-page">
      <div className="calculator-header">
        <h2>
          <Calculate style={{ fontSize: "1.5rem" }} />
          Trade Calculator
        </h2>
        <div className="funds-display">
          <span className="funds-label">Available:</span>
          <span className="funds-value">
            ₹{funds?.availableBalance?.toFixed(2) || "0.00"}
          </span>
        </div>
      </div>

      <div className="calculator-container">
        {/* Input Form */}
        <div className="calculator-form">
          <h3>Calculate Your Trade</h3>

          {/* Trade Type */}
          <div className="form-group">
            <label>Trade Type</label>
            <div className="trade-type-btns">
              <button
                className={calc.tradeType === "BUY" ? "active buy" : "buy"}
                onClick={() => setCalc({ ...calc, tradeType: "BUY" })}
              >
                <TrendingUp />
                Buy
              </button>
              <button
                className={calc.tradeType === "SELL" ? "active sell" : "sell"}
                onClick={() => setCalc({ ...calc, tradeType: "SELL" })}
              >
                <TrendingDown />
                Sell
              </button>
            </div>
          </div>

          {/* Stock Selection for SELL */}
          {calc.tradeType === "SELL" && (
            <div className="form-group">
              <label>Select Stock</label>
              <select
                value={calc.stock}
                onChange={(e) => setCalc({ ...calc, stock: e.target.value })}
              >
                <option value="">Choose from holdings...</option>
                {holdings.map((h) => (
                  <option key={h.name} value={h.name}>
                    {h.name} (You own: {h.qty})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Stock Name for BUY */}
          {calc.tradeType === "BUY" && (
            <div className="form-group">
              <label>Stock Name</label>
              <input
                type="text"
                value={calc.stock}
                onChange={(e) => setCalc({ ...calc, stock: e.target.value })}
                placeholder="e.g., RELIANCE"
              />
            </div>
          )}

          {/* Quantity */}
          <div className="form-group">
            <label>Quantity</label>
            <input
              type="number"
              value={calc.quantity}
              onChange={(e) =>
                setCalc({ ...calc, quantity: Number(e.target.value) })
              }
              min="1"
            />
          </div>

          {/* BUY Fields */}
          {calc.tradeType === "BUY" && (
            <>
              <div className="form-group">
                <label>Buy Price (₹)</label>
                <input
                  type="number"
                  value={calc.buyPrice}
                  onChange={(e) =>
                    setCalc({ ...calc, buyPrice: Number(e.target.value) })
                  }
                  step="0.05"
                />
              </div>

              <div className="form-group">
                <label>Target Price (₹)</label>
                <input
                  type="number"
                  value={calc.targetPrice}
                  onChange={(e) =>
                    setCalc({ ...calc, targetPrice: Number(e.target.value) })
                  }
                  step="0.05"
                />
              </div>

              <div className="form-group">
                <label>Stop Loss (₹)</label>
                <input
                  type="number"
                  value={calc.stopLoss}
                  onChange={(e) =>
                    setCalc({ ...calc, stopLoss: Number(e.target.value) })
                  }
                  step="0.05"
                />
              </div>
            </>
          )}

          {/* SELL Fields */}
          {calc.tradeType === "SELL" && (
            <div className="form-group">
              <label>Sell Price (₹)</label>
              <input
                type="number"
                value={calc.sellPrice}
                onChange={(e) =>
                  setCalc({ ...calc, sellPrice: Number(e.target.value) })
                }
                step="0.05"
              />
            </div>
          )}

          <button className="btn btn-blue calculate-btn" onClick={handleCalculate}>
            <Calculate />
            Calculate
          </button>
        </div>

        {/* Result Display */}
        {result && (
          <div className="calculator-result">
            <h3>📊 Calculation Result</h3>

            {result.type === "BUY" ? (
              <>
                {/* Affordability Check */}
                <div
                  className={`affordability-alert ${
                    result.canAfford ? "success" : "error"
                  }`}
                >
                  {result.canAfford ? (
                    <>
                      <Info />
                      <span>
                        ✅ You can afford this trade! Required: ₹{result.required}
                      </span>
                    </>
                  ) : (
                    <>
                      <Info />
                      <span>
                        ❌ Insufficient funds! Required: ₹{result.required},
                        Available: ₹{result.available}
                      </span>
                    </>
                  )}
                </div>

                {/* Investment */}
                <div className="result-row">
                  <span>Total Investment:</span>
                  <span className="value">₹{result.investment.toFixed(2)}</span>
                </div>

                {/* Target Profit */}
                <div className="result-row profit-row">
                  <span>Target Profit:</span>
                  <span className="value profit">
                    +₹{result.targetProfit.toFixed(2)} ({result.targetProfitPercent}
                    %)
                  </span>
                </div>

                {/* Stop Loss */}
                <div className="result-row loss-row">
                  <span>Stop Loss:</span>
                  <span className="value loss">
                    ₹{result.stopLossLoss.toFixed(2)} ({result.stopLossPercent}%)
                  </span>
                </div>

                {/* Charges */}
                <div className="charges-section">
                  <div className="result-row">
                    <span>Brokerage (0.03%):</span>
                    <span>₹{result.brokerage}</span>
                  </div>
                  <div className="result-row">
                    <span>STT (0.1%):</span>
                    <span>₹{result.stt}</span>
                  </div>
                  <div className="result-row total">
                    <span>Total Charges:</span>
                    <span>₹{result.totalCharges}</span>
                  </div>
                </div>

                {/* Net Profit */}
                <div className="net-profit">
                  <span>Net Profit (After Charges):</span>
                  <span className="value profit">₹{result.netProfit}</span>
                </div>
              </>
            ) : (
              <>
                {/* Can Sell Check */}
                <div
                  className={`affordability-alert ${
                    result.canSell ? "success" : "error"
                  }`}
                >
                  {result.canSell ? (
                    <>
                      <Info />
                      <span>
                        ✅ You can sell {result.requested} shares (You own:{" "}
                        {result.owned})
                      </span>
                    </>
                  ) : (
                    <>
                      <Info />
                      <span>
                        ❌ Insufficient quantity! You own: {result.owned}, Requested:{" "}
                        {result.requested}
                      </span>
                    </>
                  )}
                </div>

                {/* Investment */}
                <div className="result-row">
                  <span>Your Investment:</span>
                  <span className="value">₹{result.investment.toFixed(2)}</span>
                </div>

                {/* Sale Value */}
                <div className="result-row">
                  <span>Sale Value:</span>
                  <span className="value">₹{result.saleValue.toFixed(2)}</span>
                </div>

                {/* Profit/Loss */}
                <div
                  className={`result-row ${
                    result.profit >= 0 ? "profit-row" : "loss-row"
                  }`}
                >
                  <span>Profit/Loss:</span>
                  <span className={`value ${result.profit >= 0 ? "profit" : "loss"}`}>
                    {result.profit >= 0 ? "+" : ""}₹{result.profit.toFixed(2)} (
                    {result.profitPercent}%)
                  </span>
                </div>

                {/* Charges */}
                <div className="charges-section">
                  <div className="result-row">
                    <span>Brokerage (0.03%):</span>
                    <span>₹{result.brokerage}</span>
                  </div>
                  <div className="result-row">
                    <span>STT (0.1%):</span>
                    <span>₹{result.stt}</span>
                  </div>
                  <div className="result-row total">
                    <span>Total Charges:</span>
                    <span>₹{result.totalCharges}</span>
                  </div>
                </div>

                {/* Net Profit */}
                <div className="net-profit">
                  <span>Net Profit (After Charges):</span>
                  <span
                    className={`value ${
                      parseFloat(result.netProfit) >= 0 ? "profit" : "loss"
                    }`}
                  >
                    {parseFloat(result.netProfit) >= 0 ? "+" : ""}₹{result.netProfit}
                  </span>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TradeCalculator;