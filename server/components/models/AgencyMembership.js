"use strict";

const mongoose = require("mongoose");

const AgencyMembershipSchema = new mongoose.Schema(
  {
    agency_id: { type: mongoose.Schema.Types.ObjectId, ref: "Agency", required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, required: true },
    status: { type: String, required: true },
    is_subscribed: { type: Boolean, default: false },
  },
  { collection: "agency_membership", versionKey: false }
);
AgencyMembershipSchema.index({ agency_id: 1 });
AgencyMembershipSchema.index({ user_id: 1 });

module.exports = mongoose.model("AgencyMembership", AgencyMembershipSchema);
