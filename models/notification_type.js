'use strict';
module.exports = (sequelize, DataTypes) => {
  const notification_type = sequelize.define('notifications_type', {
    name: DataTypes.STRING
  }, {});
  notification_type.associate = function(models) {
    // associations can be defined here
  };
  return notification_type;
};