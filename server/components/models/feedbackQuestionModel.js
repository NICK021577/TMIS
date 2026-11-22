const { Schema, model, models } = require('../utils/Schema');

// Mirrors the `feedback_question` table in db/schema.sql.
// `id` (auto-increment integer primary key) is added automatically by Schema.
const FeedbackQuestionModel = new Schema({
    agency_id: { type: Number, integer: true, required: true, ref: 'agency' },
    activity_id: { type: Number, integer: true, required: true, ref: 'activity' },
    text: { type: String, required: true, trim: true, maxlength: 500 },
    qtype: { type: String, required: true, trim: true, maxlength: 20, enum: ['rating', 'choice', 'text'] },
    criterion: { type: String, trim: true, maxlength: 20, enum: ['overall', 'content', 'speaker', 'venue', 'recommend'] },
    options: { type: Schema.Types.Mixed },
    required: { type: Boolean, required: true, default: false },
    sort_order: { type: Number, integer: true, required: true, default: 0 },
    created_at: { type: Date, required: true, default: Date.now },
    created_by: { type: Number, integer: true, required: true, ref: 'user' },
    updated_at: { type: Date, onUpdate: Date.now },
    updated_by: { type: Number, integer: true, ref: 'user' },
});

module.exports = models.feedback_question || model('feedback_question', FeedbackQuestionModel);
