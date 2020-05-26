'use strict';
module.exports = (sequelize, DataTypes) => {
  const instructor_certificates = sequelize.define('instructor_certificates', {
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: "users",
        key: "id"
      }
    },
    name: DataTypes.STRING,
    url: DataTypes.STRING,
    data: DataTypes.BLOB
  }, {});
  instructor_certificates.associate = function(models) {
    instructor_certificates.belongsTo(models.users, {
      foreignKey: 'userId',
      as: 'instructor'
    });
  };
  return instructor_certificates;
};