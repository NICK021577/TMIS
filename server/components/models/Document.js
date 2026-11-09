"use strict";

const mongoose = require("mongoose");

const DocumentSchema = new mongoose.Schema(
  {
    agency_id: { type: mongoose.Schema.Types.ObjectId, ref: "Agency", required: true },
    activity_id: { type: mongoose.Schema.Types.ObjectId, ref: "Activity", required: true },
    session_id: { type: mongoose.Schema.Types.ObjectId, ref: "Session" },
    doc_type_id: { type: mongoose.Schema.Types.ObjectId, ref: "DocumentType", required: true },
    uploaded_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    file_name: { type: String, required: true },
    file_ref: { type: String, required: true },
    uploaded_at: { type: Date, required: true, default: Date.now },
  },
  { collection: "document", versionKey: false }
);
DocumentSchema.index({ agency_id: 1 });
DocumentSchema.index({ activity_id: 1 });
DocumentSchema.index({ session_id: 1 });
DocumentSchema.index({ doc_type_id: 1 });
DocumentSchema.index({ uploaded_by: 1 });

module.exports = mongoose.model("Document", DocumentSchema);
