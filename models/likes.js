"use strict";
module.exports = (sequelize, DataTypes) => {
  const likes = sequelize.define(
    "likes",
    {
      entityId: DataTypes.INTEGER,
      referenceId: DataTypes.INTEGER,
      userId: DataTypes.INTEGER,
      isLiked: DataTypes.BOOLEAN
    },
    {}
  );
  likes.associate = function(models) {
    likes.belongsTo(models.users, {
      foreignKey: "userId",
      as: "user"
    });
  };
  return likes;
};
