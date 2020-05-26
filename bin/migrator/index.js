const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const env = process.env.NODE_ENV || "development";
const sourceConfig = require(__dirname + "/../../config/config.json")[
  "moneclemap"
];
const source = new Sequelize(
  sourceConfig.database,
  sourceConfig.username,
  sourceConfig.password,
  sourceConfig
);
const migratorProvider = require("./modules/index");

(async () => {
  try {
    // * Проверка установленного соединения
    await source.authenticate();

    // * Указатель на sequelize cursor
    const sourceSequelize = source.queryInterface.sequelize;

    migratorProvider(sourceSequelize, {
        skip: [
            // "productsResolver",
            // "coursesResolver",
            // "categoryResolver",
            // "usersResolver"
        ]
    });
  } catch (err) {
    console.log(err);
  }
})();
