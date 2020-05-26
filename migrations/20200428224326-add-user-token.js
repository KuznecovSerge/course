'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'users',
      'token',
      {
        type: Sequelize.TEXT,
        allowNull : true
      }
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropColumn('users', 'token');
  }
};
