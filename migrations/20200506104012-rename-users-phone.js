'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.renameColumn('users', 'numberPhone', 'phone')
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.renameColumn('users', 'phone', 'numberPhone')
  }
};
