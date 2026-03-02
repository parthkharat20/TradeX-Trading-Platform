const mongoose = require("mongoose");
const { AlertsSchema } = require("../schemas/AlertsSchema");

const AlertsModel = mongoose.model("Alert", AlertsSchema);

module.exports = AlertsModel;