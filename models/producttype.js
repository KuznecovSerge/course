'use strict';
module.exports = (sequelize, DataTypes) => {
  const product_type = sequelize.define('product_type', {
    name: DataTypes.STRING,
    active: DataTypes.BOOLEAN
  }, {
    freezeTableName: true
  });
  product_type.associate = function(models) {
    // associations can be defined here
  };
  return product_type;
};