'use strict';
module.exports = (sequelize, DataTypes) => {
  const like_blog_posts = sequelize.define('like_blog_posts', {
    blogPostId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    authorId: DataTypes.INTEGER,
    del: DataTypes.INTEGER
  }, {});
  like_blog_posts.associate = function(models) {
    like_blog_posts.belongsTo(models.users, { foreignKey: 'userId', as: 'user' });
    like_blog_posts.belongsTo(models.users, { foreignKey: 'authorId', as: 'author' });
    like_blog_posts.belongsTo(models.blog_posts, { foreignKey: 'blogPostId', as: 'BlogPosts' })
  };
  return like_blog_posts;
};