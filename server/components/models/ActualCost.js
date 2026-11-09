"use strict";

const mongoose = require("mongoose");

const ActualCostSchema = new mongoose.Schema(
  {
    agency_id: { type: mongoose.Schema.Types.ObjectId, ref: "Agency", required: true },
    budget_item_id: { type: mongoose.Schema.Types.ObjectId, ref: "BudgetItem", required: true },
    receipt_document_id: { type: mongoose.Schema.Types.ObjectId, ref: "Document" },
    recorded_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: mongoose.Schema.Types.Decimal128, required: true },
    incurred_on: { type: Date, required: true },
  },
  { collection: "actual_cost", versionKey: false }
);
ActualCostSchema.index({ agency_id: 1 });
ActualCostSchema.index({ budget_item_id: 1 });
ActualCostSchema.index({ receipt_document_id: 1 });
ActualCostSchema.index({ recorded_by: 1 });

module.exports = mongoose.model("ActualCost", ActualCostSchema);
