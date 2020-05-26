"use strict";

const { Likes, Rate } = require("../models/index");

module.exports = {
  /**
   * * Создать лайк
   * @param {*} entityId Тип сущности
   * @param {*} referenceId Ссылка на тип сущности
   * @param {*} userId Идентификатор пользователя
   */
  createOrUpdate(entityId, referenceId, userId, isLiked) {
    const baseModel = {
      entityId,
      referenceId,
      userId
    };

    return Likes.findOne({
      where: baseModel
    }).then(like => {
      if (like) {
        return like.update(
          {
            isLiked
          }
        );
      }
      return Likes.create({ ...baseModel, isLiked });
    });
  },

  /**
   * * Добавить оценку
   * @param {*} entityId Тип сущности
   * @param {*} referenceId Ссылка на тип сущности
   * @param {*} userId Идентификатор пользователя
   * @param {*} ball балл (1-5)
   */
  addRate(entityId, referenceId, userId, ball) {
    const baseModel = {
      entityId,
      referenceId,
      userId
    };

    return Rate.findOrCreate({
      where: baseModel,
      defaults: {
        ball
      } 
    }).then((result)=> {
      return result[0].ball
    });
  },

  /**
   * * Возвращает среднюю оценку
   * @param {*} entityId Тип сущности
   * @param {*} referenceId Ссылка на тип сущности
   */
  getRate(entityId, referenceId) {
    return Rate.aggregate('ball', 'avg', {
      where: {entityId, referenceId},
    })
  }

};
