"use strict";
module.exports = (sequelize, DataTypes) => {
  const users = sequelize.define(
    "users",
    {
      firstName: DataTypes.STRING,
      lastName: DataTypes.STRING,
      login: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      role: DataTypes.STRING,
      descriptionAuthor: DataTypes.TEXT,
      token: DataTypes.TEXT,
      active: DataTypes.BOOLEAN,
      avatar: {
        type: DataTypes.STRING,
        get: function() {
          const avatar = this.getDataValue("avatar");
          const userId = this.getDataValue("id");
          if (!userId) { return `please, include 'id' field in attributes`}
          // картинка есть, и не начинается на 'http'
          if ( avatar && (avatar.indexOf('http') != 0) ) {
            return `${global.FileStorage.clientPath}/avatar/${userId}.png?${new Date().getTime()}`;
          }
          return avatar;
        }
      },
      phone: DataTypes.STRING,
      timeZone: DataTypes.STRING,
      authorAbout: DataTypes.TEXT,
      authorSocial: {
        type: DataTypes.TEXT,
        get: function() {
          try {
            let social = JSON.parse(this.getDataValue("authorSocial"));
            if (!Array.isArray(social)) social = [];  
            return social;
          } catch (e) {
            return [];
          }
        },
        set: function(value) {
          return this.setDataValue("authorSocial", JSON.stringify(value));
        }
      } // JSONTYPE не завёлся, храним JSON в TEXT
    },
    {}
  );
  users.associate = function(models) {
    users.hasMany(models.product, {
      foreignKey: "authorId",
      sourceKey: "id",
      as: "products"
    });
    users.belongsTo(models.users_data, {
      foreignKey: "id",
      targetKey: "userId",
      as: "userdata"
    });
    users.hasMany(models.comments, {
      as: "comments",
      foreignKey: "referenceId",
      sourceKey: "id"
    });
    users.hasMany(models.favorites, {
      as: "favorites",
      foreignKey: "userId",
      sourceKey: "id"
    });
    users.belongsToMany(models.tags, {
      through: "user_tags",
      as: "tags",
      foreignKey: "userId",
      otherKey: "tagsId"
    });
    users.hasMany(models.basket, {
      foreignKey: "userId",
      sourceKey: "id",
      as: "baskets"
    });
    users.hasMany(models.likes, {
      foreignKey: "userId",
      sourceKey: "id",
      as: "likes"
    });
  };

  return users;
};
