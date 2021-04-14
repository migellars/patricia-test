let storageDir = require("path").join(__dirname, "../storage");
let express = require("express");

module.exports = function (app) {
  console.log(storageDir);
  app.use(express.static(storageDir));
};
