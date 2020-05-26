'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn(
        'product',
        'konsultationCount',
        {
          type: Sequelize.INTEGER
        }
      ),
      queryInterface.addColumn(
        'product',
        'previewDescription',
        {
          type: Sequelize.STRING
        }
      ),
      queryInterface.changeColumn(
        'product',
        'title',
        {
          type: Sequelize.STRING,
          allowNull: true
        }
      ),
      queryInterface.changeColumn(
        'product',
        'title',
        {
          type: Sequelize.STRING,
          allowNull: true
        }
      )

    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('product', 'konsultationCount'),
      queryInterface.removeColumn('product', 'previewDescription'),

      queryInterface.changeColumn(
        'product',
        'video',
        {
          type: Sequelize.BLOB,
          allowNull: true
        }
      ),      queryInterface.changeColumn(
        'product',
        'title',
        {
          type: Sequelize.TEXT,
          allowNull: true
        }
      )

    ]);
  }
};
