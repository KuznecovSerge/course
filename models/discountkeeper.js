'use strict';
module.exports = (sequelize, DataTypes) => {
  const discountkeeper = sequelize.define('discountkeeper', {
    discountTypeId: {
      type: DataTypes.INTEGER,
      references: {
        model: "discounttype",
        key: "id"
      }
    },
    code: DataTypes.STRING,
    percent: DataTypes.DECIMAL,
    amount: DataTypes.DECIMAL
  }, {
    freezeTableName: true
  });
  discountkeeper.associate = function(models) {
    discountkeeper.belongsTo(models.discounttype, {
      foreignKey: 'discountTypeId',
      as: 'discountType'
    });
  };
  return discountkeeper;
};