const { Schema, model, models } = require('../utils/Schema');

// Mirrors the `activity_objective` table in db/schema.sql.
// `id` (auto-increment integer primary key) is added automatically by Schema.
const ActivityObjectiveModel = new Schema({
    agency_id: { type: Number, integer: true, required: true, ref: 'agency' },
    activity_id: { type: Number, integer: true, required: true, ref: 'activity' },
    text: { type: String, required: true, trim: true, maxlength: 500 },
    sort_order: { type: Number, integer: true, required: true, default: 0 },
    created_at: { type: Date, required: true, default: Date.now },
    created_by: { type: Number, integer: true, required: true, ref: 'user' },
    updated_at: { type: Date, onUpdate: Date.now },
    updated_by: { type: Number, integer: true, ref: 'user' },
});

module.exports = models.activity_objective || model('activity_objective', ActivityObjectiveModel);
