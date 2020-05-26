const express = require("express");
const dotenv = require("dotenv");
const { CreateApplication } = require("./RuntimeHelper");
dotenv.config();
const app = express();

const application = CreateApplication(app);
application.RegisterHelpers();
if (IsProduction()) {
  application.ServeStatic();
}
application.Init();

module.exports = app;
