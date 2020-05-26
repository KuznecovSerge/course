'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.renameTable('course_skills', 'product_skills');
      await queryInterface.renameColumn('product_skills', 'courseId', 'productId');

      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.renameColumn('product_skills', 'productId', 'courseId'),
      await queryInterface.renameTable('product_skills', 'course_skills')
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  }
};
