"use strict";

const { Basket, Product } = require("../models/index");
const Op = require("sequelize").Op;

/**
 * * Сервис работы с корзиной
 */
module.exports = {

  /**
   * * Добавить элемент в корзину
   * @param {*} userId Пользователь
   * @param {*} productId Идентификатор продукта
   */
  async AddBasketItem(userId, productId) {
    return Basket.findOrCreate({
      where: {
        userId,
        productId
      }
    });
  },

  /**
   * * Удалить элемент\ы из корзины
   * ! При передаче массива элементов productId будет удаляться весь массив продуков корзины
   * @param {*} userId
   * @param {*} productId
   */
  async RemoveBasketItem(userId, productId) {
    return Basket.destroy({
      where: {
        userId,
        productId: {
          [Array.isArray(productId) ? Op.in : Op.eq]: productId
        }
      }
    });
  },

  /**
   * * Очистить корзину пользователя
   * @param {*} userId 
   */
  async ClearAll(userId) {
    return Basket.destroy({
      where: {
        userId
      }
    });
  },

  /**
   * * Получить корзину пользователя
   * @param {*} userId
   */
  async GetBasket(userId) {
    return Basket.findAll({
      where: {
        userId
      },
      include: [
        {
          model: Product,
          as: "product"
        }
      ]
    });
  }
}
