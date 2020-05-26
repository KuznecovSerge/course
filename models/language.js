'use strict';
module.exports = (sequelize, DataTypes) => {
  const language = sequelize.define('language', {
    name: DataTypes.STRING
  }, {
    freezeTableName: true
  });
  language.associate = function(models) {
    // associations can be defined here
  };
  return language;
};