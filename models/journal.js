"use strict";
module.exports = (sequelize, DataTypes) => {
  const journal = sequelize.define(
    "journal",
    {
      content: DataTypes.TEXT,
      title: DataTypes.STRING,
      userId: DataTypes.INTEGER,
      image: DataTypes.STRING
    },
    {
      freezeTableName: true
    }
  );
  journal.associate = function(models) {
    journal.belongsTo(models.users, {
      foreignKey: "userId",
      as: "user"
    });

    journal.belongsToMany(models.tags, {
      through: "journal_tags",
      as: "tags",
      foreignKey: "journalId",
      otherKey: "tagsId"
    });

    journal.hasMany(models.comments, {
      as: "comments",
      foreignKey: "referenceId",
      sourceKey: "id"
    });
  };
  return journal;
};
