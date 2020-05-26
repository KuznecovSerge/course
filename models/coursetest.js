'use strict';
module.exports = (sequelize, DataTypes) => {
  const course_test = sequelize.define('course_test', {
    description: DataTypes.STRING,
    questionsDisplayed: DataTypes.INTEGER,
    percentForSuccess: DataTypes.INTEGER,
    certificatIsSuccess: DataTypes.BOOLEAN
  }, {
    freezeTableName: true
  });
  course_test.associate = function(models) {
    course_test.hasOne(models.course_task, {
      foreignKey: 'materialId',
      constraints: false,
      as: 'task'
    });
    course_test.hasMany(models.course_test_question, {
      foreignKey: 'testId',
      as: 'questions'
    });
  };
  return course_test;
};
