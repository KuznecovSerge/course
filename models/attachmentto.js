'use strict';
module.exports = (sequelize, DataTypes) => {
  const attachment_to = sequelize.define('attachment_to', {
    attachmentId: DataTypes.INTEGER,
    entityId: {
      type: DataTypes.INTEGER,
      references: {
        model: "entities",
        key: "id"
      }
    },
    referenceId: DataTypes.INTEGER
  }, {
    tableName: 'attachments_to'
  });
  attachment_to.associate = function(models) {
    attachment_to.belongsTo(models.entities, {
      foreignKey: "entityId",
      as: "entity"
    });
  };
  return attachment_to;
};