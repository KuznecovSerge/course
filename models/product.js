"use strict";
module.exports = (sequelize, DataTypes) => {
  const product = sequelize.define(
    "product",
    {
      entityId: {
        type: DataTypes.INTEGER,
        references: {
          model: "entities",
          key: "id"
        }
      },
      authorId: {
        type: DataTypes.INTEGER,
        references: {
          model: "users",
          key: "id"
        }
      },
      title: DataTypes.STRING,
      content: DataTypes.TEXT,
      description: DataTypes.TEXT,
      previewDescription: DataTypes.STRING,
      konsultationCount: DataTypes.INTEGER,
      ball: DataTypes.INTEGER,
      date: DataTypes.DATE,
      price: DataTypes.DECIMAL,
      image: DataTypes.TEXT,
      video: DataTypes.BLOB,
      discountAndCoupon: DataTypes.BOOLEAN,
      active: DataTypes.BOOLEAN,
    },
    {
      freezeTableName: true    }
  );
  product.associate = function(models) {
    product.hasOne(models.discount, {
      foreignKey: "productId",
      as: "discount"
    });
    product.hasOne(models.coupon, {
      foreignKey: "productId",
      as: "coupon"
    });
    product.belongsTo(models.entities, {
      foreignKey: "entityId",
      as: "entity"
    });
    product.belongsTo(models.users, {
      foreignKey: "authorId",
      as: "author"
    });
    product.belongsToMany(models.category, {
      through: "product_category",
      as: "categories",
      foreignKey: "productId",
      otherKey: "categoryId"
    });
    product.hasMany(models.product_category, {
      as: "categoryIds",
      foreignKey: "productId"
    });
    product.belongsToMany(models.category, {
      through: "product_category",
      as: "findcategories",
      foreignKey: "productId",
      otherKey: "categoryId"
    });
    product.belongsToMany(models.skills, {
      through: 'product_skills',
      as: 'skills',
      foreignKey: 'productId',
      otherKey: 'skillsId'
    });
    product.belongsToMany(models.course, {
      through: "product_course",
      as: "courses",
      foreignKey: "productId",
      otherKey: "courseId"
    });
    product.hasMany(models.comments, {
      as: "comments",
      foreignKey: "referenceId",
      sourceKey: "id"
    });
    product.belongsTo(models.favorites, {
      foreignKey: "id",
      targetKey: "entityId",
      as: "favorite"
    });
    product.hasMany(models.product_user_access, {
      sourceKey: "id",
      foreignKey: "productId",
      as: "usersAccess"
    });
    product.hasOne(models.fts, {  //full test searh
      foreignKey: "productId",
      as: "fts"
    });
  };

  // после findOne и findAll
  product.afterFind( (data, options) => {
    const addPath = (product) => {
      // картинка есть, и не начинается на 'http'
      if ( product.image && (product.image.indexOf('http') != 0) )
          product.image = global.FileStorage.clientPath + '/' + product.image;
    };

    if (Array.isArray(data)) {
      data.map( addPath );
    } else if (data) {
      addPath(data);  
    }
  });

  return product;
};
