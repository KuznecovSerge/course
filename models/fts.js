'use strict';
module.exports = (sequelize, DataTypes) => {
  const fts = sequelize.define('fts', {
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: "product",
        key: "id"
      }
    },
    findstr: DataTypes.TEXT
  }, {
    freezeTableName: true,
    tableName: 'fts'
  });
  fts.associate = function(models) {
    // associations can be defined here
  };
  return fts;
};