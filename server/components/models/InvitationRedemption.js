"use strict";

const mongoose = require("mongoose");

const InvitationRedemptionSchema = new mongoose.Schema(
  {
    invitation_id: { type: mongoose.Schema.Types.ObjectId, ref: "Invitation", required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    redeemed_at: { type: Date, required: true, default: Date.now },
  },
  { collection: "invitation_redemption", versionKey: false }
);
InvitationRedemptionSchema.index({ invitation_id: 1 });
InvitationRedemptionSchema.index({ user_id: 1 });

module.exports = mongoose.model("InvitationRedemption", InvitationRedemptionSchema);
