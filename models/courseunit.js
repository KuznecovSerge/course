'use strict';
module.exports = (sequelize, DataTypes) => {
  const course_unit = sequelize.define('course_unit', {
    courseId: {
      type: DataTypes.INTEGER,
      references: {
        model: "course",
        key: "id"
      }
    },
    key: DataTypes.INTEGER,
    name: DataTypes.STRING,
  }, {
    freezeTableName: true
  });
  course_unit.associate = function (models) {
    course_unit.belongsTo(models.course, {
      foreignKey: 'courseId',
      as: 'course'
    });
    course_unit.hasMany(models.course_task, {
      foreignKey: 'unitId',
      as: 'tasks'
    });
  };
  return course_unit;
};
