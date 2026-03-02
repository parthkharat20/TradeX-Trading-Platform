import React, { useState, useEffect } from "react";
import axios from "axios";
import { VerticalGraph } from "./VerticalGraph";
import LiveIndicator from "./LiveIndicator";
import { updateStockPrice } from "../utils/priceSimulator";

const Holdings = () => {
  const [allHoldings, setAllHoldings] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isLive, setIsLive] = useState(true);

  const fetchHoldings = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/";
      return;
    }

    axios
      .get("http://localhost:3002/allHoldings", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setAllHoldings(res.data))
      .catch((err) => {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/";
        }
        console.error("Error fetching holdings:", err);
      });
  };

  useEffect(() => {
    fetchHoldings();
  }, []);

  // Live price updates every 5 seconds
  useEffect(() => {
    if (!isLive || allHoldings.length === 0) return;

    const interval = setInterval(() => {
      setAllHoldings(prevHoldings => {
        return prevHoldings.map(holding => ({
          ...holding,
          price: updateStockPrice(holding.price)
        }));
      });
      setLastUpdated(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, [isLive, allHoldings.length]);

  const toggleLive = () => {
    setIsLive(prev => !prev);
  };

  // Calculate totals
  const totalInvestment = allHoldings.reduce((sum, stock) => 
    sum + (stock.avg * stock.qty), 0
  );

  const totalCurrentValue = allHoldings.reduce((sum, stock) => 
    sum + (stock.price * stock.qty), 0
  );

  const totalPnL = totalCurrentValue - totalInvestment;
  const totalPnLPercent = totalInvestment > 0 
    ? ((totalPnL / totalInvestment) * 100).toFixed(2)
    : 0;

  const labels = allHoldings.map((stock) => stock.name);

  const data = {
    labels,
    datasets: [
      {
        label: "Stock Price",
        data: allHoldings.map((stock) => stock.price),
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
    ],
  };

  return (
    <>
      {/* Header with Live Indicator */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '15px' 
      }}>
        <h3 className="title">Holdings ({allHoldings.length})</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <LiveIndicator isActive={isLive} lastUpdated={lastUpdated} />
          <button 
            onClick={toggleLive}
            style={{
              padding: '6px 12px',
              fontSize: '0.75rem',
              border: '1px solid rgb(224, 224, 224)',
              borderRadius: '2px',
              background: 'white',
              cursor: 'pointer',
              color: 'rgb(70, 70, 70)',
              fontWeight: '400'
            }}
          >
            {isLive ? 'Pause' : 'Resume'}
          </button>
        </div>
      </div>

      {/* Portfolio Summary */}
      {allHoldings.length > 0 && (
        <div style={{
          display: 'flex',
          gap: '15px',
          marginBottom: '20px',
          padding: '15px',
          background: '#f8f9fa',
          borderRadius: '2px',
          border: '1px solid rgb(235, 234, 234)'
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.75rem', color: 'rgb(145, 145, 145)', marginBottom: '4px' }}>
              Total Investment
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: '500', color: 'rgb(71, 71, 71)' }}>
              ₹{totalInvestment.toFixed(2)}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.75rem', color: 'rgb(145, 145, 145)', marginBottom: '4px' }}>
              Current Value
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: '500', color: 'rgb(71, 71, 71)' }}>
              ₹{totalCurrentValue.toFixed(2)}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.75rem', color: 'rgb(145, 145, 145)', marginBottom: '4px' }}>
              Total P&L
            </div>
            <div style={{ 
              fontSize: '1.2rem', 
              fontWeight: '500',
              color: totalPnL >= 0 ? 'rgb(72, 194, 55)' : 'rgb(250, 118, 78)'
            }}>
              {totalPnL >= 0 ? '+' : ''}₹{totalPnL.toFixed(2)} ({totalPnLPercent}%)
            </div>
          </div>
        </div>
      )}

      {allHoldings.length === 0 ? (
        <p style={{textAlign: 'center', color: 'rgb(153, 153, 153)', marginTop: '50px', fontSize: '0.9rem'}}>
          No holdings yet. Buy some stocks to get started!
        </p>
      ) : (
        <>
          <div className="order-table">
            <table>
              <thead>
                <tr>
                  <th>Instrument</th>
                  <th>Qty.</th>
                  <th>Avg. cost</th>
                  <th>LTP</th>
                  <th>Cur. val</th>
                  <th>P&amp;L</th>
                  <th>Net chg.</th>
                  <th>Day chg.</th>
                </tr>
              </thead>
              <tbody>
                {allHoldings.map((stock, index) => {
                  const curValue = stock.price * stock.qty;
                  const pnl = curValue - stock.avg * stock.qty;
                  const profClass = pnl >= 0 ? "profit" : "loss";
                  const netChange = ((stock.price - stock.avg) / stock.avg) * 100;

                  return (
                    <tr key={index}>
                      <td style={{ fontWeight: '500' }}>{stock.name}</td>
                      <td>{stock.qty}</td>
                      <td>{stock.avg.toFixed(2)}</td>
                      <td className="value-updating">{stock.price.toFixed(2)}</td>
                      <td className="value-updating">{curValue.toFixed(2)}</td>
                      <td className={`${profClass} value-updating`}>
                        {pnl.toFixed(2)}
                      </td>
                      <td className={profClass}>{netChange.toFixed(2)}%</td>
                      <td className={profClass}>{netChange.toFixed(2)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <VerticalGraph data={data} />
        </>
      )}
    </>
  );
};

export default Holdings;