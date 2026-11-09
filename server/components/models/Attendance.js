"use strict";

const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema(
  {
    agency_id: { type: mongoose.Schema.Types.ObjectId, ref: "Agency", required: true },
    session_id: { type: mongoose.Schema.Types.ObjectId, ref: "Session", required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    client_id: { type: String, required: true },
    method: { type: String, required: true },
    device_created_at: { type: Date, required: true },
    server_received_at: { type: Date },
    sync_status: { type: String, required: true },
  },
  { collection: "attendance", versionKey: false }
);
AttendanceSchema.index({ client_id: 1 }, { unique: true });
AttendanceSchema.index({ agency_id: 1 });
AttendanceSchema.index({ session_id: 1 });
AttendanceSchema.index({ user_id: 1 });

module.exports = mongoose.model("Attendance", AttendanceSchema);
