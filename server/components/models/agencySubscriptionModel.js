const { Schema, model, models } = require('../utils/Schema');

// Mirrors the `agency_subscription` table in db/schema.sql.
// `id` (auto-increment integer primary key) is added automatically by Schema.
const AgencySubscriptionModel = new Schema({
    agency_id: { type: Number, integer: true, required: true, ref: 'agency' },
    plan_id: { type: Number, integer: true, required: true, ref: 'subscription_plan' },
    status: { type: String, required: true, trim: true, maxlength: 20, enum: ['trial', 'active', 'past_due', 'cancelled', 'expired'], default: 'trial' },
    starts_on: { type: Date, sqlType: 'date', required: true },
    ends_on: { type: Date, sqlType: 'date' },
    auto_renew: { type: Boolean, required: true, default: false },
    created_at: { type: Date, required: true, default: Date.now },
    created_by: { type: Number, integer: true, required: true, ref: 'user' },
    updated_at: { type: Date, onUpdate: Date.now },
    updated_by: { type: Number, integer: true, ref: 'user' },
});

module.exports = models.agency_subscription || model('agency_subscription', AgencySubscriptionModel);
