'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.createTable('entities', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        name: {
          type: Sequelize.STRING
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE
        }
      });

      await queryInterface.bulkInsert('entities', [
        {
          id: 1,
          name: 'Продукт',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);

      await queryInterface.bulkInsert('entities', [
        {
          id: 2,
          name: 'Комментарий',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);

      await queryInterface.bulkInsert('entities', [
        {
          id: 3,
          name: 'Автор',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);

      await queryInterface.bulkInsert('entities', [
        {
          id: 4,
          name: 'Блог',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);

      await queryInterface.bulkInsert('entities', [
        {
          id: 5,
          name: 'Журнал',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);

      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('entities');
  }
};