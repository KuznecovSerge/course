'use strict';
module.exports = (sequelize, DataTypes) => {
  const notification = sequelize.define('notification', {
    entityId: DataTypes.INTEGER,
    referenceId: DataTypes.INTEGER,
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: "users",
        key: "id"
      }
    },
    typeId: {
      type: DataTypes.INTEGER,
      references: {
        model: "notifications_type",
        key: "id"
      }
    },
    read: DataTypes.BOOLEAN,
    message: DataTypes.TEXT
  }, {});
  notification.associate = function(models) {
    // associations can be defined here
  };
  return notification;
};