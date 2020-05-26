'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([ 
      queryInterface.createTable('attachments_to', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        attachmentId: {
          type: Sequelize.INTEGER
        },
        entityId: {
          type: Sequelize.INTEGER,
          references: {
            model: "entities",
            key: "id"
          }
        },
        referenceId: {
          type: Sequelize.INTEGER
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
      queryInterface.sequelize.query("insert into entities (id, name, createdAt, updatedAt) values (6, 'Курс', now(), now())"),
      queryInterface.sequelize.query("insert into entities (id, name, createdAt, updatedAt) values (7, 'Урок', now(), now())"),
      queryInterface.sequelize.query("insert into entities (id, name, createdAt, updatedAt) values (8, 'Вебинар', now(), now())"),
      queryInterface.sequelize.query("insert into entities (id, name, createdAt, updatedAt) values (9, 'Консультация', now(), now())"),
      queryInterface.sequelize.query("insert into entities (id, name, createdAt, updatedAt) values (10, 'Книга', now(), now())"),
    ]);
  },
  down: (queryInterface, Sequelize) => {
    return Promise.all([  
      queryInterface.dropTable('attachments_to'),
      queryInterface.sequelize.query("delete from entities where id>=6 and id<=10"),
    ]);
  }
};