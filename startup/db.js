const winston = require("winston");
const mongoose = require("mongoose");
const config = require("config");

module.exports = function () {
  const db = config.get("db_conn");
  console.log(db)
  mongoose
    .connect(db, { useNewUrlParser: true })
    .then(() => winston.info(`Connected to ${db}...`));
};
