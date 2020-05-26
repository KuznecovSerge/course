'use strict';
module.exports = (sequelize, DataTypes) => {
  const subscribing_user_to_authors_blog = sequelize.define('subscribing_user_to_authors_blog', {
    userId: DataTypes.INTEGER,
    authorId: DataTypes.INTEGER,
    del: DataTypes.INTEGER
  }, {
    freezeTableName: true
  });
  subscribing_user_to_authors_blog.associate = function (models) {
    subscribing_user_to_authors_blog.belongsTo(models.users, { foreignKey: 'userId', as: 'user' });
    subscribing_user_to_authors_blog.belongsTo(models.users, { foreignKey: 'authorId', as: 'author' });
  };
  return subscribing_user_to_authors_blog;
};