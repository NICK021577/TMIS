"use strict";

const mongoose = require("mongoose");

const GroupMemberSchema = new mongoose.Schema(
  {
    agency_id: { type: mongoose.Schema.Types.ObjectId, ref: "Agency", required: true },
    group_id: { type: mongoose.Schema.Types.ObjectId, ref: "MessageGroup", required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    joined_at: { type: Date, required: true, default: Date.now },
  },
  { collection: "group_member", versionKey: false }
);
GroupMemberSchema.index({ agency_id: 1 });
GroupMemberSchema.index({ group_id: 1 });
GroupMemberSchema.index({ user_id: 1 });

module.exports = mongoose.model("GroupMember", GroupMemberSchema);
