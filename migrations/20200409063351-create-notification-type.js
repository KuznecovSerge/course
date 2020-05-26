'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('notifications_type', {
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
    })
    .then(()=>{
      queryInterface.bulkInsert('notifications_type', [
        {
          id: 1,
          name: 'Добавлен новый {entity}',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 2,
          name: 'Отправлено письмо автору',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 3,
          name: 'Подписался на {entity}',
          createdAt: new Date(),
          updatedAt: new Date()
        }

      ])
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('notifications_type');
  }
};