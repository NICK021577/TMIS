"use strict";

const mongoose = require("mongoose");

const ActivityTypeSchema = new mongoose.Schema(
  {
    agency_id: { type: mongoose.Schema.Types.ObjectId, ref: "Agency", required: true },
    name: { type: String, required: true },
  },
  { collection: "activity_type", versionKey: false }
);
ActivityTypeSchema.index({ agency_id: 1 });

module.exports = mongoose.model("ActivityType", ActivityTypeSchema);
