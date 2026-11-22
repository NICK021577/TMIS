const { Schema, model, models } = require('../utils/Schema');

// Mirrors the `activity_report_section` table in db/schema.sql.
// `id` (auto-increment integer primary key) is added automatically by Schema.
const ActivityReportSectionModel = new Schema({
    agency_id: { type: Number, integer: true, required: true, ref: 'agency' },
    report_id: { type: Number, integer: true, required: true, ref: 'activity_report', onDelete: 'cascade' },
    section_key: { type: String, required: true, trim: true, maxlength: 32, enum: ['summary', 'objectives', 'delivery', 'feedback', 'budget', 'outputs', 'recommendations'] },
    title: { type: String, required: true, trim: true, maxlength: 255 },
    body: { type: String, required: true, trim: true },
    is_edited: { type: Boolean, required: true, default: false },
    sort_order: { type: Number, integer: true, required: true, default: 0 },
    created_at: { type: Date, required: true, default: Date.now },
    created_by: { type: Number, integer: true, required: true, ref: 'user' },
    updated_at: { type: Date, onUpdate: Date.now },
    updated_by: { type: Number, integer: true, ref: 'user' },
}, { unique: [['report_id', 'section_key']] });

module.exports = models.activity_report_section || model('activity_report_section', ActivityReportSectionModel);
