const { Schema } = require("mongoose");

const HoldingSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "user" }, // required nahi — purana data bhi kaam kare
  name: String,
  qty: Number,
  avg: Number,
  price: Number,
  net: String,
  day: String,
});

module.exports = { HoldingSchema };