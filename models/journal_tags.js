'use strict';
module.exports = (sequelize, DataTypes) => {
  const journal_tags = sequelize.define('journal_tags', {
    journalId: DataTypes.INTEGER,
    tagsId: DataTypes.INTEGER
  }, {});
  journal_tags.associate = function(models) {
    journal_tags.belongsTo(models.tags, {
      foreignKey: "tagsId",
      as: "tag"
    });
  };
  return journal_tags;
};