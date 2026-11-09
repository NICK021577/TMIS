"use strict";

const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema(
  {
    agency_id: { type: mongoose.Schema.Types.ObjectId, ref: "Agency", required: true },
    session_id: { type: mongoose.Schema.Types.ObjectId, ref: "Session", required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    client_id: { type: String, required: true },
    rating: { type: Number, required: true },
    comments: { type: String },
    submitted_at: { type: Date, required: true, default: Date.now },
  },
  { collection: "feedback", versionKey: false }
);
FeedbackSchema.index({ client_id: 1 }, { unique: true });
FeedbackSchema.index({ agency_id: 1 });
FeedbackSchema.index({ session_id: 1 });
FeedbackSchema.index({ user_id: 1 });

module.exports = mongoose.model("Feedback", FeedbackSchema);
