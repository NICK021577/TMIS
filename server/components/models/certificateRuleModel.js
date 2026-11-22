const { Schema, model, models } = require('../utils/Schema');

// Mirrors the `certificate_rule` table in db/schema.sql.
// `id` (auto-increment integer primary key) is added automatically by Schema.
const CertificateRuleModel = new Schema({
    agency_id: { type: Number, integer: true, required: true, ref: 'agency' },
    activity_id: { type: Number, integer: true, required: true, unique: true, ref: 'activity' },
    min_attendance_pct: { type: Number, sqlType: 'numeric(5,2)', required: true },
    require_feedback: { type: Boolean, required: true, default: false },
    require_reentry_plan: { type: Boolean, required: true, default: false },
    require_output: { type: Boolean, required: true, default: false },
    created_at: { type: Date, required: true, default: Date.now },
    created_by: { type: Number, integer: true, required: true, ref: 'user' },
    updated_at: { type: Date, onUpdate: Date.now },
    updated_by: { type: Number, integer: true, ref: 'user' },
});

module.exports = models.certificate_rule || model('certificate_rule', CertificateRuleModel);
