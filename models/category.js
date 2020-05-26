'use strict';
module.exports = (sequelize, DataTypes) => {
  const category = sequelize.define('category', {
    name: DataTypes.STRING,
    parent: {
      type: DataTypes.INTEGER
    },
    active: DataTypes.BOOLEAN
  }, {
    freezeTableName: true
  });
  category.associate = function(models) {
    category.belongsToMany(models.product, {
      through: 'product_category',
      as: 'products',
      foreignKey: 'categoryId',
      otherKey: 'productId'
    });
    category.belongsTo(models.category, {
      foreignKey: 'parent',
      as: 'root'
    });
    category.hasMany(models.category, {
      foreignKey: 'parent',
      as: 'subCategories'
    });
  };
  return category;
};