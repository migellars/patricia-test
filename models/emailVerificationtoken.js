const mongoose = require("mongoose");
const config = require("config");

const TokenSchema = new mongoose.Schema(
  {
    _userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    token: { type: String, required: true },
    createdAt: {
      type: Date,
      required: true,
      default: Date.now,
      expires: 43200,
    },
  },
  { timestamps: true },
);

const Token = mongoose.model("Token", TokenSchema);

module.exports.Token = Token;
