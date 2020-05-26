'use strict';
module.exports = (sequelize, DataTypes) => {
  const course = sequelize.define('course', {
    name: DataTypes.STRING,
    authorId: {
      type: DataTypes.INTEGER,
      references: {
        model: "users",
        key: "id"
      }
    },
    description: DataTypes.TEXT,
    image: DataTypes.TEXT,
    video: DataTypes.BLOB,
    parent: {
      type: DataTypes.INTEGER
    }
  }, {
    freezeTableName: true
  });
  course.associate = function (models) {
    course.belongsTo(models.users, {
      foreignKey: 'authorId',
      as: 'author'
    });
    course.belongsTo(models.course, {
      foreignKey: 'parent',
      as: 'root'
    });
    course.belongsToMany(models.product, {
      through: 'product_course',
      as: 'products',
      foreignKey: 'courseId',
      otherKey: 'productId'
    });
    course.hasMany(models.course_unit, {
      foreignKey: 'courseId',
      as: 'units'
    });
    course.belongsToMany(models.instructor_certificates, {
      through: 'course_instructor_certificates',
      as: 'instructorcertificates',
      foreignKey: 'courseId',
      otherKey: 'instructorcertificatesId'
    });
  };
  return course;
};
