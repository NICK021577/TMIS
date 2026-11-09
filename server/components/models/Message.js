"use strict";

const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    agency_id: { type: mongoose.Schema.Types.ObjectId, ref: "Agency", required: true },
    group_id: { type: mongoose.Schema.Types.ObjectId, ref: "MessageGroup", required: true },
    sender_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    removed_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    body: { type: String, required: true },
    sent_at: { type: Date, required: true, default: Date.now },
    removed: { type: Boolean, default: false },
  },
  { collection: "message", versionKey: false }
);
MessageSchema.index({ agency_id: 1 });
MessageSchema.index({ group_id: 1 });
MessageSchema.index({ sender_id: 1 });
MessageSchema.index({ removed_by: 1 });

module.exports = mongoose.model("Message", MessageSchema);
