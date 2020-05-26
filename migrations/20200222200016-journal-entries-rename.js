"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameTable("journal_entries", "journal");
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameTable("journal", "journal_entries");
  }
};
