"use strict";
module.exports = (sequelize, DataTypes) => {
  const course_lection = sequelize.define(
    "course_lection",
    {
      description: DataTypes.TEXT,
      video: DataTypes.TEXT,
      attachment: DataTypes.TEXT,
    },
    {
      freezeTableName: true
    }
  );
  course_lection.associate = function(models) {
    course_lection.hasOne(models.course_task, {
      foreignKey: 'materialId',
      constraints: false,
      as: 'task'
    });
  };
  return course_lection;
};
