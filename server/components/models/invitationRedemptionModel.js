const { Schema, model, models } = require('../utils/Schema');

// Mirrors the `invitation_redemption` table in db/schema.sql.
// `id` (auto-increment integer primary key) is added automatically by Schema.
const InvitationRedemptionModel = new Schema({
    invitation_id: { type: Number, integer: true, required: true, ref: 'invitation', onDelete: 'cascade' },
    user_id: { type: Number, integer: true, required: true, ref: 'user' },
    redeemed_at: { type: Date, required: true },
}, { unique: [['invitation_id', 'user_id']] });

module.exports = models.invitation_redemption || model('invitation_redemption', InvitationRedemptionModel);
