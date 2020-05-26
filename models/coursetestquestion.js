'use strict';
module.exports = (sequelize, DataTypes) => {
  const course_test_question = sequelize.define('course_test_question', {
    testId: {
      type: DataTypes.INTEGER,
      references: {
        model: "course_test",
        key: "id"
      }
    },
    name: DataTypes.TEXT,
    type: DataTypes.STRING(10),
    answers: {
        type: DataTypes.TEXT,
        get: function() {
          return JSON.parse(this.getDataValue("answers"));
        },
        set: function(value) {
          return this.setDataValue("answers", JSON.stringify(value));
        }
    },    // JSONTYPE не завёлся, храним JSON в TEXT
    attachment: DataTypes.STRING
  }, {
    freezeTableName: true
  });
  course_test_question.associate = function(models) {
    course_test_question.belongsTo(models.course_test, {
      foreignKey: 'testId',
      as: 'test'
    });
  };
  return course_test_question;
};
