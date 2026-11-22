const { Schema, model, models } = require('../utils/Schema');

// Mirrors the `registration` table in db/schema.sql.
// `id` (auto-increment integer primary key) is added automatically by Schema.
const RegistrationModel = new Schema({
    agency_id: { type: Number, integer: true, required: true, ref: 'agency' },
    activity_id: { type: Number, integer: true, required: true, ref: 'activity' },
    user_id: { type: Number, integer: true, required: true, ref: 'user' },
    status: { type: String, required: true, trim: true, maxlength: 50 },
    registered_at: { type: Date, required: true },
}, { unique: [['activity_id', 'user_id']] });

module.exports = models.registration || model('registration', RegistrationModel);
