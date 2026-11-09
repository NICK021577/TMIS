"use strict";

const mongoose = require("mongoose");

const OutputSchema = new mongoose.Schema(
  {
    agency_id: { type: mongoose.Schema.Types.ObjectId, ref: "Agency", required: true },
    activity_id: { type: mongoose.Schema.Types.ObjectId, ref: "Activity", required: true },
    description: { type: String, required: true },
    unit: { type: String },
    planned_qty: { type: mongoose.Schema.Types.Decimal128, required: true },
    conducted_qty: { type: mongoose.Schema.Types.Decimal128, default: "0" },
  },
  { collection: "output", versionKey: false }
);
OutputSchema.index({ agency_id: 1 });
OutputSchema.index({ activity_id: 1 });

module.exports = mongoose.model("Output", OutputSchema);
