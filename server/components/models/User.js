"use strict";

const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    contact: { type: String },
    affiliation: { type: String },
    password_hash: { type: String, required: true },
    is_super_admin: { type: Boolean, default: false },
  },
  { collection: "user", versionKey: false }
);
UserSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model("User", UserSchema);
