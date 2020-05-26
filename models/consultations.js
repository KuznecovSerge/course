'use strict';
module.exports = (sequelize, DataTypes) => {
  const consultations = sequelize.define('consultations', {
    productId: DataTypes.INTEGER,
    description: DataTypes.TEXT,
    homework: DataTypes.TEXT,
    homeworkEmail: DataTypes.STRING
  }, {});
  consultations.associate = function(models) {
    // associations can be defined here
  };
  return consultations;
};