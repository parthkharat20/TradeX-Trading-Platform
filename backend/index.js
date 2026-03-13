require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const HoldingsModel = require("./model/HoldingsModel");
const PositionsModel = require("./model/PositionsModel");
const OrdersModel = require("./model/OrdersModel");
const UserModel = require("./model/UserModel");
const FundsModel = require("./model/FundsModel");
const AlertsModel = require("./model/AlertsModel");

const app = express();

const PORT = process.env.PORT || 3002;
const MONGO_URL = process.env.MONGO_URL;
const JWT_SECRET = process.env.JWT_SECRET;

app.use(cors());
app.use(bodyParser.json());

// ===================== AUTH ROUTES =====================

app.post("/register", async (req, res) => {
  try {
    const { userName, email, password } = req.body;
    if (!userName || !email || !password)
      return res.status(400).json({ message: "All fields required" });

    const existingUser = await UserModel.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new UserModel({ userName, email, password: hashedPassword });
    await newUser.save();

    // Create initial funds account
    const newFunds = new FundsModel({
      userId: newUser._id,
      balance: 100000,
      usedMargin: 0,
      availableBalance: 100000
    });
    await newFunds.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser._id.toString(), email: newUser.email, userName: newUser.userName },
      JWT_SECRET || "tradex-secret-key-2024",
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "User registered successfully ✅",
      token,
      userName: newUser.userName,
      userId: newUser._id,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({ 
      message: "Login successful ✅", 
      token, 
      userName: user.userName,
      userId: user._id 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===================== JWT VERIFY MIDDLEWARE =====================

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// ===================== FUNDS ROUTES =====================

// Get user funds
app.get("/funds", verifyToken, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId);
    let funds = await FundsModel.findOne({ userId });
    
    // If no funds account, create one
    if (!funds) {
      funds = new FundsModel({
        userId,
        balance: 100000,
        usedMargin: 0,
        availableBalance: 100000
      });
      await funds.save();
    }
    
    res.json(funds);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add money
app.post("/funds/add", verifyToken, async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = new mongoose.Types.ObjectId(req.user.userId);

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    let funds = await FundsModel.findOne({ userId });
    
    if (!funds) {
      funds = new FundsModel({ userId });
    }

    funds.balance += Number(amount);
    funds.availableBalance = funds.balance - funds.usedMargin;
    await funds.save();

    res.json({ 
      message: `₹${amount} added successfully ✅`,
      funds 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Withdraw money
app.post("/funds/withdraw", verifyToken, async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = new mongoose.Types.ObjectId(req.user.userId);

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const funds = await FundsModel.findOne({ userId });
    
    if (!funds) {
      return res.status(400).json({ message: "Funds account not found" });
    }

    if (funds.availableBalance < amount) {
      return res.status(400).json({ 
        message: "Insufficient available balance",
        available: funds.availableBalance 
      });
    }

    funds.balance -= Number(amount);
    funds.availableBalance = funds.balance - funds.usedMargin;
    await funds.save();

    res.json({ 
      message: `₹${amount} withdrawn successfully ✅`,
      funds 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===================== ALERTS ROUTES =====================

// Get all alerts
app.get("/alerts", verifyToken, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId);
    const alerts = await AlertsModel.find({ userId }).sort({ createdAt: -1 });
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create alert
app.post("/alerts", verifyToken, async (req, res) => {
  try {
    const { stockName, targetPrice, alertType } = req.body;
    const userId = new mongoose.Types.ObjectId(req.user.userId);

    if (!stockName || !targetPrice || !alertType) {
      return res.status(400).json({ message: "All fields required" });
    }

    const newAlert = new AlertsModel({
      userId,
      stockName,
      targetPrice: Number(targetPrice),
      alertType,
      isActive: true,
      triggered: false
    });

    await newAlert.save();
    res.json({ message: "Alert created successfully ✅", alert: newAlert });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Toggle alert
app.patch("/alerts/:alertId/toggle", verifyToken, async (req, res) => {
  try {
    const { alertId } = req.params;
    const userId = new mongoose.Types.ObjectId(req.user.userId);

    const alert = await AlertsModel.findOne({ _id: alertId, userId });
    
    if (!alert) {
      return res.status(404).json({ message: "Alert not found" });
    }

    alert.isActive = !alert.isActive;
    await alert.save();

    res.json({ message: "Alert updated ✅", alert });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete alert
app.delete("/alerts/:alertId", verifyToken, async (req, res) => {
  try {
    const { alertId } = req.params;
    const userId = new mongoose.Types.ObjectId(req.user.userId);

    const alert = await AlertsModel.findOne({ _id: alertId, userId });
    
    if (!alert) {
      return res.status(404).json({ message: "Alert not found" });
    }

    await AlertsModel.deleteOne({ _id: alertId });
    res.json({ message: "Alert deleted ✅" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===================== DASHBOARD STATS =====================

app.get("/dashboard/stats", verifyToken, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId);

    // Get all data
    const holdings = await HoldingsModel.find({ userId });
    const positions = await PositionsModel.find({ userId });
    const orders = await OrdersModel.find({ userId });
    const funds = await FundsModel.findOne({ userId });

    // Calculate totals
    const totalInvestment = holdings.reduce((sum, h) => sum + (h.avg * h.qty), 0);
    const totalCurrentValue = holdings.reduce((sum, h) => sum + (h.price * h.qty), 0);
    const totalPnL = totalCurrentValue - totalInvestment;
    const totalPnLPercent = totalInvestment > 0 
      ? ((totalPnL / totalInvestment) * 100).toFixed(2)
      : 0;

    // Today's P&L (from positions)
    const todayPnL = positions.reduce((sum, p) => {
      const curValue = p.price * p.qty;
      const pnl = curValue - p.avg * p.qty;
      return sum + pnl;
    }, 0);

    // Top gainers and losers
    const holdingsWithPnL = holdings.map(h => {
      const curValue = h.price * h.qty;
      const pnl = curValue - h.avg * h.qty;
      const pnlPercent = ((h.price - h.avg) / h.avg) * 100;
      return { ...h._doc, pnl, pnlPercent };
    });

    const topGainers = holdingsWithPnL
      .filter(h => h.pnl > 0)
      .sort((a, b) => b.pnlPercent - a.pnlPercent)
      .slice(0, 3);

    const topLosers = holdingsWithPnL
      .filter(h => h.pnl < 0)
      .sort((a, b) => a.pnlPercent - b.pnlPercent)
      .slice(0, 3);

    res.json({
      totalInvestment,
      totalCurrentValue,
      totalPnL,
      totalPnLPercent,
      todayPnL,
      holdingsCount: holdings.length,
      positionsCount: positions.length,
      ordersCount: orders.length,
      topGainers,
      topLosers,
      funds: funds || { balance: 0, usedMargin: 0, availableBalance: 0 }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===================== HOLDINGS & POSITIONS =====================

app.get("/allHoldings", verifyToken, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId);
    const data = await HoldingsModel.find({ userId });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/allPositions", verifyToken, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId);
    const data = await PositionsModel.find({ userId });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===================== ORDERS =====================

app.get("/allOrders", verifyToken, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId);
    const data = await OrdersModel.find({ userId })
      .sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete("/deleteOrder/:orderId", verifyToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = new mongoose.Types.ObjectId(req.user.userId);

    const order = await OrdersModel.findOne({ 
      _id: orderId, 
      userId: userId 
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found or unauthorized" });
    }

    await OrdersModel.deleteOne({ _id: orderId });
    
    res.json({ message: "Order deleted successfully ✅" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// New Order - With Funds Check
app.post("/newOrder", verifyToken, async (req, res) => {
  try {
    const { name, qty, price, mode, orderType = 'MARKET', triggerPrice, targetPrice } = req.body;
    const userId = new mongoose.Types.ObjectId(req.user.userId);

    // Get user funds
    let funds = await FundsModel.findOne({ userId });
    if (!funds) {
      funds = new FundsModel({ 
        userId, 
        balance: 100000, 
        usedMargin: 0, 
        availableBalance: 100000 
      });
      await funds.save();
    }

    const orderValue = Number(qty) * Number(price);

    // BUY - Check balance
    if (mode === "BUY") {
      if (funds.availableBalance < orderValue) {
        return res.status(400).json({ 
          message: `Insufficient funds! Need ₹${orderValue.toFixed(2)}, Available: ₹${funds.availableBalance.toFixed(2)}`,
          required: orderValue,
          available: funds.availableBalance
        });
      }

      // Deduct from available balance
      funds.usedMargin += orderValue;
      funds.availableBalance = funds.balance - funds.usedMargin;
      await funds.save();
    }

    // Save order
    const newOrder = new OrdersModel({
      userId,
      name,
      qty: Number(qty),
      price: Number(price),
      mode,
      orderType,
      status: orderType === 'MARKET' ? 'EXECUTED' : 'PENDING',
      triggerPrice: triggerPrice ? Number(triggerPrice) : undefined,
      targetPrice: targetPrice ? Number(targetPrice) : undefined
    });
    await newOrder.save();

    // Execute if MARKET order
    if (orderType === 'MARKET') {
      if (mode === "BUY") {
        const existingHolding = await HoldingsModel.findOne({ userId, name });

        if (existingHolding) {
          const totalQty = existingHolding.qty + Number(qty);
          const avgPrice =
            (existingHolding.avg * existingHolding.qty + Number(price) * Number(qty)) / totalQty;

          existingHolding.qty = totalQty;
          existingHolding.avg = avgPrice;
          existingHolding.price = Number(price);
          await existingHolding.save();
        } else {
          const newHolding = new HoldingsModel({
            userId,
            name,
            qty: Number(qty),
            avg: Number(price),
            price: Number(price),
            net: "0.00%",
            day: "0.00%",
          });
          await newHolding.save();
        }
      }

      if (mode === "SELL") {
        let existingHolding = await HoldingsModel.findOne({ userId, name });

        if (!existingHolding) {
          existingHolding = await HoldingsModel.findOneAndUpdate(
            { name, userId: { $exists: false } },
            { $set: { userId: userId } },
            { new: true }
          );
        }

        if (!existingHolding) {
          return res.status(400).json({ message: "You don't have this stock to sell!" });
        }

        // Add to available balance
        funds.usedMargin -= orderValue;
        funds.availableBalance = funds.balance - funds.usedMargin;
        await funds.save();

        existingHolding.qty -= Number(qty);

        if (existingHolding.qty <= 0) {
          await HoldingsModel.deleteOne({ _id: existingHolding._id });
        } else {
          await existingHolding.save();
        }

        // Create position
        const newPosition = new PositionsModel({
          userId,
          product: "CNC",
          name,
          qty: Number(qty),
          avg: existingHolding ? existingHolding.avg : Number(price),
          price: Number(price),
          net: "0.00%",
          day: "0.00%",
          isLoss: false
        });
        await newPosition.save();
      }
    }

    res.json({ 
      message: orderType === 'MARKET' 
        ? "Order executed successfully ✅" 
        : `${orderType} order placed successfully ✅`,
      order: newOrder,
      funds
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===================== SERVER START =====================

const startServer = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URL);
    console.log("MongoDB Connected ✅");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} 🚀`);
    });
  } catch (error) {
    console.error("MongoDB connection failed ❌", error.message);
  }
};

startServer();