const { Schema, model, models } = require('../utils/Schema');

// Mirrors the `platform_default_item` table in db/schema.sql.
// `id` (auto-increment integer primary key) is added automatically by Schema.
const PlatformDefaultItemModel = new Schema({
    kind: { type: String, required: true, trim: true, maxlength: 32, enum: ['activity_type', 'document_type', 'budget_category'] },
    name: { type: String, required: true, trim: true, maxlength: 255 },
    sort_order: { type: Number, integer: true, required: true, default: 0 },
    created_at: { type: Date, required: true, default: Date.now },
    created_by: { type: Number, integer: true, required: true, ref: 'user' },
    updated_at: { type: Date, onUpdate: Date.now },
    updated_by: { type: Number, integer: true, ref: 'user' },
}, { unique: [['kind', 'name']] });

module.exports = models.platform_default_item || model('platform_default_item', PlatformDefaultItemModel);
