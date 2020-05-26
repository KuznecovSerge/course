'use strict';
module.exports = (sequelize, DataTypes) => {
  const discountblock = sequelize.define('discountblock', {
    discountKeeperId: {
      type: DataTypes.INTEGER,
      references: {
        model: "discountkeeper",
        key: "id"
      }
    },
    begin: DataTypes.DATE,
    end: DataTypes.DATE
  }, {
    freezeTableName: true
  });
  discountblock.associate = function(models) {
    discountblock.belongsTo(models.discountkeeper, {
      foreignKey: 'discountKeeperId',
      as: 'discountKeeper'
    });
  };
  return discountblock;
};