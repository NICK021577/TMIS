const { Schema, model, models } = require('../utils/Schema');

// Mirrors the `invitation` table in db/schema.sql.
// `id` (auto-increment integer primary key) is added automatically by Schema.
const InvitationModel = new Schema({
    agency_id: { type: Number, integer: true, required: true, ref: 'agency' },
    code: { type: String, required: true, unique: true, trim: true, maxlength: 64 },
    role_id: { type: Number, integer: true, ref: 'agency_role' },
    category_id: { type: Number, integer: true, ref: 'participant_category' },
    affiliation: { type: String, trim: true, maxlength: 255 },
    expires_at: { type: Date, required: true },
    max_uses: { type: Number, integer: true, required: true },
    created_at: { type: Date, required: true, default: Date.now },
    created_by: { type: Number, integer: true, required: true, ref: 'user' },
    updated_at: { type: Date, onUpdate: Date.now },
    updated_by: { type: Number, integer: true, ref: 'user' },
});

module.exports = models.invitation || model('invitation', InvitationModel);
