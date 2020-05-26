"use strict";
module.exports = (sequelize, DataTypes) => {
  const sale_item = sequelize.define(
    "sale_item",
    {
      saleId: {
        type: DataTypes.INTEGER,
        references: {
          model: "sale",
          key: "id"
        }
      },
      productId: {
        type: DataTypes.INTEGER,
        references: {
          model: "product",
          key: "id"
        }
      },
      name: DataTypes.STRING,
      count: DataTypes.INTEGER,
      cost: DataTypes.STRING
    },
    {
      freezeTableName: true
    }
  );
  sale_item.associate = function(models) {
    sale_item.belongsTo(models.sale, {
      foreignKey: "saleId",
      as: "sale"
    });

    sale_item.belongsTo(models.product, {
      foreignKey: "productId",
      as: "product"
    });
  };
  return sale_item;
};
