"use strict";
module.exports = (sequelize, DataTypes) => {
  const tags = sequelize.define(
    "tags",
    {
      name: DataTypes.STRING,
      del: DataTypes.INTEGER
    },
    {}
  );
  tags.associate = function(models) {
    tags.belongsToMany(models.journal, {
      through: "journal_tags",
      as: "tags",
      foreignKey: "tagsId",
      otherKey: "journalId"
    });
    tags.belongsToMany(models.users, {
      through: "user_tags",
      as: "users",
      foreignKey: "tagsId",
      otherKey: "userId"
    });
  };
  return tags;
};
