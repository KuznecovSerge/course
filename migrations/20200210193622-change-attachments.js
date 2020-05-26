'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.renameColumn('attachments', 'goodId', 'userId'),
      queryInterface.removeColumn('attachments', 'pathToUpload'),
      queryInterface.addColumn(
        'attachments',
        'type',
        {
          type: Sequelize.STRING(16)
        }
      ),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.renameColumn('attachments', 'userId', 'goodId'),
      queryInterface.addColumn(
        'attachments',
        'pathToUpload',
        {
          type: Sequelize.STRING
        }
      ),
      queryInterface.removeColumn('attachments', 'type')
    ]);
  }
};
