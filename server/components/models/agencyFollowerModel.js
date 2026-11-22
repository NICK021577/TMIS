const { Schema, model, models } = require('../utils/Schema');

// Mirrors the `agency_follower` table in db/schema.sql.
// `id` (auto-increment integer primary key) is added automatically by Schema.
const AgencyFollowerModel = new Schema({
    agency_id: { type: Number, integer: true, required: true, ref: 'agency' },
    user_id: { type: Number, integer: true, required: true, ref: 'user' },
    followed_at: { type: Date, required: true },
}, { unique: [['agency_id', 'user_id']] });

module.exports = models.agency_follower || model('agency_follower', AgencyFollowerModel);
