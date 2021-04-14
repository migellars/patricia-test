const cors = require("cors");

module.exports = function (app) {
  var corsOptions = { exposedHeaders: "*" };
  app.use(cors(corsOptions));
};
