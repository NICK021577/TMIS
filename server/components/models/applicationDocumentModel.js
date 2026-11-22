const { Schema, model, models } = require('../utils/Schema');

// Mirrors the `application_document` table in db/schema.sql.
// `id` (auto-increment integer primary key) is added automatically by Schema.
const ApplicationDocumentModel = new Schema({
    application_id: { type: Number, integer: true, required: true, ref: 'agency_application', onDelete: 'cascade' },
    doc_kind: { type: String, required: true, trim: true, maxlength: 32, enum: ['auth_letter', 'moa', 'valid_id'] },
    file_name: { type: String, required: true, trim: true, maxlength: 255 },
    file_ref: { type: String, required: true, trim: true, maxlength: 500 },
    size_bytes: { type: Number, integer: true, required: true },
});

module.exports = models.application_document || model('application_document', ApplicationDocumentModel);
