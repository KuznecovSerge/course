'use strict';
module.exports = (sequelize, DataTypes) => {
  const books = sequelize.define('books', {
    description: DataTypes.TEXT
  }, {});
  books.associate = function(models) {
    books.belongsToMany(models.attachment, {
      through: "attachments_to",
      as: "attachments",
      foreignKey: "referenceId",
      otherKey: "attachmentId"
    });
    books.hasMany(models.attachment_to, {
      as: "attachment_ids",
      foreignKey: "referenceId",
    });
  };
  return books;
};