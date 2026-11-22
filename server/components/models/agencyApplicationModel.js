const { Schema, model, models } = require('../utils/Schema');

// Mirrors the `agency_application` table in db/schema.sql.
// `id` (auto-increment integer primary key) is added automatically by Schema.
const AgencyApplicationModel = new Schema({
    agency_id: { type: Number, integer: true, ref: 'agency' },
    reviewed_by: { type: Number, integer: true, ref: 'user' },
    agency_name: { type: String, required: true, trim: true, maxlength: 255 },
    acronym: { type: String, required: true, trim: true, maxlength: 32 },
    agency_type: { type: String, required: true, trim: true, maxlength: 32 },
    region: { type: String, required: true, trim: true, maxlength: 64 },
    contact_first_name: { type: String, required: true, trim: true, maxlength: 100 },
    contact_middle_name: { type: String, trim: true, maxlength: 100 },
    contact_last_name: { type: String, required: true, trim: true, maxlength: 100 },
    contact_email: { type: String, required: true, trim: true, lowercase: true, maxlength: 255, match: /^\S+@\S+\.\S+$/ },
    contact_phone: { type: String, required: true, trim: true, maxlength: 32 },
    status: { type: String, required: true, trim: true, maxlength: 32, enum: ['pending', 'under_review', 'needs_info', 'approved', 'rejected'], default: 'pending' },
    reason: { type: String, trim: true },
    submitted_at: { type: Date, required: true },
    reviewed_at: { type: Date },
});

module.exports = models.agency_application || model('agency_application', AgencyApplicationModel);
