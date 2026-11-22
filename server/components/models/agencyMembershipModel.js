const { Schema, model, models } = require('../utils/Schema');

// Mirrors the `agency_membership` table in db/schema.sql.
// `id` (auto-increment integer primary key) is added automatically by Schema.
const AgencyMembershipModel = new Schema({
    agency_id: { type: Number, integer: true, required: true, ref: 'agency' },
    user_id: { type: Number, integer: true, required: true, ref: 'user' },
    role_id: { type: Number, integer: true, required: true, ref: 'agency_role' },
    category_id: { type: Number, integer: true, ref: 'participant_category' },
    affiliation: { type: String, trim: true, maxlength: 255 },
    status: { type: String, required: true, trim: true, maxlength: 20, enum: ['invited', 'pending', 'active', 'suspended'], default: 'invited' },
    joined_at: { type: Date, required: true },
    created_at: { type: Date, required: true, default: Date.now },
    created_by: { type: Number, integer: true, required: true, ref: 'user' },
    updated_at: { type: Date, onUpdate: Date.now },
    updated_by: { type: Number, integer: true, ref: 'user' },
}, { unique: [['agency_id', 'user_id']] });

module.exports = models.agency_membership || model('agency_membership', AgencyMembershipModel);
