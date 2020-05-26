"use strict";
module.exports = (sequelize, DataTypes) => {
  const sale = sequelize.define(
    "sale",
    {
      userId: DataTypes.INTEGER,
      discount: DataTypes.INTEGER,
      amount: DataTypes.STRING,
      status: {
        type: DataTypes.STRING,
        defaultValue: "pending"
      },
      parent: DataTypes.INTEGER
    },
    {
      freezeTableName: true
    }
  );
  sale.associate = function(models) {
    sale.belongsTo(models.users, {
      foreignKey: "userId",
      as: "user"
    });

    sale.hasMany(models.sale_item, {
      foreignKey: "saleId",
      sourceKey: "id",
      as: "saleItems"
    });
  };
  return sale;
};
