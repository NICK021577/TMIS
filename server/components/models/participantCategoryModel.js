const { Schema, model, models } = require('../utils/Schema');

// Mirrors the `participant_category` table in db/schema.sql.
// `id` (auto-increment integer primary key) is added automatically by Schema.
const ParticipantCategoryModel = new Schema({
    agency_id: { type: Number, integer: true, required: true, ref: 'agency' },
    name: { type: String, required: true, trim: true, maxlength: 255 },
    created_at: { type: Date, required: true, default: Date.now },
    created_by: { type: Number, integer: true, required: true, ref: 'user' },
    updated_at: { type: Date, onUpdate: Date.now },
    updated_by: { type: Number, integer: true, ref: 'user' },
}, { unique: [['agency_id', 'name']] });

module.exports = models.participant_category || model('participant_category', ParticipantCategoryModel);
