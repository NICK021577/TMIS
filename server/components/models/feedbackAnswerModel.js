const { Schema, model, models } = require('../utils/Schema');

// Mirrors the `feedback_answer` table in db/schema.sql.
// `id` (auto-increment integer primary key) is added automatically by Schema.
const FeedbackAnswerModel = new Schema({
    agency_id: { type: Number, integer: true, required: true, ref: 'agency' },
    feedback_id: { type: Number, integer: true, required: true, ref: 'feedback', onDelete: 'cascade' },
    question_id: { type: Number, integer: true, required: true, ref: 'feedback_question' },
    rating_value: { type: Number, integer: true },
    text_value: { type: String, trim: true },
}, { unique: [['feedback_id', 'question_id']] });

module.exports = models.feedback_answer || model('feedback_answer', FeedbackAnswerModel);
