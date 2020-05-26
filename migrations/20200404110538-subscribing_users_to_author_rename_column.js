'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.renameColumn('subscribing_user_to_author', 'usersId', 'userId');
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.renameColumn('subscribing_user_to_author', 'userId', 'usersId');
  }
};
