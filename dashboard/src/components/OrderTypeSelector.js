import React from "react";

const OrderTypeSelector = ({ orderType, setOrderType, triggerPrice, setTriggerPrice, targetPrice, setTargetPrice }) => {
  return (
    <div className="order-type-selector">
      <div className="order-type-tabs">
        <button
          className={orderType === 'MARKET' ? 'tab-btn active' : 'tab-btn'}
          onClick={() => setOrderType('MARKET')}
        >
          Market
        </button>
        <button
          className={orderType === 'LIMIT' ? 'tab-btn active' : 'tab-btn'}
          onClick={() => setOrderType('LIMIT')}
        >
          Limit
        </button>
        <button
          className={orderType === 'STOP_LOSS' ? 'tab-btn active' : 'tab-btn'}
          onClick={() => setOrderType('STOP_LOSS')}
        >
          Stop Loss
        </button>
      </div>

      {orderType === 'LIMIT' && (
        <div className="order-type-fields">
          <fieldset>
            <legend>Limit Price</legend>
            <input
              type="number"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              placeholder="Enter limit price"
              step="0.05"
            />
          </fieldset>
          <p className="field-hint">Order will execute only at this price or better</p>
        </div>
      )}

      {orderType === 'STOP_LOSS' && (
        <div className="order-type-fields">
          <fieldset>
            <legend>Trigger Price</legend>
            <input
              type="number"
              value={triggerPrice}
              onChange={(e) => setTriggerPrice(e.target.value)}
              placeholder="Enter trigger price"
              step="0.05"
            />
          </fieldset>
          <p className="field-hint">Order will trigger when price reaches this level</p>
        </div>
      )}
    </div>
  );
};

export default OrderTypeSelector;