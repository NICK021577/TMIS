const { Schema, model, models } = require('../utils/Schema');

// Mirrors the `funding_source` table in db/schema.sql.
// `id` (auto-increment integer primary key) is added automatically by Schema.
const FundingSourceModel = new Schema({
    agency_id: { type: Number, integer: true, required: true, ref: 'agency' },
    partner_id: { type: Number, integer: true, ref: 'partner_agency' },
    name: { type: String, required: true, trim: true, maxlength: 255 },
    archived: { type: Boolean, required: true, default: false },
    created_at: { type: Date, required: true, default: Date.now },
    created_by: { type: Number, integer: true, required: true, ref: 'user' },
    updated_at: { type: Date, onUpdate: Date.now },
    updated_by: { type: Number, integer: true, ref: 'user' },
}, { unique: [['agency_id', 'name']] });

module.exports = models.funding_source || model('funding_source', FundingSourceModel);
