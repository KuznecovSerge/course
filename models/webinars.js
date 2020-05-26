'use strict';
module.exports = (sequelize, DataTypes) => {
  const webinars = sequelize.define('webinars', {
    productId: DataTypes.INTEGER,
    link: DataTypes.TEXT,
    comment: DataTypes.TEXT,
    homework: DataTypes.TEXT,
    homeworkEmail: DataTypes.STRING
  }, {});
  webinars.associate = function(models) {
    // associations can be defined here
  };
  return webinars;
};