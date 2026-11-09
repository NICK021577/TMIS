"use strict";

const mongoose = require("mongoose");

const StaffingSchema = new mongoose.Schema(
  {
    agency_id: { type: mongoose.Schema.Types.ObjectId, ref: "Agency", required: true },
    activity_id: { type: mongoose.Schema.Types.ObjectId, ref: "Activity", required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    responsibility: { type: String, required: true },
    status: { type: String, required: true },
  },
  { collection: "staffing", versionKey: false }
);
StaffingSchema.index({ agency_id: 1 });
StaffingSchema.index({ activity_id: 1 });
StaffingSchema.index({ user_id: 1 });

module.exports = mongoose.model("Staffing", StaffingSchema);
