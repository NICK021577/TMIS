"use strict";

const mongoose = require("mongoose");

const ActivitySchema = new mongoose.Schema(
  {
    agency_id: { type: mongoose.Schema.Types.ObjectId, ref: "Agency", required: true },
    calendar_entry_id: { type: mongoose.Schema.Types.ObjectId, ref: "CalendarEntry" },
    activity_type_id: { type: mongoose.Schema.Types.ObjectId, ref: "ActivityType", required: true },
    funding_source_id: { type: mongoose.Schema.Types.ObjectId, ref: "FundingSource" },
    title: { type: String, required: true },
    funding_type: { type: String },
    venue: { type: String },
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    topic: { type: String },
    objectives: { type: String },
    expected_outcome: { type: String },
    max_participants: { type: Number },
    status: { type: String, required: true },
    join_code: { type: String },
  },
  { collection: "activity", versionKey: false }
);
ActivitySchema.index({ calendar_entry_id: 1 }, { unique: true, partialFilterExpression: { calendar_entry_id: { $type: "objectId" } } });
ActivitySchema.index({ join_code: 1 }, { unique: true, partialFilterExpression: { join_code: { $type: "string" } } });
ActivitySchema.index({ agency_id: 1 });
ActivitySchema.index({ activity_type_id: 1 });
ActivitySchema.index({ funding_source_id: 1 });

module.exports = mongoose.model("Activity", ActivitySchema);
