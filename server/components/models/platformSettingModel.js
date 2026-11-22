const { Schema, model, models } = require('../utils/Schema');

// Mirrors the `platform_setting` table in db/schema.sql.
// Primary key is `key` (no auto-increment id).
const PlatformSettingModel = new Schema({
    key: { type: String, primaryKey: true, required: true, trim: true, maxlength: 64 },
    value: { type: Schema.Types.Mixed, required: true },
    created_at: { type: Date, required: true, default: Date.now },
    created_by: { type: Number, integer: true, required: true, ref: 'user' },
    updated_at: { type: Date, onUpdate: Date.now },
    updated_by: { type: Number, integer: true, ref: 'user' },
}, { id: false });

module.exports = models.platform_setting || model('platform_setting', PlatformSettingModel);
