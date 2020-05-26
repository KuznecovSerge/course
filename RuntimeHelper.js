"use strict";

const { ApplicationRuntime } = require("./core/ApplicationRuntime");
let runtimeInstance = null;

/**
 * * Инициализация runtime
 * @param {express} Express instance
 * @returns {ApplicationRuntime} Инстанс приложения
 */
const CreateApplication = (app) => {
  if (!runtimeInstance) {
    runtimeInstance = new ApplicationRuntime(app);
  }

  return runtimeInstance;
};

module.exports = {
  CreateApplication
};
