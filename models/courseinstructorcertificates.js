'use strict';
module.exports = (sequelize, DataTypes) => {
  const course_instructor_certificates = sequelize.define('course_instructor_certificates', {
    courseId: DataTypes.INTEGER,
    instructorcertificatesId: DataTypes.INTEGER
  }, {});
  course_instructor_certificates.associate = function(models) {
    // associations can be defined here
  };
  return course_instructor_certificates;
};