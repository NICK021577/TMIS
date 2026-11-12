"use strict";

const mongoose = require("mongoose");

const SessionSchema = new mongoose.Schema(
  {
    agency_id: { type: mongoose.Schema.Types.ObjectId, ref: "Agency", required: true },
    activity_id: { type: mongoose.Schema.Types.ObjectId, ref: "Activity", required: true },
    title: { type: String, required: true },
    session_date: { type: Date, required: true },
    period: { type: String, required: true, enum: ["AM", "PM"] },
    venue: { type: String },
    qr_token: { type: String },
    short_code: { type: String },
    opens_at: { type: Date },
    closes_at: { type: Date },
  },
  { collection: "session", versionKey: false }
);
SessionSchema.index({ qr_token: 1 }, { unique: true, partialFilterExpression: { qr_token: { $type: "string" } } });
SessionSchema.index({ activity_id: 1, session_date: 1, period: 1 }, { unique: true });
SessionSchema.index({ agency_id: 1 });

module.exports = mongoose.model("Session", SessionSchema);
