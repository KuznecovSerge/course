'use strict';
module.exports = (sequelize, DataTypes) => {
  const subscribed_users_to_tags = sequelize.define('subscribed_users_to_tags', {
    userId: DataTypes.INTEGER,
    tagName: DataTypes.STRING,
    del: DataTypes.INTEGER
  }, {});
  subscribed_users_to_tags.associate = function(models) {
    subscribed_users_to_tags.belongsTo(models.users, { foreignKey: 'userId', as: 'user' });
  };
  return subscribed_users_to_tags;
};