'use strict';
module.exports = (sequelize, DataTypes) => {
  const attachment = sequelize.define('attachment', {
    fileName: DataTypes.STRING,
    originalFileName: DataTypes.STRING,
    userId: DataTypes.INTEGER,
    type: DataTypes.STRING(16),
  }, {});
  attachment.associate = function(models) {
    // associations can be defined here
  };
  return attachment;
};