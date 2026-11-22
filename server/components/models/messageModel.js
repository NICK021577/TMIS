const { Schema, model, models } = require('../utils/Schema');

// Mirrors the `message` table in db/schema.sql.
// `id` (auto-increment integer primary key) is added automatically by Schema.
const MessageModel = new Schema({
    agency_id: { type: Number, integer: true, required: true, ref: 'agency' },
    group_id: { type: Number, integer: true, required: true, ref: 'message_group' },
    sender_id: { type: Number, integer: true, required: true, ref: 'user' },
    removed_by: { type: Number, integer: true, ref: 'user' },
    body: { type: String, required: true, trim: true },
    sent_at: { type: Date, required: true },
    removed: { type: Boolean, required: true, default: false },
});

module.exports = models.message || model('message', MessageModel);
