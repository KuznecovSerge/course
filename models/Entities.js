'use strict';
module.exports = (sequelize, DataTypes) => {
  const entities = sequelize.define('entities', {
    name: DataTypes.STRING
  }, {
    freezeTableName: true
  });
  entities.associate = function(models) {
    // associations can be defined here
  };
  return entities;
};