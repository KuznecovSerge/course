'use strict';
module.exports = (sequelize, DataTypes) => {
  const product_skills = sequelize.define('product_skills', {
    productId: DataTypes.INTEGER,
    skillsId: DataTypes.INTEGER
  }, {
    freezeTableName: true
  });
  product_skills.associate = function(models) {
    // associations can be defined here
  };
  return product_skills;
};