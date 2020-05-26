'use strict';
module.exports = (sequelize, DataTypes) => {
  const course_task = sequelize.define('course_task', {
    unitId: {
      type: DataTypes.INTEGER,
      references: {
        model: "course_unit",
        key: "id"
      }
    },
    key: DataTypes.INTEGER,
    type: DataTypes.STRING(10),
    name: DataTypes.STRING,
    required: DataTypes.BOOLEAN,
    materialId: DataTypes.INTEGER
  }, {
    freezeTableName: true
  });
  course_task.associate = function (models) {
    course_task.belongsTo(models.course_unit, {
      foreignKey: 'unitId',
      as: 'task'
    });
    course_task.belongsTo(models.course_lection, {
      foreignKey: 'materialId',
      constraints: false,
      as: 'lection'
    });
    course_task.belongsTo(models.course_homework, {
      foreignKey: 'materialId',
      constraints: false,
      as: 'homework'
    });
    course_task.belongsTo(models.course_test, {
      foreignKey: 'materialId',
      constraints: false,
      as: 'test'
    });

  };
  return course_task;
};
