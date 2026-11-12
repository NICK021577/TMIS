"use strict";

const mongoose = require("mongoose");

const BudgetItemSchema = new mongoose.Schema(
  {
    agency_id: { type: mongoose.Schema.Types.ObjectId, ref: "Agency", required: true },
    activity_id: { type: mongoose.Schema.Types.ObjectId, ref: "Activity", required: true },
    category_id: { type: mongoose.Schema.Types.ObjectId, ref: "BudgetCategory", required: true },
    funding_source_id: { type: mongoose.Schema.Types.ObjectId, ref: "FundingSource" },
    description: { type: String, required: true },
    estimated_amount: { type: mongoose.Schema.Types.Decimal128, required: true },
  },
  { collection: "budget_item", versionKey: false }
);
BudgetItemSchema.index({ agency_id: 1 });
BudgetItemSchema.index({ activity_id: 1 });
BudgetItemSchema.index({ category_id: 1 });
BudgetItemSchema.index({ funding_source_id: 1 });

module.exports = mongoose.model("BudgetItem", BudgetItemSchema);
