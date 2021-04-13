const Joi = require("joi");
const mongoose = require("mongoose");

const apiLogSchema = new mongoose.Schema(
  {
    method: String,
    userId: String,
    url: String,
    email: String,
    role: Object,
    subRole: String,
    body: Object,
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

const ApiLog = mongoose.model("apiLog", apiLogSchema);

module.exports.ApiLog = ApiLog;
