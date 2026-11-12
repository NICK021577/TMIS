"use strict";

const mongoose = require("mongoose");

const OutputPhotoSchema = new mongoose.Schema(
  {
    agency_id: { type: mongoose.Schema.Types.ObjectId, ref: "Agency", required: true },
    output_id: { type: mongoose.Schema.Types.ObjectId, ref: "Output", required: true },
    uploaded_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    file_ref: { type: String, required: true },
    uploaded_at: { type: Date, required: true, default: Date.now },
  },
  { collection: "output_photo", versionKey: false }
);
OutputPhotoSchema.index({ agency_id: 1 });
OutputPhotoSchema.index({ output_id: 1 });
OutputPhotoSchema.index({ uploaded_by: 1 });

module.exports = mongoose.model("OutputPhoto", OutputPhotoSchema);
