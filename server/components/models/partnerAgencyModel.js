const { Schema, model, models } = require('../utils/Schema');

// Mirrors the `partner_agency` table in db/schema.sql.
// `id` (auto-increment integer primary key) is added automatically by Schema.
const PartnerAgencyModel = new Schema({
    agency_id: { type: Number, integer: true, required: true, ref: 'agency' },
    name: { type: String, required: true, trim: true, maxlength: 255 },
    type: { type: String, required: true, trim: true, maxlength: 100, enum: ['government_agency', 'educational_institution', 'private_company', 'ngo_cooperative_association'] },
    is_self: { type: Boolean, required: true, default: false },
    archived: { type: Boolean, required: true, default: false },
    created_at: { type: Date, required: true, default: Date.now },
    created_by: { type: Number, integer: true, required: true, ref: 'user' },
    updated_at: { type: Date, onUpdate: Date.now },
    updated_by: { type: Number, integer: true, ref: 'user' },
}, { unique: [['agency_id', 'name']] });

module.exports = models.partner_agency || model('partner_agency', PartnerAgencyModel);
