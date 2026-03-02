const { Schema } = require("mongoose");

const FundsSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true,
    unique: true
  },
  balance: {
    type: Number,
    default: 100000  // Starting balance: ₹1,00,000
  },
  usedMargin: {
    type: Number,
    default: 0
  },
  availableBalance: {
    type: Number,
    default: 100000
  }
}, {
  timestamps: true
});

module.exports = { FundsSchema };