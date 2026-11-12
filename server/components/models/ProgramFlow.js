"use strict";

const mongoose = require("mongoose");

const ProgramFlowSchema = new mongoose.Schema(
  {
    agency_id: { type: mongoose.Schema.Types.ObjectId, ref: "Agency", required: true },
    session_id: { type: mongoose.Schema.Types.ObjectId, ref: "Session", required: true },
    resource_person_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    title: { type: String, required: true },
    description: { type: String },
    start_time: { type: String, match: /^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/, required: true },
    end_time: { type: String, match: /^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/, required: true, validate: { validator: function(v) { return !this.start_time || !v || v > this.start_time; }, message: "end_time must be later than start_time" } },
    sort_order: { type: Number, required: true, default: 0 },
  },
  { collection: "program_flow", versionKey: false }
);
ProgramFlowSchema.index({ session_id: 1, sort_order: 1 });
ProgramFlowSchema.index({ agency_id: 1 });
ProgramFlowSchema.index({ resource_person_id: 1 });

module.exports = mongoose.model("ProgramFlow", ProgramFlowSchema);
