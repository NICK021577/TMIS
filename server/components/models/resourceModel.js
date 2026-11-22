const { Schema, model, models } = require('../utils/Schema');

// Mirrors the `resource` table in db/schema.sql.
// `id` (auto-increment integer primary key) is added automatically by Schema.
const ResourceModel = new Schema({
    agency_id: { type: Number, integer: true, required: true, ref: 'agency' },
    activity_id: { type: Number, integer: true, required: true, ref: 'activity' },
    budget_item_id: { type: Number, integer: true, ref: 'budget_item' },
    resource_type: { type: String, required: true, trim: true, maxlength: 50, enum: ['people', 'venue', 'tools', 'inputs'] },
    name: { type: String, required: true, trim: true, maxlength: 255 },
    unit: { type: String, required: true, trim: true, maxlength: 50 },
    qty_needed: { type: Number, sqlType: 'numeric(12,2)', required: true },
    qty_allocated: { type: Number, sqlType: 'numeric(12,2)', required: true },
    status: { type: String, required: true, trim: true, maxlength: 30 },
    created_at: { type: Date, required: true, default: Date.now },
    created_by: { type: Number, integer: true, required: true, ref: 'user' },
    updated_at: { type: Date, onUpdate: Date.now },
    updated_by: { type: Number, integer: true, ref: 'user' },
});

module.exports = models.resource || model('resource', ResourceModel);
