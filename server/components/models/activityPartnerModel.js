const { Schema, model, models } = require('../utils/Schema');

// Mirrors the `activity_partner` table in db/schema.sql.
// `id` (auto-increment integer primary key) is added automatically by Schema.
const ActivityPartnerModel = new Schema({
    agency_id: { type: Number, integer: true, required: true, ref: 'agency' },
    activity_id: { type: Number, integer: true, required: true, ref: 'activity' },
    partner_id: { type: Number, integer: true, required: true, ref: 'partner_agency' },
    role: { type: String, required: true, trim: true, maxlength: 50, enum: ['implementing', 'funding', 'collaborating', 'participating'] },
    notes: { type: String, trim: true },
    created_at: { type: Date, required: true, default: Date.now },
    created_by: { type: Number, integer: true, required: true, ref: 'user' },
    updated_at: { type: Date, onUpdate: Date.now },
    updated_by: { type: Number, integer: true, ref: 'user' },
}, { unique: [['activity_id', 'partner_id']] });

module.exports = models.activity_partner || model('activity_partner', ActivityPartnerModel);
