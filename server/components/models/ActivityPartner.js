"use strict";

const mongoose = require("mongoose");

const ActivityPartnerSchema = new mongoose.Schema(
  {
    agency_id: { type: mongoose.Schema.Types.ObjectId, ref: "Agency", required: true },
    activity_id: { type: mongoose.Schema.Types.ObjectId, ref: "Activity", required: true },
    partner_agency_id: { type: mongoose.Schema.Types.ObjectId, ref: "Agency", required: true },
    role: { type: String },
  },
  { collection: "activity_partner", versionKey: false }
);
ActivityPartnerSchema.index({ activity_id: 1, partner_agency_id: 1 }, { unique: true });
ActivityPartnerSchema.index({ agency_id: 1 });

module.exports = mongoose.model("ActivityPartner", ActivityPartnerSchema);
