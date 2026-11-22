const { Schema, model, models } = require('../utils/Schema');

// Mirrors the `activity_feedback_summary` table in db/schema.sql.
// `id` (auto-increment integer primary key) is added automatically by Schema.
const ActivityFeedbackSummaryModel = new Schema({
    agency_id: { type: Number, integer: true, required: true, ref: 'agency' },
    activity_id: { type: Number, integer: true, required: true, unique: true, ref: 'activity' },
    sessions_rated: { type: Number, integer: true, required: true, default: 0 },
    eligible_count: { type: Number, integer: true, required: true, default: 0 },
    response_count: { type: Number, integer: true, required: true, default: 0 },
    avg_rating: { type: Number, sqlType: 'numeric(3,2)' },
    recommend_pct: { type: Number, sqlType: 'numeric(5,2)' },
    best_session_id: { type: Number, integer: true, ref: 'session' },
    lowest_session_id: { type: Number, integer: true, ref: 'session' },
    refreshed_at: { type: Date, required: true },
});

module.exports = models.activity_feedback_summary || model('activity_feedback_summary', ActivityFeedbackSummaryModel);
