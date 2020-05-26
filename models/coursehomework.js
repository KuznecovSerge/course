'use strict';
module.exports = (sequelize, DataTypes) => {
  const course_homework = sequelize.define('course_homework', {
    description: DataTypes.TEXT,
  }, {
    freezeTableName: true
  });
  course_homework.associate = function (models) {
    course_homework.hasOne(models.course_task, {
      foreignKey: 'materialId',
      as: 'task'
    });
  };
  return course_homework;
};
