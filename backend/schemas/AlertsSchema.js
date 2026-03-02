const { Schema } = require("mongoose");

const AlertsSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true
  },
  stockName: {
    type: String,
    required: true
  },
  targetPrice: {
    type: Number,
    required: true
  },
  alertType: {
    type: String,
    enum: ['ABOVE', 'BELOW'],
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  triggered: {
    type: Boolean,
    default: false
  },
  triggeredAt: Date
}, {
  timestamps: true
});

module.exports = { AlertsSchema };