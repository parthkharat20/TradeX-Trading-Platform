import React, { useState, useEffect } from "react";
import axios from "axios";
import LiveIndicator from "./LiveIndicator";
import { updateStockPrice } from "../utils/priceSimulator";

const Positions = () => {
  const [allPositions, setAllPositions] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isLive, setIsLive] = useState(true);

  const fetchPositions = () => {
    const token = localStorage.getItem("token");
    
    axios
      .get("http://localhost:3002/allPositions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setAllPositions(res.data);
      })
      .catch((err) => {
        console.error("Error fetching positions:", err);
      });
  };

  useEffect(() => {
    fetchPositions();
  }, []);

  // Live price updates
  useEffect(() => {
    if (!isLive || allPositions.length === 0) return;

    const interval = setInterval(() => {
      setAllPositions(prevPositions => {
        return prevPositions.map(position => ({
          ...position,
          price: updateStockPrice(position.price)
        }));
      });
      setLastUpdated(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, [isLive, allPositions.length]);

  const toggleLive = () => {
    setIsLive(prev => !prev);
  };

  // Calculate total P&L
  const totalPnL = allPositions.reduce((sum, stock) => {
    const curValue = stock.price * stock.qty;
    const pnl = curValue - stock.avg * stock.qty;
    return sum + pnl;
  }, 0);

  return (
    <>
      {/* Header with Live Indicator */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '15px' 
      }}>
        <h3 className="title">Positions ({allPositions.length})</h3>
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

      {/* Today's P&L Summary */}
      {allPositions.length > 0 && (
        <div style={{
          padding: '12px 15px',
          background: totalPnL >= 0 ? 'rgba(72, 194, 55, 0.1)' : 'rgba(250, 118, 78, 0.1)',
          border: `1px solid ${totalPnL >= 0 ? 'rgba(72, 194, 55, 0.3)' : 'rgba(250, 118, 78, 0.3)'}`,
          borderRadius: '2px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '0.85rem', fontWeight: '500', color: 'rgb(71, 71, 71)' }}>
            Today's P&L:
          </span>
          <span style={{ 
            fontSize: '1.1rem', 
            fontWeight: '500',
            color: totalPnL >= 0 ? 'rgb(72, 194, 55)' : 'rgb(250, 118, 78)'
          }}>
            {totalPnL >= 0 ? '+' : ''}₹{totalPnL.toFixed(2)}
          </span>
        </div>
      )}

      {allPositions.length === 0 ? (
        <p style={{textAlign: 'center', color: 'rgb(153, 153, 153)', marginTop: '50px', fontSize: '0.9rem'}}>
          No positions yet. Sell some stocks to get started!
        </p>
      ) : (
        <div className="order-table">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Instrument</th>
                <th>Qty.</th>
                <th>Avg.</th>
                <th>LTP</th>
                <th>P&amp;L</th>
                <th>Chg.</th>
              </tr>
            </thead>

            <tbody>
              {allPositions.map((stock, index) => {
                const curValue = stock.price * stock.qty;
                const pnl = curValue - stock.avg * stock.qty;
                const profClass = pnl >= 0 ? "profit" : "loss";
                const changePercent = ((stock.price - stock.avg) / stock.avg) * 100;

                return (
                  <tr key={index}>
                    <td>{stock.product}</td>
                    <td style={{ fontWeight: '500' }}>{stock.name}</td>
                    <td>{stock.qty}</td>
                    <td>{stock.avg.toFixed(2)}</td>
                    <td className="value-updating">{stock.price.toFixed(2)}</td>
                    <td className={`${profClass} value-updating`}>
                      {pnl.toFixed(2)}
                    </td>
                    <td className={profClass}>
                      {changePercent.toFixed(2)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

export default Positions;