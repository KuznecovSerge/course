"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("like_to_journal_entries");
    await queryInterface.removeColumn("journal", "categories");
    await queryInterface.renameColumn("journal", "description", "content");
    await queryInterface.renameColumn("journal", "mainPhoto", "image");
    return Promise.resolve();
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("like_to_journal_entries", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      journalEntriesId: {
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        references: {
          model: "users",
          key: "id"
        }
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
    await queryInterface.addColumn("journal", "categories", {
      type: Sequelize.STRING
    });
    await queryInterface.renameColumn("journal", "content", "description");
    await queryInterface.renameColumn("journal", "image", "mainPhoto");

    return Promise.resolve();
  }
};
