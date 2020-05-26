"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query("SET FOREIGN_KEY_CHECKS = 0;");
    await queryInterface.dropTable("product_type");
    await queryInterface.renameColumn("product", "producttypeId", "entityId");
    await queryInterface.addConstraint("product", ["entityId"], {
      type: "FOREIGN KEY",
      name: "FK_entityId_product",
      references: {
        table: "entities",
        field: "id",
      },
    });
    await queryInterface.sequelize.query("ALTER TABLE product DROP FOREIGN KEY product_ibfk_1");
    await queryInterface.sequelize.query("SET FOREIGN_KEY_CHECKS = 1");

    return Promise.resolve();
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface
      .createTable(
        "product_type",
        {
          id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER,
          },
          name: {
            type: Sequelize.STRING,
          },
          active: {
            type: Sequelize.BOOLEAN,
            defaultValue: true,
          },
          createdAt: {
            allowNull: false,
            type: Sequelize.DATE,
            defaultValue: new Date(),
          },
          updatedAt: {
            allowNull: false,
            type: Sequelize.DATE,
            defaultValue: new Date(),
          },
        },
        {
          charset: "utf8",
          collate: "utf8_unicode_ci",
        }
      )
      .then(() => {
        queryInterface.sequelize.query(
          "insert into product_type (name) values('Курс'), ('Урок'), ('Вебинар'), ('Консультация')"
        );
      });
    await queryInterface.renameColumn("product", "entityId", "producttypeId");

    return Promise.resolve();
  },
};
