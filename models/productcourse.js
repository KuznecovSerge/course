'use strict';
module.exports = (sequelize, DataTypes) => {
  const product_course = sequelize.define('product_course', {
    productId: DataTypes.INTEGER,
    courseId: DataTypes.INTEGER
  }, {
    freezeTableName: true
  });
  product_course.associate = function(models) {
    // associations can be defined here
  };
  return product_course;
};