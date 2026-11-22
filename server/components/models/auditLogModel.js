const { Schema, model, models } = require('../utils/Schema');

// Mirrors the `audit_log` table in db/schema.sql.
// `id` (auto-increment integer primary key) is added automatically by Schema.
const AuditLogModel = new Schema({
    agency_id: { type: Number, integer: true, ref: 'agency' },
    action: { type: String, required: true, trim: true, maxlength: 64 },
    target_type: { type: String, required: true, trim: true, maxlength: 32 },
    target_label: { type: String, required: true, trim: true, maxlength: 255 },
    detail: { type: String, trim: true },
    created_at: { type: Date, required: true, default: Date.now },
    created_by: { type: Number, integer: true, required: true, ref: 'user' },
    updated_at: { type: Date, onUpdate: Date.now },
    updated_by: { type: Number, integer: true, ref: 'user' },
});

module.exports = models.audit_log || model('audit_log', AuditLogModel);
