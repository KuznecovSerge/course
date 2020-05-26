'use strict';
module.exports = (sequelize, DataTypes) => {
  const reposts_blog_posts = sequelize.define('reposts_blog_posts', {
    blogPostId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    del: DataTypes.INTEGER
  }, {});
  reposts_blog_posts.associate = function(models) {
    reposts_blog_posts.belongsTo(models.users, { foreignKey: 'userId', as: 'user' });
    reposts_blog_posts.belongsTo(models.blog_posts, { foreignKey: 'blogPostId', as: 'BlogPosts' })
  };
  return reposts_blog_posts;
};
