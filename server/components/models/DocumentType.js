"use strict";

const mongoose = require("mongoose");

const DocumentTypeSchema = new mongoose.Schema(
  {
    agency_id: { type: mongoose.Schema.Types.ObjectId, ref: "Agency", required: true },
    name: { type: String, required: true },
    required_at_creation: { type: Boolean, default: false },
  },
  { collection: "document_type", versionKey: false }
);
DocumentTypeSchema.index({ agency_id: 1 });

module.exports = mongoose.model("DocumentType", DocumentTypeSchema);
