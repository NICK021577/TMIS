const { Schema, model, models } = require('../utils/Schema');

// Mirrors the `budget_item` table in db/schema.sql.
// `id` (auto-increment integer primary key) is added automatically by Schema.
const BudgetItemModel = new Schema({
    agency_id: { type: Number, integer: true, required: true, ref: 'agency' },
    activity_id: { type: Number, integer: true, required: true, ref: 'activity' },
    category_id: { type: Number, integer: true, required: true, ref: 'budget_category' },
    funding_source_id: { type: Number, integer: true, ref: 'funding_source' },
    description: { type: String, required: true, trim: true },
    qty: { type: Number, sqlType: 'numeric(12,2)', required: true },
    unit_cost: { type: Number, sqlType: 'numeric(14,2)', required: true },
    created_at: { type: Date, required: true, default: Date.now },
    created_by: { type: Number, integer: true, required: true, ref: 'user' },
    updated_at: { type: Date, onUpdate: Date.now },
    updated_by: { type: Number, integer: true, ref: 'user' },
});

module.exports = models.budget_item || model('budget_item', BudgetItemModel);
