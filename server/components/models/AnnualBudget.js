"use strict";

const mongoose = require("mongoose");

const AnnualBudgetSchema = new mongoose.Schema(
  {
    agency_id: { type: mongoose.Schema.Types.ObjectId, ref: "Agency", required: true },
    funding_source_id: { type: mongoose.Schema.Types.ObjectId, ref: "FundingSource" },
    activity_type_id: { type: mongoose.Schema.Types.ObjectId, ref: "ActivityType" },
    year: { type: Number, required: true },
    amount: { type: mongoose.Schema.Types.Decimal128, required: true },
  },
  { collection: "annual_budget", versionKey: false }
);
AnnualBudgetSchema.index({ agency_id: 1 });
AnnualBudgetSchema.index({ funding_source_id: 1 });
AnnualBudgetSchema.index({ activity_type_id: 1 });

module.exports = mongoose.model("AnnualBudget", AnnualBudgetSchema);
