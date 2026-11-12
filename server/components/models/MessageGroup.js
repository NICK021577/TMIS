"use strict";

const mongoose = require("mongoose");

const MessageGroupSchema = new mongoose.Schema(
  {
    agency_id: { type: mongoose.Schema.Types.ObjectId, ref: "Agency", required: true },
    activity_id: { type: mongoose.Schema.Types.ObjectId, ref: "Activity" },
    name: { type: String, required: true },
    scope: { type: String, required: true },
    archived: { type: Boolean, default: false },
  },
  { collection: "message_group", versionKey: false }
);
MessageGroupSchema.index({ agency_id: 1 });
MessageGroupSchema.index({ activity_id: 1 });

module.exports = mongoose.model("MessageGroup", MessageGroupSchema);
