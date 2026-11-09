"use strict";

const mongoose = require("mongoose");

const ReentryPlanSchema = new mongoose.Schema(
  {
    agency_id: { type: mongoose.Schema.Types.ObjectId, ref: "Agency", required: true },
    activity_id: { type: mongoose.Schema.Types.ObjectId, ref: "Activity", required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    client_id: { type: String, required: true },
    content: { type: String, required: true },
    submitted_at: { type: Date, required: true, default: Date.now },
  },
  { collection: "reentry_plan", versionKey: false }
);
ReentryPlanSchema.index({ client_id: 1 }, { unique: true });
ReentryPlanSchema.index({ agency_id: 1 });
ReentryPlanSchema.index({ activity_id: 1 });
ReentryPlanSchema.index({ user_id: 1 });

module.exports = mongoose.model("ReentryPlan", ReentryPlanSchema);
