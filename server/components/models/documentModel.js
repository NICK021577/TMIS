const { Schema, model, models } = require('../utils/Schema');

// Mirrors the `document` table in db/schema.sql.
// `id` (auto-increment integer primary key) is added automatically by Schema.
const DocumentModel = new Schema({
    agency_id: { type: Number, integer: true, required: true, ref: 'agency' },
    activity_id: { type: Number, integer: true, required: true, ref: 'activity' },
    session_id: { type: Number, integer: true, ref: 'session' },
    doc_type_id: { type: Number, integer: true, required: true, ref: 'document_type' },
    uploaded_by: { type: Number, integer: true, required: true, ref: 'user' },
    file_name: { type: String, required: true, trim: true, maxlength: 255 },
    file_ref: { type: String, required: true, trim: true, maxlength: 500 },
    size_bytes: { type: Number, integer: true, required: true },
    uploaded_at: { type: Date, required: true },
});

module.exports = models.document || model('document', DocumentModel);
