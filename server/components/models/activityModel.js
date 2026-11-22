const { Schema, model, models } = require('../utils/Schema');

// Mirrors the `activity` table in db/schema.sql.
// `id` (auto-increment integer primary key) is added automatically by Schema.
const ActivityModel = new Schema({
    agency_id: { type: Number, integer: true, required: true, ref: 'agency' },
    calendar_entry_id: { type: Number, integer: true, unique: true, ref: 'calendar_entry' },
    activity_type_id: { type: Number, integer: true, required: true, ref: 'activity_type' },
    funding_source_id: { type: Number, integer: true, ref: 'funding_source' },
    title: { type: String, required: true, trim: true, maxlength: 255 },
    venue: { type: String, required: true, trim: true, maxlength: 255 },
    start_date: { type: Date, sqlType: 'date', required: true },
    end_date: { type: Date, sqlType: 'date', required: true },
    topic: { type: String, trim: true, maxlength: 255 },
    description: { type: String, trim: true },
    audience: { type: String, trim: true, maxlength: 255 },
    max_participants: { type: Number, integer: true },
    is_public: { type: Boolean, required: true, default: false },
    status: { type: String, required: true, trim: true, maxlength: 50, enum: ['draft', 'upcoming', 'ongoing', 'completed', 'cancelled'], default: 'draft' },
    join_code: { type: String, required: true, unique: true, trim: true, maxlength: 32 },
    created_at: { type: Date, required: true, default: Date.now },
    created_by: { type: Number, integer: true, required: true, ref: 'user' },
    updated_at: { type: Date, onUpdate: Date.now },
    updated_by: { type: Number, integer: true, ref: 'user' },
});

module.exports = models.activity || model('activity', ActivityModel);
