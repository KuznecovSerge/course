'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      
      await queryInterface.createTable("course_unit", {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        courseId: {
          type: Sequelize.INTEGER,
          references: {
            model: "course",
            key: "id"
          }
        },
        key: {
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

      await queryInterface.createTable("course_task", {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        unitId: {
          type: Sequelize.INTEGER,
          references: {
            model: "course_unit",
            key: "id"
          }
        },
        key: {
          type: Sequelize.INTEGER
        },
        name: {
          type: Sequelize.STRING
        },
        type: {
          type: Sequelize.STRING(10)
        },
        materialId: {
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
      });

      await queryInterface.createTable("course_lection", {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        description: {
          type: Sequelize.TEXT
        },
        video: {
          type: Sequelize.TEXT
        },
        attachment: {
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
      });

      await queryInterface.createTable("course_homework", {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        description: {
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
      });

      await queryInterface.renameTable('tests', 'course_test');
      await queryInterface.renameTable('tests_questions', 'course_test_question');

      await queryInterface.removeColumn('course_test', 'name');

      await queryInterface.addColumn(
        'course_test_question',
        'testId',
        {
          type: Sequelize.INTEGER,
          references: {
            model: "course_test",
            key: "id"
          }
        }
      );

      await queryInterface.changeColumn(
        'course_test_question',
        'type',
        {
          type: Sequelize.STRING(10),
        }
      );
      await queryInterface.renameColumn('course_test_question', 'question', 'name');


      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.renameColumn('course_test_question', 'name', 'question');
      await queryInterface.removeColumn('course_test_question', 'testId');
      await queryInterface.removeColumn('course_test_question', 'type');
      await queryInterface.addColumn(
        'course_test_question',
        'type',
        {
          type: Sequelize.INTEGER,
          allowNull: true
        }
      );

      
      await queryInterface.addColumn(
        'course_test',
        'name',
        {
          type: Sequelize.STRING,
        }
      );

      await queryInterface.renameTable('course_test', 'tests');
      await queryInterface.renameTable('course_test_question', 'tests_questions');

      await queryInterface.dropTable('course_lection');
      await queryInterface.dropTable('course_homework');
      await queryInterface.dropTable('course_task');
      await queryInterface.dropTable('course_unit');

      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  }
};
