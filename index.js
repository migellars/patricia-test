const winston = require("winston");
const express = require("express");
const config = require("config");
const cookieParser = require("cookie-parser");
const app = express();

// app use
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

require("./startup/logging")();
require("./startup/logger");
require("./startup/cors")(app);
require("./startup/routes")(app);
require("./startup/db")();
require("./startup/config")();
require("./startup/validation")();
require("./startup/seed")();
require("./startup/static")(app);

// listening port
const port = process.env.PORT || config.get("port");
const server = app.listen(port, () =>
  winston.info(`Listening on port ${port}...`),
);

module.exports = server;
