const winston = require("winston");

module.exports = function (err, req, res, next) {
  winston.error(err.message, err);

  // error
  // warn
  // info
  // verbose
  // debug
  // silly

  res
    .status(500)
    .send({
      status: false,
      message: "Something failed. Please try again in a few",
    });
};
