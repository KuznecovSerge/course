"use strict";

const {
  sale,
  sale_item,
  product_user_access,
  users,
  sale_interkassa,
  product
} = require("../models/index");
const db = require("../models/index");
const Op = require("sequelize").Op;

/**
 * * Сервис работы с жалобами
 */
module.exports = {

  /**
   * * Регистрация продажи в системе InterKassa
   * @param {*} model
   */
  RegisterInterkassaSale(model) {
    return sale_interkassa.create(model);
  },

  /**
   * * Зарегистрировать продажу
   * @param {Модель для сохранения} model
   */
  async CreateSale(model) {
    const transaction = await db.sequelize.transaction();

    try {
      const _sale = await sale.create(model, { transaction });
      const items = model.items.map(i => {
        i.saleId = Number(_sale.id);
        return i;
      });
      for (let index = 0; index < items.length; index++) {
        const element = items[index];
        await sale_item.create(element, { transaction });
      }

      await transaction.commit();

      return _sale;
    } catch (error) {
      await transaction.rollback();
    }
  },

  /**
   * * Получить проданные продукты по владельцу
   * @param {*} ownerId
   */
  async GetSold(ownerId) {
    return sale_item.findAll({
      include: [
        {
          model: product,
          as: "product",
          where: {
            authorId: ownerId
          }
        },
        {
          model: sale,
          as: "sale",
          required: true,
          include: [
            {
              model: users,
              as: "user",
              attributes: ["id", "firstName", "lastName", "email"],
              required: true
            }
          ]
        }
      ]
    });
  },

  /**
   * * Найти продажу по уникальному идентификатору
   * @param {*} saleId
   */
  async GetById(saleId) {
    return sale.findOne({
      where: {
        id: saleId
      }
    });
  },

  /**
   * * Создать запись о продаже
   * @param {*} model
   */
  async Create(model) {
    return sale.create(model);
  },

  /**
   * * Получить список купленных товаров пользователя
   * @param {*} userId
   */
  async Get(userId) {
    const sales = await sale.findAll({
      where: {
        userId: userId
      },
      include: [
        {
          model: sale_item,
          as: "saleItems"
        }
      ]
    });
    return product.findAll({
      where: {
        id: {
          [Op.in]: sales.reduce((acc, next) => {
            const items = next.saleItems.map(s => s.productId);
            items.forEach(i => {
              if (!acc.includes(i)) {
                acc.push(i);
              }
            });

            return acc;
          }, [])
        }
      },
      include: [
        {
          model: users,
          as: "author",
          attributes: ["id", "firstName", "lastName", "email"]
        }
      ]
    });
  },

  /**
   * * Получить список популярных проданных товаров
   */
  async GetSoldFavorite() {
    return sale_item.findAll({
      attributes: [
        "productId",
        [db.sequelize.fn("count", db.sequelize.col("productId")), "count"]
      ],
      include: [
        {
          model: product,
          as: "product",
          attributes: ["id", "title"]
        }
      ],
      group: ["productId"],
      order: [["count", "DESC"]],
      limit: 20
    });
  },

  /**
   * * Получить количество продаж по товарам
   */
  async GetCountSales(productIds) {
    return sale_item.findAll({
      attributes: [
        "productId",
        [db.sequelize.fn("count", db.sequelize.col("productId")), "count"],
        [db.sequelize.literal(`(SELECT MAX(createdAt) FROM sale_item s WHERE s.productId=sale_item.productId)`), 'last'],
        [db.sequelize.literal(`(select group_concat(distinct(userId)) from sale_item si inner join sale s on si.saleId = s.id)`), 'students']
      ],
      group: ["productId"],
      where: {
        productId: productIds
      },
      raw: true
    });
  }

}

