"use strict";

const mongoose = require("mongoose");

const CalendarEntrySchema = new mongoose.Schema(
  {
    agency_id: { type: mongoose.Schema.Types.ObjectId, ref: "Agency", required: true },
    activity_type_id: { type: mongoose.Schema.Types.ObjectId, ref: "ActivityType", required: true },
    funding_source_id: { type: mongoose.Schema.Types.ObjectId, ref: "FundingSource" },
    title: { type: String, required: true },
    planned_start: { type: Date, required: true },
    planned_end: { type: Date, required: true },
    planned_venue: { type: String },
    status: { type: String, required: true },
    published: { type: Boolean, default: false },
  },
  { collection: "calendar_entry", versionKey: false }
);
CalendarEntrySchema.index({ agency_id: 1 });
CalendarEntrySchema.index({ activity_type_id: 1 });
CalendarEntrySchema.index({ funding_source_id: 1 });

module.exports = mongoose.model("CalendarEntry", CalendarEntrySchema);
