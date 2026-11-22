const { Schema, model, models } = require('../utils/Schema');

// Mirrors the `participant_profile` table in db/schema.sql.
// Primary key is `user_id` (no auto-increment id).
const ParticipantProfileModel = new Schema({
    user_id: { type: Number, integer: true, primaryKey: true, required: true, ref: 'user', onDelete: 'cascade' },
    sex: { type: String, trim: true, maxlength: 16 },
    birth_date: { type: Date, sqlType: 'date' },
    province: { type: String, trim: true, maxlength: 100 },
    municipality: { type: String, trim: true, maxlength: 100 },
    avatar_url: { type: String, trim: true, maxlength: 500 },
    onboarded_at: { type: Date },
}, { id: false });

module.exports = models.participant_profile || model('participant_profile', ParticipantProfileModel);
