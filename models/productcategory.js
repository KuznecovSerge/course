"use strict";
module.exports = (sequelize, DataTypes) => {
  const product_category = sequelize.define(
    "product_category",
    {
      productId: DataTypes.INTEGER,
      categoryId: DataTypes.INTEGER,
      quantity: DataTypes.DECIMAL
    },
    {
      freezeTableName: true,
      indexes: [
        {
          name: "product_category_productId_index",
          using: "BTREE",
          fields: [
            'productId'
          ]
        }
      ]
    }
  );
  product_category.associate = function(models) {
    product_category.belongsTo(models.category, {
      foreignKey: "categoryId",
      as: "categoryItem"
    });
  };
  return product_category;
};
