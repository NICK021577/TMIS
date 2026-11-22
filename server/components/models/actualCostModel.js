const { Schema, model, models } = require('../utils/Schema');

// Mirrors the `actual_cost` table in db/schema.sql.
// `id` (auto-increment integer primary key) is added automatically by Schema.
const ActualCostModel = new Schema({
    agency_id: { type: Number, integer: true, required: true, ref: 'agency' },
    budget_item_id: { type: Number, integer: true, required: true, ref: 'budget_item' },
    receipt_document_id: { type: Number, integer: true, ref: 'document' },
    recorded_by: { type: Number, integer: true, required: true, ref: 'user' },
    amount: { type: Number, sqlType: 'numeric(14,2)', required: true },
    incurred_on: { type: Date, sqlType: 'date', required: true },
});

module.exports = models.actual_cost || model('actual_cost', ActualCostModel);
