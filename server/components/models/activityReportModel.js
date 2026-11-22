const { Schema, model, models } = require('../utils/Schema');

// Mirrors the `activity_report` table in db/schema.sql.
// `id` (auto-increment integer primary key) is added automatically by Schema.
const ActivityReportModel = new Schema({
    agency_id: { type: Number, integer: true, required: true, ref: 'agency' },
    activity_id: { type: Number, integer: true, required: true, ref: 'activity' },
    version: { type: Number, integer: true, required: true },
    status: { type: String, required: true, trim: true, maxlength: 20, enum: ['generated', 'reviewed', 'final'], default: 'generated' },
    title: { type: String, required: true, trim: true, maxlength: 255 },
    input_snapshot: { type: Schema.Types.Mixed, required: true },
    model: { type: String, trim: true, maxlength: 64 },
    generated_at: { type: Date },
    reviewed_by: { type: Number, integer: true, ref: 'user' },
    reviewed_at: { type: Date },
    finalized_by: { type: Number, integer: true, ref: 'user' },
    finalized_at: { type: Date },
    created_at: { type: Date, required: true, default: Date.now },
    created_by: { type: Number, integer: true, required: true, ref: 'user' },
    updated_at: { type: Date, onUpdate: Date.now },
    updated_by: { type: Number, integer: true, ref: 'user' },
}, { unique: [['activity_id', 'version']] });

module.exports = models.activity_report || model('activity_report', ActivityReportModel);
