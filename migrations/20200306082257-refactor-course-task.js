'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'course_task',
      'required',
      {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull : false
      }
    );
  },

  down: (queryInterface, Sequelize) => {
    
    return queryInterface.removeColumn('course_task', 'required');
    
  }
};
