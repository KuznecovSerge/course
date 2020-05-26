"use strict";
module.exports = (sequelize, DataTypes) => {
  const subscribing_user_to_author = sequelize.define(
    "subscribing_user_to_author",
    {
      userId: {
        type: DataTypes.INTEGER,
        references: {
          model: "users",
          key: "id"
        }
      },
      authorId: {
        type: DataTypes.INTEGER,
        references: {
          model: "users",
          key: "id"
        }
      }
    },
    {
      freezeTableName: true
    }
  );
  subscribing_user_to_author.associate = function(models) {
    subscribing_user_to_author.belongsTo(models.users, {
      foreignKey: "authorId",
      as: "author"
    });
  };
  return subscribing_user_to_author;
};
