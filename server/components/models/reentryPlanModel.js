const { Schema, model, models } = require('../utils/Schema');

// Mirrors the `reentry_plan` table in db/schema.sql.
// `id` (auto-increment integer primary key) is added automatically by Schema.
const ReentryPlanModel = new Schema({
    agency_id: { type: Number, integer: true, required: true, ref: 'agency' },
    activity_id: { type: Number, integer: true, required: true, ref: 'activity' },
    user_id: { type: Number, integer: true, required: true, ref: 'user' },
    client_id: { type: String, required: true, unique: true, trim: true, maxlength: 64 },
    summary: { type: String, required: true, trim: true, maxlength: 255 },
    timeline: { type: String, trim: true, maxlength: 255 },
    details: { type: String, required: true, trim: true },
    expected_result: { type: String, trim: true },
    support_needed: { type: String, trim: true },
    file_ref: { type: String, trim: true, maxlength: 500 },
    status: { type: String, required: true, trim: true, maxlength: 20, enum: ['pending', 'submitted'], default: 'pending' },
    submitted_at: { type: Date },
}, { unique: [['activity_id', 'user_id']] });

module.exports = models.reentry_plan || model('reentry_plan', ReentryPlanModel);
