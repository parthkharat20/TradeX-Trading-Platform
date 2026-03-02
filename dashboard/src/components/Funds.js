import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Funds.css";

const Funds = () => {
  const [funds, setFunds] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addAmount, setAddAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  useEffect(() => {
    fetchFunds();
  }, []);

  const fetchFunds = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/";
      return;
    }

    try {
      const response = await axios.get("http://localhost:3002/funds", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFunds(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error:", err);
      setLoading(false);
      if (err.response?.status === 401) {
        localStorage.clear();
        window.location.href = "/";
      }
    }
  };

  const handleAddFunds = async () => {
    if (!addAmount || addAmount <= 0) {
      alert("Please enter valid amount");
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const response = await axios.post(
        "http://localhost:3002/funds/add",
        { amount: Number(addAmount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(response.data.message);
      setAddAmount("");
      setShowAddModal(false);
      fetchFunds();
    } catch (err) {
      alert(err.response?.data?.message || "Error adding funds");
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || withdrawAmount <= 0) {
      alert("Please enter valid amount");
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const response = await axios.post(
        "http://localhost:3002/funds/withdraw",
        { amount: Number(withdrawAmount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(response.data.message);
      setWithdrawAmount("");
      setShowWithdrawModal(false);
      fetchFunds();
    } catch (err) {
      alert(err.response?.data?.message || "Error withdrawing funds");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <div className="funds-header">
        <p>Instant, zero-cost fund transfers with UPI</p>
        <div className="funds-actions">
          <button className="btn btn-green" onClick={() => setShowAddModal(true)}>
            Add funds
          </button>
          <button className="btn btn-blue" onClick={() => setShowWithdrawModal(true)}>
            Withdraw
          </button>
        </div>
      </div>

      <div className="row">
        <div className="col">
          <span>
            <p>Equity</p>
          </span>

          <div className="table">
            <div className="data">
              <p>Available margin</p>
              <p className="imp colored">
                {funds?.availableBalance?.toFixed(2) || "0.00"}
              </p>
            </div>
            <div className="data">
              <p>Used margin</p>
              <p className="imp">{funds?.usedMargin?.toFixed(2) || "0.00"}</p>
            </div>
            <div className="data">
              <p>Available cash</p>
              <p className="imp colored">
                {funds?.availableBalance?.toFixed(2) || "0.00"}
              </p>
            </div>
            <hr />
            <div className="data">
              <p>Opening Balance</p>
              <p>{funds?.balance?.toFixed(2) || "0.00"}</p>
            </div>
            <div className="data">
              <p>Total Balance</p>
              <p>{funds?.balance?.toFixed(2) || "0.00"}</p>
            </div>
            <div className="data">
              <p>Funds in use</p>
              <p>{funds?.usedMargin?.toFixed(2) || "0.00"}</p>
            </div>
          </div>
        </div>

        <div className="col">
          <div className="funds-summary-card">
            <h4>Account Summary</h4>
            <div className="summary-item">
              <span>Total Balance:</span>
              <span className="amount">₹{funds?.balance?.toFixed(2) || "0.00"}</span>
            </div>
            <div className="summary-item">
              <span>Used in Holdings:</span>
              <span className="amount used">₹{funds?.usedMargin?.toFixed(2) || "0.00"}</span>
            </div>
            <div className="summary-item">
              <span>Available to Trade:</span>
              <span className="amount available">₹{funds?.availableBalance?.toFixed(2) || "0.00"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add Funds Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Add Funds</h3>
            <div className="modal-body">
              <label>Enter Amount (₹)</label>
              <input
                type="number"
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
                placeholder="Enter amount"
                min="1"
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-green" onClick={handleAddFunds}>
                Add
              </button>
              <button className="btn btn-grey" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="modal-overlay" onClick={() => setShowWithdrawModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Withdraw Funds</h3>
            <div className="modal-body">
              <p className="available-info">Available: ₹{funds?.availableBalance?.toFixed(2)}</p>
              <label>Enter Amount (₹)</label>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Enter amount"
                min="1"
                max={funds?.availableBalance}
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-blue" onClick={handleWithdraw}>
                Withdraw
              </button>
              <button className="btn btn-grey" onClick={() => setShowWithdrawModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Funds;