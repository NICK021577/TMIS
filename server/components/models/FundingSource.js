"use strict";

const mongoose = require("mongoose");

const FundingSourceSchema = new mongoose.Schema(
  {
    agency_id: { type: mongoose.Schema.Types.ObjectId, ref: "Agency", required: true },
    name: { type: String, required: true },
  },
  { collection: "funding_source", versionKey: false }
);
FundingSourceSchema.index({ agency_id: 1 });

module.exports = mongoose.model("FundingSource", FundingSourceSchema);
