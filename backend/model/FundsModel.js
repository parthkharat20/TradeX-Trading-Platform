const mongoose = require("mongoose");
const { FundsSchema } = require("../schemas/FundsSchema");

const FundsModel = mongoose.model("Funds", FundsSchema);

module.exports = FundsModel;