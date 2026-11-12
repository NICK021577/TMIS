"use strict";

const mongoose = require("mongoose");

const CertificateSchema = new mongoose.Schema(
  {
    agency_id: { type: mongoose.Schema.Types.ObjectId, ref: "Agency", required: true },
    activity_id: { type: mongoose.Schema.Types.ObjectId, ref: "Activity", required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    released_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    certificate_no: { type: String, required: true },
    file_ref: { type: String },
    released_at: { type: Date, required: true },
  },
  { collection: "certificate", versionKey: false }
);
CertificateSchema.index({ certificate_no: 1 }, { unique: true });
CertificateSchema.index({ agency_id: 1 });
CertificateSchema.index({ activity_id: 1 });
CertificateSchema.index({ user_id: 1 });
CertificateSchema.index({ released_by: 1 });

module.exports = mongoose.model("Certificate", CertificateSchema);
