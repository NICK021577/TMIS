const { Schema, model, models } = require('../utils/Schema');

// Mirrors the `role_menu` table in db/schema.sql.
// `id` (auto-increment integer primary key) is added automatically by Schema.
const RoleMenuModel = new Schema({
    agency_id: { type: Number, integer: true, required: true, ref: 'agency' },
    role_id: { type: Number, integer: true, required: true, ref: 'agency_role', onDelete: 'cascade' },
    menu_key: { type: String, required: true, trim: true, maxlength: 32, enum: ['dashboard', 'calendar', 'activities', 'participants', 'budget', 'reports', 'messaging', 'about', 'settings'] },
    created_at: { type: Date, required: true, default: Date.now },
    created_by: { type: Number, integer: true, required: true, ref: 'user' },
    updated_at: { type: Date, onUpdate: Date.now },
    updated_by: { type: Number, integer: true, ref: 'user' },
}, { unique: [['role_id', 'menu_key']] });

module.exports = models.role_menu || model('role_menu', RoleMenuModel);
