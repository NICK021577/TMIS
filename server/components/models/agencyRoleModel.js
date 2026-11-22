const { Schema, model, models } = require('../utils/Schema');

// Mirrors the `agency_role` table in db/schema.sql.
// `id` (auto-increment integer primary key) is added automatically by Schema.
const AgencyRoleModel = new Schema({
    agency_id: { type: Number, integer: true, required: true, ref: 'agency' },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    data_access: { type: String, required: true, trim: true, maxlength: 32, enum: ['all_records', 'assigned_activities', 'assigned_sessions'] },
    is_system: { type: Boolean, required: true, default: false },
    created_at: { type: Date, required: true, default: Date.now },
    created_by: { type: Number, integer: true, required: true, ref: 'user' },
    updated_at: { type: Date, onUpdate: Date.now },
    updated_by: { type: Number, integer: true, ref: 'user' },
}, { unique: [['agency_id', 'name']] });

module.exports = models.agency_role || model('agency_role', AgencyRoleModel);
