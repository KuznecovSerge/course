'use strict';
module.exports = (sequelize, DataTypes) => {
  const seen_entities = sequelize.define('seen_entities', {
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
        model: "entities",
        key: "id"
      }
    },
    entityId: DataTypes.STRING,
    title: DataTypes.STRING
  }, {
    freezeTableName: true
  });
  seen_entities.associate = function (models) {
    seen_entities.belongsTo(models.entities, {
      foreignKey: 'entityId',
      as: 'entity'
    });
    seen_entities.belongsTo(models.users, {
      foreignKey: 'userId',
      as: 'user'
    });
  };
  return seen_entities;
};