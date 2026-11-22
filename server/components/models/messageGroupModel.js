const { Schema, model, models } = require('../utils/Schema');

// Mirrors the `message_group` table in db/schema.sql.
// `id` (auto-increment integer primary key) is added automatically by Schema.
const MessageGroupModel = new Schema({
    agency_id: { type: Number, integer: true, required: true, ref: 'agency' },
    activity_id: { type: Number, integer: true, ref: 'activity' },
    name: { type: String, required: true, trim: true, maxlength: 255 },
    scope: { type: String, required: true, trim: true, maxlength: 20, enum: ['dm', 'activity', 'agency'] },
    archived: { type: Boolean, required: true, default: false },
    created_at: { type: Date, required: true, default: Date.now },
    created_by: { type: Number, integer: true, required: true, ref: 'user' },
    updated_at: { type: Date, onUpdate: Date.now },
    updated_by: { type: Number, integer: true, ref: 'user' },
});

module.exports = models.message_group || model('message_group', MessageGroupModel);
