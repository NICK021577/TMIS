const { Schema, model, models } = require('../utils/Schema');

// Mirrors the `feedback` table in db/schema.sql.
// `id` (auto-increment integer primary key) is added automatically by Schema.
const FeedbackModel = new Schema({
    agency_id: { type: Number, integer: true, required: true, ref: 'agency' },
    session_id: { type: Number, integer: true, required: true, ref: 'session' },
    user_id: { type: Number, integer: true, required: true, ref: 'user' },
    client_id: { type: String, required: true, unique: true, trim: true, maxlength: 64 },
    rating: { type: Number, integer: true, required: true },
    comments: { type: String, trim: true },
    is_anonymous: { type: Boolean, required: true, default: false },
    submitted_at: { type: Date, required: true },
}, { unique: [['session_id', 'user_id']] });

module.exports = models.feedback || model('feedback', FeedbackModel);
