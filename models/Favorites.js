'use strict';
module.exports = (sequelize, DataTypes) => {
  const favorites = sequelize.define('favorites', {
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
    entityId: DataTypes.STRING
  }, {
    freezeTableName: true
  });
  favorites.associate = function (models) {
    favorites.belongsTo(models.entities, {
      foreignKey: 'entityId',
      as: 'entity'
    });
    favorites.belongsTo(models.users, {
      foreignKey: 'userId',
      as: 'user'
    });
  };
  return favorites;
};