const { Schema, model, models } = require('../utils/Schema');

// Mirrors the `notification` table in db/schema.sql.
// `id` (auto-increment integer primary key) is added automatically by Schema.
const NotificationModel = new Schema({
    agency_id: { type: Number, integer: true, ref: 'agency' },
    user_id: { type: Number, integer: true, required: true, ref: 'user' },
    title: { type: String, required: true, trim: true, maxlength: 255 },
    body: { type: String, required: true, trim: true },
    link: { type: String, trim: true, maxlength: 255 },
    read_at: { type: Date },
    created_at: { type: Date, required: true, default: Date.now },
});

module.exports = models.notification || model('notification', NotificationModel);
