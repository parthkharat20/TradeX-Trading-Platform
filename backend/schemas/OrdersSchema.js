const { Schema } = require("mongoose");

const OrdersSchema = new Schema({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: "user", 
    required: true 
  },
  name: String,
  qty: Number,
  price: Number,
  mode: String,  // BUY or SELL
  orderType: {
    type: String,
    enum: ['MARKET', 'LIMIT', 'STOP_LOSS'],
    default: 'MARKET'
  },
  status: {
    type: String,
    enum: ['PENDING', 'EXECUTED', 'CANCELLED'],
    default: 'EXECUTED'
  },
  triggerPrice: Number,  // For STOP_LOSS orders
  targetPrice: Number    // For LIMIT orders
}, {
  timestamps: true
});

module.exports = { OrdersSchema };