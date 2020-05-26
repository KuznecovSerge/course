"use strict";
module.exports = (sequelize, DataTypes) => {
  const product_user_access = sequelize.define(
    "product_user_access",
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
    {
      freezeTableName: true
    }
  );
  product_user_access.associate = function(models) {
    // associations can be defined here
  };
  return product_user_access;
};
