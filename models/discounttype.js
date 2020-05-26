'use strict';
module.exports = (sequelize, DataTypes) => {
  const discounttype = sequelize.define('discounttype', {
    name: DataTypes.STRING,
    active: DataTypes.BOOLEAN
  }, {
    freezeTableName: true
  });
  discounttype.associate = function(models) {
    // associations can be defined here
  };
  return discounttype;
};