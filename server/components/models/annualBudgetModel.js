const { Schema, model, models } = require('../utils/Schema');

// Mirrors the `annual_budget` table in db/schema.sql.
// `id` (auto-increment integer primary key) is added automatically by Schema.
const AnnualBudgetModel = new Schema({
    agency_id: { type: Number, integer: true, required: true, ref: 'agency' },
    funding_source_id: { type: Number, integer: true, required: true, ref: 'funding_source' },
    activity_type_id: { type: Number, integer: true, required: true, ref: 'activity_type' },
    year: { type: Number, integer: true, required: true },
    amount: { type: Number, sqlType: 'numeric(14,2)', required: true },
    created_at: { type: Date, required: true, default: Date.now },
    created_by: { type: Number, integer: true, required: true, ref: 'user' },
    updated_at: { type: Date, onUpdate: Date.now },
    updated_by: { type: Number, integer: true, ref: 'user' },
});

module.exports = models.annual_budget || model('annual_budget', AnnualBudgetModel);
