'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.renameColumn('users', 'partnerAbout', 'authorAbout'),
      queryInterface.renameColumn('users', 'partnerSocial', 'authorSocial')
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.renameColumn('users', 'authorAbout', 'partnerAbout'),
      queryInterface.renameColumn('users', 'authorSocial', 'partnerSocial')      
    ]);
  }
};
