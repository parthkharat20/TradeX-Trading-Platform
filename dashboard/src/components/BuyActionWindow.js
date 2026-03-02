import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import GeneralContext from "./GeneralContext";
import OrderTypeSelector from "./OrderTypeSelector";
import "./BuyActionWindow.css";

const BuyActionWindow = ({ uid }) => {
  const [stockQuantity, setStockQuantity] = useState(1);
  const [stockPrice, setStockPrice] = useState(100);
  const [orderType, setOrderType] = useState('MARKET');
  const [triggerPrice, setTriggerPrice] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [availableBalance, setAvailableBalance] = useState(0);
  const generalContext = useContext(GeneralContext);

  useEffect(() => {
    fetchAvailableBalance();
  }, []);

  const fetchAvailableBalance = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get("http://localhost:3002/funds", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAvailableBalance(response.data.availableBalance);
    } catch (err) {
      console.error("Error fetching balance:", err);
    }
  };

  const handleBuyClick = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first!");
      window.location.href = "/";
      return;
    }

    if (!stockQuantity || stockQuantity <= 0) {
      alert("Please enter valid quantity");
      return;
    }

    if (!stockPrice || stockPrice <= 0) {
      alert("Please enter valid price");
      return;
    }

    const orderValue = Number(stockQuantity) * Number(stockPrice);

    if (orderValue > availableBalance) {
      alert(`Insufficient funds! Need ₹${orderValue.toFixed(2)}, Available: ₹${availableBalance.toFixed(2)}`);
      return;
    }

    const orderData = {
      name: uid,
      qty: stockQuantity,
      price: stockPrice,
      mode: "BUY",
      orderType: orderType
    };

    if (orderType === 'LIMIT' && targetPrice) {
      orderData.targetPrice = Number(targetPrice);
    }

    if (orderType === 'STOP_LOSS' && triggerPrice) {
      orderData.triggerPrice = Number(triggerPrice);
    }

    try {
      const response = await axios.post("http://localhost:3002/newOrder", orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      alert(response.data.message);
      generalContext.closeBuyWindow();
      window.location.reload();
    } catch (error) {
      const msg = error.response?.data?.message || error.message;
      console.error("Error:", msg);
      alert(msg);
      if (error.response?.status === 401) {
        localStorage.clear();
        window.location.href = "/";
      }
    }
  };

  const handleCancelClick = () => {
    generalContext.closeBuyWindow();
  };

  const orderValue = (Number(stockQuantity) * Number(stockPrice)).toFixed(2);

  return (
    <div className="container" id="buy-window" draggable="true">
      <div className="regular-order">
        <div className="order-header">
          <h4>{uid}</h4>
          <p className="balance-info">Available: ₹{availableBalance.toFixed(2)}</p>
        </div>

        <OrderTypeSelector
          orderType={orderType}
          setOrderType={setOrderType}
          triggerPrice={triggerPrice}
          setTriggerPrice={setTriggerPrice}
          targetPrice={targetPrice}
          setTargetPrice={setTargetPrice}
        />

        <div className="inputs">
          <fieldset>
            <legend>Qty.</legend>
            <input
              type="number"
              name="qty"
              id="qty"
              onChange={(e) => setStockQuantity(e.target.value)}
              value={stockQuantity}
              min="1"
            />
          </fieldset>
          <fieldset>
            <legend>Price</legend>
            <input
              type="number"
              name="price"
              id="price"
              step="0.05"
              onChange={(e) => setStockPrice(e.target.value)}
              value={stockPrice}
              min="0.05"
            />
          </fieldset>
        </div>
      </div>
      <div className="buttons">
        <span className={orderValue > availableBalance ? 'insufficient' : ''}>
          Total: ₹{orderValue}
          {orderValue > availableBalance && <span className="error-text"> (Insufficient funds)</span>}
        </span>
        <div>
          <button className="btn btn-blue" onClick={handleBuyClick}>
            Buy
          </button>
          <button className="btn btn-grey" onClick={handleCancelClick}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuyActionWindow;