'use strict';
// FULL TEXT SEARCH for Product
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('fts', {
      productId: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.INTEGER,
        references: {
          model: "product",
          key: "id"
        }
      },
      findstr: {
        type: Sequelize.TEXT
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      }
    });

    await queryInterface.sequelize.query(`
      insert into fts (productId, findstr)
        select product.id as productId, CONCAT(title, ' ', users.firstName, ' ', users.lastName) as findstr 
          from product inner join users on product.authorId = users.id
    `);

    return Promise.resolve();
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('fts');
  }
};