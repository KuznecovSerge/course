'use strict';
module.exports = (sequelize, DataTypes) => {
  const skills = sequelize.define('skills', {
    description: DataTypes.STRING
  }, {
    freezeTableName: true
  });
  skills.associate = function (models) {
    skills.belongsToMany(models.product, {
      through: 'product_skills',
      as: 'skills',
      foreignKey: 'skillsId',
      otherKey: 'productId'
    });
  };
  return skills;
};