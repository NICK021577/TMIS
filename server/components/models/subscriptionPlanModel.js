const { Schema, model, models } = require('../utils/Schema');

// Mirrors the `subscription_plan` table in db/schema.sql.
// `id` (auto-increment integer primary key) is added automatically by Schema.
const SubscriptionPlanModel = new Schema({
    code: { type: String, required: true, unique: true, trim: true, maxlength: 32 },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, trim: true },
    price: { type: Number, sqlType: 'numeric(12,2)', required: true },
    currency: { type: String, required: true, trim: true, maxlength: 3 },
    billing_period: { type: String, required: true, trim: true, maxlength: 16, enum: ['free', 'monthly', 'yearly'] },
    max_participants: { type: Number, integer: true },
    max_storage_mb: { type: Number, integer: true },
    features: { type: Schema.Types.Mixed },
    is_active: { type: Boolean, required: true, default: false },
    created_at: { type: Date, required: true, default: Date.now },
    created_by: { type: Number, integer: true, required: true, ref: 'user' },
    updated_at: { type: Date, onUpdate: Date.now },
    updated_by: { type: Number, integer: true, ref: 'user' },
});

module.exports = models.subscription_plan || model('subscription_plan', SubscriptionPlanModel);
