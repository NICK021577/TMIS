const { Schema, model, models } = require('../utils/Schema');

// Mirrors the `material` table in db/schema.sql.
// `id` (auto-increment integer primary key) is added automatically by Schema.
const MaterialModel = new Schema({
    agency_id: { type: Number, integer: true, required: true, ref: 'agency' },
    activity_id: { type: Number, integer: true, required: true, ref: 'activity' },
    session_id: { type: Number, integer: true, ref: 'session' },
    uploaded_by: { type: Number, integer: true, required: true, ref: 'user' },
    title: { type: String, required: true, trim: true, maxlength: 255 },
    kind: { type: String, required: true, trim: true, maxlength: 20, enum: ['ppt', 'pdf', 'word', 'image', 'handout', 'link'] },
    file_ref: { type: String, trim: true, maxlength: 500 },
    url: { type: String, trim: true, maxlength: 500 },
    size_bytes: { type: Number, integer: true },
    uploaded_at: { type: Date, required: true },
});

module.exports = models.material || model('material', MaterialModel);
