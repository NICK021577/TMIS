const { Schema, model, models } = require('../utils/Schema');

// Mirrors the `staffing` table in db/schema.sql.
// `id` (auto-increment integer primary key) is added automatically by Schema.
const StaffingModel = new Schema({
    agency_id: { type: Number, integer: true, required: true, ref: 'agency' },
    activity_id: { type: Number, integer: true, required: true, ref: 'activity' },
    user_id: { type: Number, integer: true, required: true, ref: 'user' },
    role_id: { type: Number, integer: true, required: true, ref: 'agency_role' },
    duty_date: { type: Date, sqlType: 'date' },
    duty: { type: String, trim: true, maxlength: 255 },
    status: { type: String, required: true, trim: true, maxlength: 50 },
    created_at: { type: Date, required: true, default: Date.now },
    created_by: { type: Number, integer: true, required: true, ref: 'user' },
    updated_at: { type: Date, onUpdate: Date.now },
    updated_by: { type: Number, integer: true, ref: 'user' },
});

module.exports = models.staffing || model('staffing', StaffingModel);
