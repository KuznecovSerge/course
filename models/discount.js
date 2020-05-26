'use strict';
module.exports = (sequelize, DataTypes) => {
  const discount = sequelize.define('discount', {
    productId: DataTypes.INTEGER,
    percent: DataTypes.INTEGER,
    dateEnd: DataTypes.DATE
  }, {});
  discount.associate = function(models) {
    // associations can be defined here
  };
  return discount;
};