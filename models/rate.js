'use strict';
module.exports = (sequelize, DataTypes) => {
  const rate = sequelize.define('rate', {
    entityId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'entities',
        key: 'id'
      }
    },
    referenceId: DataTypes.INTEGER,
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    ball: DataTypes.TINYINT
  }, {});
  rate.associate = function(models) {
    // associations can be defined here
  };
  return rate;
};