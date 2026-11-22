const { Schema, model, models } = require('../utils/Schema');

// Mirrors the `certificate` table in db/schema.sql.
// `id` (auto-increment integer primary key) is added automatically by Schema.
const CertificateModel = new Schema({
    agency_id: { type: Number, integer: true, required: true, ref: 'agency' },
    activity_id: { type: Number, integer: true, required: true, ref: 'activity' },
    user_id: { type: Number, integer: true, required: true, ref: 'user' },
    certificate_no: { type: String, required: true, unique: true, trim: true, maxlength: 64 },
    file_ref: { type: String, trim: true, maxlength: 500 },
    status: { type: String, required: true, trim: true, maxlength: 20, enum: ['eligible', 'released', 'revoked'], default: 'eligible' },
    released_at: { type: Date },
});

module.exports = models.certificate || model('certificate', CertificateModel);
