"use strict";

const mongoose = require("mongoose");

const RegistrationSchema = new mongoose.Schema(
  {
    agency_id: { type: mongoose.Schema.Types.ObjectId, ref: "Agency", required: true },
    activity_id: { type: mongoose.Schema.Types.ObjectId, ref: "Activity", required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, required: true },
    joined_at: { type: Date, required: true, default: Date.now },
  },
  { collection: "registration", versionKey: false }
);
RegistrationSchema.index({ agency_id: 1 });
RegistrationSchema.index({ activity_id: 1 });
RegistrationSchema.index({ user_id: 1 });

module.exports = mongoose.model("Registration", RegistrationSchema);
