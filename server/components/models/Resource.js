"use strict";

const mongoose = require("mongoose");

const ResourceSchema = new mongoose.Schema(
  {
    agency_id: { type: mongoose.Schema.Types.ObjectId, ref: "Agency", required: true },
    activity_id: { type: mongoose.Schema.Types.ObjectId, ref: "Activity", required: true },
    budget_item_id: { type: mongoose.Schema.Types.ObjectId, ref: "BudgetItem" },
    resource_type: { type: String, required: true },
    name: { type: String, required: true },
    unit: { type: String },
    qty_needed: { type: mongoose.Schema.Types.Decimal128, required: true },
    qty_allocated: { type: mongoose.Schema.Types.Decimal128, default: "0" },
  },
  { collection: "resource", versionKey: false }
);
ResourceSchema.index({ agency_id: 1 });
ResourceSchema.index({ activity_id: 1 });
ResourceSchema.index({ budget_item_id: 1 });

module.exports = mongoose.model("Resource", ResourceSchema);
