const { Schema, model, models } = require('../utils/Schema');

// Mirrors the `document_type` table in db/schema.sql.
// `id` (auto-increment integer primary key) is added automatically by Schema.
const DocumentTypeModel = new Schema({
    agency_id: { type: Number, integer: true, required: true, ref: 'agency' },
    name: { type: String, required: true, trim: true, maxlength: 255 },
    required_at_creation: { type: Boolean, required: true, default: false },
    created_at: { type: Date, required: true, default: Date.now },
    created_by: { type: Number, integer: true, required: true, ref: 'user' },
    updated_at: { type: Date, onUpdate: Date.now },
    updated_by: { type: Number, integer: true, ref: 'user' },
});

module.exports = models.document_type || model('document_type', DocumentTypeModel);
