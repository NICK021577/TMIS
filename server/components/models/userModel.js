const { Schema, model, models } = require('../utils/Schema');

const UserModel = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        maxlength: 255,
        match: /^\S+@\S+\.\S+$/,
    },
    password: {
        type: String,
        required: true,
        maxlength: 255,
        select: false, // hidden unless you ask for it: { select: '+password_hash' }
    },
    first_name: { 
        type: String, 
        required: true, 
        trim: true, 
        maxlength: 100 
    },
    middle_name: { 
        type: String, 
        trim: true, 
        maxlength: 100 
    },
    last_name: { 
        type: String, 
        required: true, 
        trim: true, 
        maxlength: 100 
    },
    contact: { 
        type: String, 
        trim: true, 
        maxlength: 100 
    },
    status: {
        type: String,
        required: true,
        enum: ['active', 'suspended'],
        default: 'active',
        maxlength: 20,
    },
    is_super_admin: { 
        type: Boolean, 
        required: true, 
        default: false 
    },
    must_reset_password: { 
        type: Boolean, 
        required: true, 
        default: false 
    },
    last_sign_in_at: { 
        type: Date 
    },
    created_at: { 
        type: Date, 
        required: true, 
        default: Date.now 
    },
});

// Custom helpers, like Mongoose statics
UserModel.statics.findByEmail = function (email, options) {
    return this.findOne({ email }, options);
};

UserModel.statics.recordSignIn = function (id) {
    return this.findByIdAndUpdate(id, { last_sign_in_at: new Date() });
};

module.exports = models.user || model('user', UserModel);
