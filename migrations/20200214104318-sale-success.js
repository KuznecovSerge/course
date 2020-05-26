"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("sale", "status", {
      type: Sequelize.STRING
    });

    await queryInterface.addColumn("sale", "parent", {
      type: Sequelize.STRING
    });

    return Promise.resolve();
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("sale", "status");
    await queryInterface.removeColumn("sale", "parent");

    return Promise.resolve();
  }
};
