const { Schema, model, models } = require('../utils/Schema');

// Mirrors the `agency` table in db/schema.sql.
// `id` (auto-increment integer primary key) is added automatically by Schema.
const AgencyModel = new Schema({
    name: { type: String, required: true, unique: true, trim: true, maxlength: 255 },
    short_name: { type: String, required: true, unique: true, trim: true, maxlength: 32 },
    type: { type: String, required: true, trim: true, maxlength: 32, enum: ['government', 'academic', 'private', 'non_profit'] },
    region: { type: String, required: true, trim: true, maxlength: 64 },
    status: { type: String, required: true, trim: true, maxlength: 20, enum: ['active', 'suspended'], default: 'active' },
    mission: { type: String, trim: true },
    vision: { type: String, trim: true },
    mandate: { type: String, trim: true },
    values: { type: Schema.Types.Mixed },
    contact_email: { type: String, trim: true, lowercase: true, maxlength: 255, match: /^\S+@\S+\.\S+$/ },
    logo_url: { type: String, trim: true, maxlength: 500 },
    cover_url: { type: String, trim: true, maxlength: 500 },
    brand_color: { type: String, required: true, trim: true, maxlength: 20 },
    welcomed_at: { type: Date },
    created_at: { type: Date, required: true, default: Date.now },
    created_by: { type: Number, integer: true, required: true, ref: 'user' },
    updated_at: { type: Date, onUpdate: Date.now },
    updated_by: { type: Number, integer: true, ref: 'user' },
});

module.exports = models.agency || model('agency', AgencyModel);
