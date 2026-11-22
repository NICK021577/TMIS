const { Schema, model, models } = require('../utils/Schema');

// Mirrors the `attendance` table in db/schema.sql.
// `id` (auto-increment integer primary key) is added automatically by Schema.
const AttendanceModel = new Schema({
    agency_id: { type: Number, integer: true, required: true, ref: 'agency' },
    session_id: { type: Number, integer: true, required: true, ref: 'session' },
    user_id: { type: Number, integer: true, required: true, ref: 'user' },
    recorded_by: { type: Number, integer: true, ref: 'user' },
    client_id: { type: String, required: true, unique: true, trim: true, maxlength: 64 },
    direction: { type: String, required: true, trim: true, maxlength: 8, enum: ['in', 'out'] },
    method: { type: String, required: true, trim: true, maxlength: 30, enum: ['qr', 'code', 'manual'] },
    device_created_at: { type: Date, required: true },
    server_received_at: { type: Date, required: true },
    sync_status: { type: String, required: true, trim: true, maxlength: 30 },
});

module.exports = models.attendance || model('attendance', AttendanceModel);
