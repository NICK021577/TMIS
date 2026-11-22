const { Schema, model, models } = require('../utils/Schema');

// Mirrors the `output_submission` table in db/schema.sql.
// `id` (auto-increment integer primary key) is added automatically by Schema.
const OutputSubmissionModel = new Schema({
    agency_id: { type: Number, integer: true, required: true, ref: 'agency' },
    activity_id: { type: Number, integer: true, required: true, ref: 'activity' },
    session_id: { type: Number, integer: true, ref: 'session' },
    user_id: { type: Number, integer: true, required: true, ref: 'user' },
    client_id: { type: String, required: true, unique: true, trim: true, maxlength: 64 },
    title: { type: String, required: true, trim: true, maxlength: 255 },
    kind: { type: String, required: true, trim: true, maxlength: 20, enum: ['photo', 'file', 'video'] },
    file_ref: { type: String, required: true, trim: true, maxlength: 500 },
    size_bytes: { type: Number, integer: true, required: true },
    submitted_at: { type: Date, required: true },
});

module.exports = models.output_submission || model('output_submission', OutputSubmissionModel);
