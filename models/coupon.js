'use strict';
module.exports = (sequelize, DataTypes) => {
  const coupon = sequelize.define('coupon', {
    productId: DataTypes.INTEGER,
    code: DataTypes.STRING,
    percent: DataTypes.INTEGER,
    dateEnd: DataTypes.DATE
  }, {});
  coupon.associate = function(models) {
    // associations can be defined here
  };
  return coupon;
};