"use strict";
const {
  course,
  course_unit,
  course_task,
  course_homework,
  course_lection,
  course_test,
  course_test_question
} = require("../models/index");
  
module.exports = {

   /**
   * * Создать курс
   * @param {*} model
   * @param {*} transaction инстанс транзакции
   */
  async Create(model, transaction) {
    return course.create(model, 
      {
        include: [{
          model: course_unit,
          as: 'units',
          include: [
            {
              model: course_task,
              as: 'tasks',
              include: [{
                model: course_lection,
                as: 'lection'
              }, {
                model: course_homework,
                as: 'homework'
              }, {
                model: course_test,
                as: 'test',
                include: [{
                  model: course_test_question,
                  as: 'questions'
                }]
              }]
            }
          ],

        }],
        transaction
      });
  },

}