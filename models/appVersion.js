const Joi = require("joi");
const mongoose = require("mongoose");

const appVersionSchema = new mongoose.Schema(
  {
    major: Number,
    minor: Number,
    patch: Number,
    appType: {
      type: String,
      enum: ["android_partner", "android_customer", "ios_customer", "message"],
    },
    forceUpdateTitle: String,
    forceUpdateMessage: String,
    optionalUpdateTitle: String,
    optionalUpdateMessage: String,
    updateType: {
      type: String,
      enum: ["major", "minor", "patch"],
      default: "major",
    },
    showAppMaintainace: { type: Boolean, default: false },
    isStickOnScreen: { type: Boolean, default: false },
    appMaintainanceMesageTitle: String,
    appMaintainanceMesageBody: String,
    isShowImage: { type: Boolean, default: false },
    imageUrl: String,
    creationDate: {
      type: Date,
      default: () => {
        return new Date();
      },
    },
    insertDate: {
      type: Number,
      default: () => {
        return Math.round(new Date() / 1000);
      },
    },
  },
  { timestamps: true },
);

const Version = mongoose.model("version", appVersionSchema);

function validateAppVersionPost(version) {
  const schema = {
    major: Joi.number().required(),
    minor: Joi.number().required(),
    patch: Joi.number().required(),
    appType: Joi.string()
      .valid(["android_partner", "android_customer", "ios_customer", "message"])
      .required(),
    forceUpdateTitle: Joi.string().required(),
    forceUpdateMessage: Joi.string().required(),
    optionalUpdateTitle: Joi.string().required(),
    optionalUpdateMessage: Joi.string().required(),
    showAppMaintainace: Joi.boolean().required(),
    isStickOnScreen: Joi.when("showAppMaintainace", {
      is: true,
      then: Joi.boolean().required(),
      otherwise: Joi.boolean(),
    }),
    appMaintainanceMesageTitle: Joi.when("showAppMaintainace", {
      is: true,
      then: Joi.string().required(),
      otherwise: Joi.string(),
    }),
    appMaintainanceMesageBody: Joi.when("showAppMaintainace", {
      is: true,
      then: Joi.string().required(),
      otherwise: Joi.string(),
    }),
    isShowImage: Joi.when("showAppMaintainace", {
      is: true,
      then: Joi.boolean().required(),
      otherwise: Joi.boolean(),
    }),
    imageUrl: Joi.when("isShowImage", {
      is: true,
      then: Joi.string().required(),
      otherwise: Joi.string(),
    }),
    updateType: Joi.string().valid(["major", "minor", "patch"]).required(),
  };
  return Joi.validate(version, schema);
}

exports.Version = Version;
exports.validateAppVersionPost = validateAppVersionPost;
