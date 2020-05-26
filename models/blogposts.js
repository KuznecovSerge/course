'use strict';
module.exports = (sequelize, DataTypes) => {
  const blog_posts = sequelize.define('blog_posts', {
    userId: DataTypes.INTEGER,
    description: DataTypes.TEXT,
    title: DataTypes.STRING,
    mainPhoto: DataTypes.STRING,
    tags: DataTypes.STRING,
    archive: DataTypes.BOOLEAN
  }, {});
  blog_posts.associate = function(models) {
    blog_posts.belongsTo(models.users, { foreignKey: 'userId', as: 'users' });
    blog_posts.hasMany(models.comments, {
      as: "comments",
      foreignKey: "referenceId",
      sourceKey: "id"
    });
  };
  return blog_posts;
};