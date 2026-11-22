const { Schema, model, models } = require('../utils/Schema');

// Mirrors the `calendar_entry` table in db/schema.sql.
// `id` (auto-increment integer primary key) is added automatically by Schema.
const CalendarEntryModel = new Schema({
    agency_id: { type: Number, integer: true, required: true, ref: 'agency' },
    activity_type_id: { type: Number, integer: true, required: true, ref: 'activity_type' },
    funding_source_id: { type: Number, integer: true, ref: 'funding_source' },
    title: { type: String, required: true, trim: true, maxlength: 255 },
    planned_start: { type: Date, sqlType: 'date', required: true },
    planned_end: { type: Date, sqlType: 'date', required: true },
    planned_venue: { type: String, trim: true, maxlength: 255 },
    status: { type: String, required: true, trim: true, maxlength: 50 },
    published: { type: Boolean, required: true, default: false },
    created_at: { type: Date, required: true, default: Date.now },
    created_by: { type: Number, integer: true, required: true, ref: 'user' },
    updated_at: { type: Date, onUpdate: Date.now },
    updated_by: { type: Number, integer: true, ref: 'user' },
});

module.exports = models.calendar_entry || model('calendar_entry', CalendarEntryModel);
