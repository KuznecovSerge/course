'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
       queryInterface.createTable('notifications', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        entityId: {
          type: Sequelize.INTEGER
        },
        referenceId: {
          type: Sequelize.INTEGER
        },
        typeId: {
          type: Sequelize.INTEGER,
          model: 'notifications_type',
          key: 'id'
        },
        userId: {
          type: Sequelize.INTEGER,
          references: {
            model: 'users',
            key: 'id'
          }
        },
        read: {
          type: Sequelize.BOOLEAN,
          defaultValue: 0
        },
        message: {
          type: Sequelize.TEXT
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE
        }
      }),
    ]),
    queryInterface.dropTable('notification_new_goods'),
    queryInterface.dropTable('notification_new_journal'),
    queryInterface.dropTable('notifications_users_new_blog')
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('notifications');
  }
};