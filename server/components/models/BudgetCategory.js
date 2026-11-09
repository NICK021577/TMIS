"use strict";

const mongoose = require("mongoose");

const BudgetCategorySchema = new mongoose.Schema(
  {
    agency_id: { type: mongoose.Schema.Types.ObjectId, ref: "Agency", required: true },
    name: { type: String, required: true },
  },
  { collection: "budget_category", versionKey: false }
);
BudgetCategorySchema.index({ agency_id: 1 });

module.exports = mongoose.model("BudgetCategory", BudgetCategorySchema);
