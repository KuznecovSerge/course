"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const pid = await queryInterface.sequelize.query(
      "CREATE INDEX product_category_productId_index ON product_category (productId) USING BTREE;"
    );
    const cid = await queryInterface.sequelize.query(
      "CREATE INDEX product_category_categoryId_index ON product_category (categoryId) USING BTREE;"
    );

    return Promise.resolve();
  },

  down: async (queryInterface, Sequelize) => {
    const pid = await queryInterface.sequelize.query(
      "drop index product_category_productId_index on product_category;"
    );

    const cid = await queryInterface.sequelize.query(
      "drop index product_category_categoryId_index on product_category;"
    );

    return Promise.resolve();
  }
};
