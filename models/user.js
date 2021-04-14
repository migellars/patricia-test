const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const config = require("config");


const UserSchema = new mongoose.Schema({
    userId: String,
    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    phone: { type: String, default: "" },
    email: { type: String, default: "", required: true, unique: true },
    password: { type: String, default: "" },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    isVerified: { type: Boolean, default: true },
    accessToken: { type: String, default: "" },
    refreshToken: { type: String, default: "" },
    status: { type: String, enum: ["active", "inactive", "blocked"], default: "inactive" },
    profilePic: { type: String, default: "" },
    modifiedDate: Number,
    lastLogin: { type: Date }
}, { timestamps: true });

const User = mongoose.model("User", UserSchema);

const userAuditSchema = new mongoose.Schema({
    userId: String,
    firstName: String,
    lastName: String,
    phone: String,
    email: String,
    status: String,
    profilePic: String,
    createdBy: String,
    modifiedBy: String,
    modifiedDate: Number,
    lastLogin: Date
});

const UserAudit = mongoose.model("Useraudit", userAuditSchema);

function validateUserPost(user) {
    const schema = {
        firstName: Joi.string().min(2).max(200).required(),
        lastName: Joi.string().min(2).max(200).required(),
        password: Joi.string().min(6).max(20).required(),
        email: Joi.string().email().required(),
        phone: Joi.string(),
    };
    return Joi.validate(user, schema);
}

function validateUserPostByAdmin(user) {
    const schema = {
        firstName: Joi.string().min(2).max(200).required(),
        lastName: Joi.string().min(2).max(200).required(),
        password: Joi.string().min(6).max(20).required(),
        email: Joi.string().email().required(),
        phone: Joi.string()
    };
    return Joi.validate(user, schema);
}

function validateEmail(user) {
    const schema = {
        email: Joi.string().email().required()
    };
    return Joi.validate(user, schema);
}

function validateUserPut(user) {
    const schema = {
        userId: Joi.string().min(1).max(200),
        firstName: Joi.string().min(2).max(200),
        lastName: Joi.string().min(2).max(200),
        email: Joi.string().email(),
        phone: Joi.string(),
        profilePic: Joi.string().min(1).max(200).allow(""),
        status: Joi.string().valid(["active", "inactive", "blocked"])
    };
    return Joi.validate(user, schema);
}

function validateUserLogin(user) {
    const schema = {
        email: Joi.string().min(6).max(200).required(),
        password: Joi.string().min(6).max(200).required(),
    };
    return Joi.validate(user, schema);
}

function validateChangePassword(user) {
    const schema = {
        oldPassword: Joi.string().min(1).max(200).required(),
        newPassword: Joi.string().min(1).max(200).required(),
        confirmNewPassword: Joi.any().valid(Joi.ref('newPassword')).required().options({ language: { any: { allowOnly: 'must match newPassword' } } })
    };
    return Joi.validate(user, schema);
}

function validateResetPassword(user) {
    const schema = {
        newPassword: Joi.string().min(6).max(200).required(),
        confirmNewPassword: Joi.string().min(6).max(200).required()
    };
    return Joi.validate(user, schema);
}

function validateRefreshToken(user) {
    const schema = {
        refreshToken: Joi.string().min(32).max(1000).required()
    };
    return Joi.validate(user, schema);
}


module.exports.User = User;
module.exports.UserAudit = UserAudit;
module.exports.validateUserPost = validateUserPost;
module.exports.validateUserPostByAdmin = validateUserPostByAdmin;
module.exports.validateUserPut = validateUserPut;
module.exports.validateEmail = validateEmail;
module.exports.validateUserLogin = validateUserLogin;
module.exports.validateChangePassword = validateChangePassword;
module.exports.validateResetPassword = validateResetPassword;
module.exports.validateRefreshToken = validateRefreshToken;