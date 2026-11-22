const { Schema, model, models } = require('../utils/Schema');

// Mirrors the `session_feedback_summary` table in db/schema.sql.
// `id` (auto-increment integer primary key) is added automatically by Schema.
const SessionFeedbackSummaryModel = new Schema({
    agency_id: { type: Number, integer: true, required: true, ref: 'agency' },
    session_id: { type: Number, integer: true, required: true, unique: true, ref: 'session' },
    activity_id: { type: Number, integer: true, required: true, ref: 'activity' },
    resource_person_id: { type: Number, integer: true, ref: 'user' },
    eligible_count: { type: Number, integer: true, required: true, default: 0 },
    response_count: { type: Number, integer: true, required: true, default: 0 },
    avg_rating: { type: Number, sqlType: 'numeric(3,2)' },
    rating_5: { type: Number, integer: true, required: true },
    rating_4: { type: Number, integer: true, required: true },
    rating_3: { type: Number, integer: true, required: true },
    rating_2: { type: Number, integer: true, required: true },
    rating_1: { type: Number, integer: true, required: true },
    avg_content: { type: Number, sqlType: 'numeric(3,2)' },
    avg_speaker: { type: Number, sqlType: 'numeric(3,2)' },
    avg_venue: { type: Number, sqlType: 'numeric(3,2)' },
    recommend_yes: { type: Number, integer: true, required: true, default: 0 },
    comment_count: { type: Number, integer: true, required: true, default: 0 },
    refreshed_at: { type: Date, required: true },
});

module.exports = models.session_feedback_summary || model('session_feedback_summary', SessionFeedbackSummaryModel);
