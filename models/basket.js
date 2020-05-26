"use strict";
module.exports = (sequelize, DataTypes) => {
  const basket = sequelize.define(
    "basket",
    {
      productId: {
        type: DataTypes.INTEGER,
        references: {
          model: "product",
          key: "id"
        }
      },
      userId: {
        type: DataTypes.INTEGER,
        references: {
          model: "users",
          key: "id"
        }
      }
    },
    {}
  );
  basket.associate = function(models) {
    basket.belongsTo(models.product, {
      foreignKey: "productId",
      as: "product"
    });
  };
  return basket;
};
