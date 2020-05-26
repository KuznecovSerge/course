'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'likes',
      'isLiked',
      {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull : false
      }
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropColumn('likes', 'isLiked');
  }
};
