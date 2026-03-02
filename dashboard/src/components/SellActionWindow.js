import React, { useState, useContext } from "react";
import axios from "axios";
import GeneralContext from "./GeneralContext";
import OrderTypeSelector from "./OrderTypeSelector";
import "./SellActionWindow.css";

const SellActionWindow = ({ uid }) => {
  const [stockQuantity, setStockQuantity] = useState(1);
  const [stockPrice, setStockPrice] = useState(100);
  const [orderType, setOrderType] = useState('MARKET');
  const [triggerPrice, setTriggerPrice] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const generalContext = useContext(GeneralContext);

  const handleSellClick = async (e) => {
    e.stopPropagation();
    e.preventDefault();

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

    const orderData = {
      name: uid,
      qty: Number(stockQuantity),
      price: Number(stockPrice),
      mode: "SELL",
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
      generalContext.closeSellWindow();
      window.location.reload();

    } catch (error) {
      const msg = error.response?.data?.message || error.message;
      alert("Error: " + msg);
      if (error.response?.status === 401) {
        localStorage.clear();
        window.location.href = "/";
      }
    }
  };

  const handleCancelClick = (e) => {
    e.stopPropagation();
    generalContext.closeSellWindow();
  };

  const orderValue = (Number(stockQuantity) * Number(stockPrice)).toFixed(2);

  return (
    <div className="container" id="sell-window" draggable="true">
      <div className="regular-order">
        <div className="order-header">
          <h4>{uid}</h4>
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
        <span>Total: ₹{orderValue}</span>
        <div>
          <button
            className="btn btn-red"
            onClick={handleSellClick}
            onMouseDown={(e) => e.stopPropagation()}
          >
            Sell
          </button>
          <button
            className="btn btn-grey"
            onClick={handleCancelClick}
            onMouseDown={(e) => e.stopPropagation()}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellActionWindow;