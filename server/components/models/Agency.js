"use strict";

const mongoose = require("mongoose");

const AgencySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true, enum: ["government_agency", "academic_institution", "international_entity", "private_sector"] },
    description: { type: String },
    logo_url: { type: String },
    brand_color: { type: String },
  },
  { collection: "agency", versionKey: false }
);
AgencySchema.index({ name: 1 }, { unique: true });
AgencySchema.index({ category: 1 });

module.exports = mongoose.model("Agency", AgencySchema);
