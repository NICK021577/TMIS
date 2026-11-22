const { Schema, model, models } = require('../utils/Schema');

// Mirrors the `group_member` table in db/schema.sql.
// `id` (auto-increment integer primary key) is added automatically by Schema.
const GroupMemberModel = new Schema({
    agency_id: { type: Number, integer: true, required: true, ref: 'agency' },
    group_id: { type: Number, integer: true, required: true, ref: 'message_group', onDelete: 'cascade' },
    user_id: { type: Number, integer: true, required: true, ref: 'user' },
    muted: { type: Boolean, required: true, default: false },
    last_read_at: { type: Date },
    joined_at: { type: Date, required: true },
}, { unique: [['group_id', 'user_id']] });

module.exports = models.group_member || model('group_member', GroupMemberModel);
