const { Schema, model, models } = require('../utils/Schema');

// Mirrors the `session` table in db/schema.sql.
// `id` (auto-increment integer primary key) is added automatically by Schema.
const SessionModel = new Schema({
    agency_id: { type: Number, integer: true, required: true, ref: 'agency' },
    activity_id: { type: Number, integer: true, required: true, ref: 'activity' },
    resource_person_id: { type: Number, integer: true, ref: 'user' },
    title: { type: String, required: true, trim: true, maxlength: 255 },
    session_type: { type: String, required: true, trim: true, maxlength: 20, enum: ['session', 'workshop', 'practicum', 'closing'] },
    session_date: { type: Date, sqlType: 'date', required: true },
    period: { type: String, required: true, trim: true, maxlength: 10, enum: ['AM', 'PM'] },
    start_time: { type: String, sqlType: 'time', required: true },
    end_time: { type: String, sqlType: 'time', required: true },
    room: { type: String, trim: true, maxlength: 255 },
    description: { type: String, trim: true },
    qr_token: { type: String, required: true, unique: true, trim: true, maxlength: 128 },
    short_code: { type: String, required: true, trim: true, maxlength: 16 },
    opens_at: { type: Date, required: true },
    closes_at: { type: Date, required: true },
    feedback_opens_at: { type: Date },
    created_at: { type: Date, required: true, default: Date.now },
    created_by: { type: Number, integer: true, required: true, ref: 'user' },
    updated_at: { type: Date, onUpdate: Date.now },
    updated_by: { type: Number, integer: true, ref: 'user' },
}, { unique: [['activity_id', 'session_date', 'period']] });

module.exports = models.session || model('session', SessionModel);
