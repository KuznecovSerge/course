"use strict";
module.exports = (sequelize, DataTypes) => {
  const users_data = sequelize.define(
    "users_data",
    {
      userId: {
        type: DataTypes.INTEGER
      },
      vk_user_id: {
        type: DataTypes.STRING
      },
      tg_chat_id: {
        type: DataTypes.STRING
      }
    },
    {}
  );
  users_data.associate = function(models) {
  };
  return users_data;
};
