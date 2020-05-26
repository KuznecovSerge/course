'use strict';
module.exports = (sequelize, DataTypes) => {
  const lessons = sequelize.define('lessons', {
    productId: DataTypes.INTEGER,
    video: DataTypes.TEXT,
    comment: DataTypes.TEXT,
    homework: DataTypes.TEXT,
    homeworkEmail: DataTypes.STRING
  }, {});
  lessons.associate = function(models) {
    // associations can be defined here
  };
  return lessons;
};