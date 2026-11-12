"use strict";

const mongoose = require("mongoose");

const CertificateRuleSchema = new mongoose.Schema(
  {
    agency_id: { type: mongoose.Schema.Types.ObjectId, ref: "Agency", required: true },
    activity_id: { type: mongoose.Schema.Types.ObjectId, ref: "Activity", required: true },
    min_attendance_pct: { type: mongoose.Schema.Types.Decimal128, required: true },
    require_feedback: { type: Boolean, default: false },
    require_reentry_plan: { type: Boolean, default: false },
  },
  { collection: "certificate_rule", versionKey: false }
);
CertificateRuleSchema.index({ activity_id: 1 }, { unique: true });
CertificateRuleSchema.index({ agency_id: 1 });

module.exports = mongoose.model("CertificateRule", CertificateRuleSchema);
