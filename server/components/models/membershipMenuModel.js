const { Schema, model, models } = require('../utils/Schema');

// Mirrors the `membership_menu` table in db/schema.sql.
// `id` (auto-increment integer primary key) is added automatically by Schema.
const MembershipMenuModel = new Schema({
    agency_id: { type: Number, integer: true, required: true, ref: 'agency' },
    membership_id: { type: Number, integer: true, required: true, ref: 'agency_membership', onDelete: 'cascade' },
    menu_key: { type: String, required: true, trim: true, maxlength: 32 },
    is_enabled: { type: Boolean, required: true, default: false },
    created_at: { type: Date, required: true, default: Date.now },
    created_by: { type: Number, integer: true, required: true, ref: 'user' },
    updated_at: { type: Date, onUpdate: Date.now },
    updated_by: { type: Number, integer: true, ref: 'user' },
}, { unique: [['membership_id', 'menu_key']] });

module.exports = models.membership_menu || model('membership_menu', MembershipMenuModel);
