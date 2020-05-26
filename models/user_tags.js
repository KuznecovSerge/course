'use strict';
module.exports = (sequelize, DataTypes) => {
  const user_tags = sequelize.define('user_tags', {
    userId: DataTypes.INTEGER,
    tagsId: DataTypes.INTEGER
  }, {});
  user_tags.associate = function(models) {
    // associations can be defined here
  };
  return user_tags;
};