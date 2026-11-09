"use strict";

const mongoose = require("mongoose");

const InvitationSchema = new mongoose.Schema(
  {
    agency_id: { type: mongoose.Schema.Types.ObjectId, ref: "Agency", required: true },
    code: { type: String, required: true },
    role: { type: String, required: true },
    expires_at: { type: Date },
    max_uses: { type: Number },
  },
  { collection: "invitation", versionKey: false }
);
InvitationSchema.index({ code: 1 }, { unique: true });
InvitationSchema.index({ agency_id: 1 });

module.exports = mongoose.model("Invitation", InvitationSchema);
