"use strict";

const { favorites } = require("../models/index");

/**
 * * Сервис работы с избранным
 */
module.exports = {
  /**
   * * Добавить или удалить из избранного
   * @param {Модель для сохранения} model
   */
  async addOrDestroy(userId, typeId, entityId) {
    const qItem = await favorites.findOne({
      where: {
        userId,
        entityId,
      },
    });

    if (!qItem) {
      const item = await favorites.create({
        userId,
        typeId,
        entityId,
      });
      return item;
    }
    await qItem.destroy();

    return null;
  },

  /**
   * * Получить список избранного пользователя
   * @param {*} userId Идентификатор пользователя
   */
  async getAll(userId) {
    return await favorites.findAll({
      where: {
        userId,
      }
    });
  },
};
