"use strict";

const { Tags } = require("../models/index");

module.exports = {
  /**
   * * Найти все теги
   */
  GetAll() {
    return Tags.findAll({
      where: {}
    });
  },

  /**
   * * Создать тег
   * @param {*} name
   */
  Create(name) {
    return Tags.create({ name });
  },

  /**
   * * Получить тег по наименованию
   * @param {*} name
   */
  GetOne(name) {
    return Tags.findOne({
      where: {
        name
      }
    });
  },

  /**
   * * Создать массив тегов
   * @param {*} tags
   */
  async CreateMany(tags, transaction) {
    if (!Array.isArray(tags)) {
      throw new Error(`tags must be array!`);
    }

    let instances = [];

    for (let index = 0; index < tags.length; index++) {
      const element = tags[index];
      let instance = await Tags.findOne({
        where: {
          name: element
        }
      });
      if (!instance) {
        instance = await Tags.create(
          {
            name: element
          },
          { transaction }
        );
      }

      if (instance) {
        instances.push(instance);
      }
    }

    return instances;
  }
};
