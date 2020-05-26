'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
      return Promise.all([
      queryInterface.addColumn(
        'users',
        'partnerAbout',
        {
          type: Sequelize.TEXT
        }
      ),
      queryInterface.addColumn(
        'users',
        'partnerSocial',
        {
          type: Sequelize.TEXT
        }
      ),
    ]);
  },

  down: (queryInterface, Sequelize) => {
      return Promise.all([
      queryInterface.removeColumn('users', 'partnerAbout'),
      queryInterface.removeColumn('users', 'partnerSocial')
    ]);
  }
};
