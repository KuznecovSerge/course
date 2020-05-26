"use strict";
module.exports = (sequelize, DataTypes) => {
  const comments = sequelize.define(
    "comments",
    {
      entityId: DataTypes.INTEGER,
      referenceId: DataTypes.INTEGER,
      userId: DataTypes.INTEGER,
      comment: DataTypes.STRING,
      parent: DataTypes.INTEGER,
      read: DataTypes.BOOLEAN
    },
    {
      freezeTableName: true
    }
  );
  comments.associate = function(models) {
    comments.belongsTo(models.entities, {
      foreignKey: "entityId",
      as: "entity"
    });

    comments.belongsTo(models.users, {
      foreignKey: "userId",
      as: "user"
    });

    comments.belongsTo(models.comments, {
      foreignKey: "parent",
      as: "parentcomment"
    });
  };
  return comments;
};
