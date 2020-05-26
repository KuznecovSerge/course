"use strict";

const { Journal, Journal_tags, Tags } = require("../models/index");
const CommentsService = require("./CommentsService");
const Op = require("sequelize").Op;
const db = require("../models/index");
const Sequelize = require("sequelize");

module.exports = {
  defaultOptions: {
    like: false,
  },

  /**
   * * Получить список тегов с учетом пагинации
   * @param {*} limit
   * @param {*} offset
   */
  GetTags(limit, offset) {
    return Journal_tags.findAll({
      limit,
      offset,
      include: [
        {
          model: Tags,
          as: "tag",
        },
      ],
    });
  },

  getTagsTop() {
    return Journal_tags.findAll({
      attributes: [
        [db.sequelize.fn("count", db.sequelize.col("tagsId")), "count"],
      ],
      include: [
        {
          model: Tags,
          as: "tag",
          attributes: ["id", "name"],
        },
      ],
      group: ["tagsId"],
      order: db.sequelize.literal("count DESC"),
      limit: 10,
    });
  },

  /**
   * * Найти все журналы
   * @param {*} limit Лимит
   * @param {*} offset Срез
   */
  GetAll(limit, offset, direction, findstr, sort) {
    const fields = Object.keys(Journal.tableAttributes);
    const entityId = global.Entities.Journal;
    let order = null;

    if (sort && direction) {
      order = [[sort, direction]];
    } else {
      order = [["updatedAt", "DESC"]];
    }

    return new Promise(async (resolve, reject) => {
      const whereClause = {
        title: {
          [Op.like]: `%${findstr}%`,
        },
      };

      const journals = await Journal.findAll({
        order,
        where: whereClause,
        limit,
        offset,
        attributes: [
          ...fields,
          [
            // количество лайков
            Sequelize.literal(
              `(select count(isLiked) from likes where entityId=${entityId} and referenceId=journal.id)`
            ),
            "likesCount",
          ],
          [
            Sequelize.literal(
              `(select count(*) from comments where entityId=${entityId} and referenceId=journal.id)`
            ),
            "commentsCount",
          ],
        ],
        include: [
          {
            model: Tags,
            as: "tags",
            required: false,
            attributes: ["name"],
          },
        ],
      });

      const journalsCount = await Journal.count({
        where: whereClause,
      });

      resolve({
        journals,
        journalsCount,
      });
    });
  },

  /**
   * * Получить журнал по идентификатору
   * @param {*} id
   */
  GetOne(id) {
    return Journal.findOne({
      where: {
        id,
      },
      include: [
        {
          model: Tags,
          as: "tags",
          required: false,
          attributes: ["name"],
        },
      ],
    });
  },

  /**
   * * Найти журналы по тегу
   * @param {*} tag
   * @param {*} options
   */
  GetViaTag(tag, options) {
    const { like } = options ? options : this.defaultOptions;
    let query = {
      include: [
        {
          model: Tags,
          as: "tags",
          required: true,
          where: {
            name: tag,
          },
        },
      ],
    };

    if (!!like || !tag) {
      let { include } = query;
      if (include.length) {
        let includeItem = include[0];
        if (includeItem) {
          includeItem.where.name = {
            [Op.like]: `%${tag}%`,
          };

          if (!tag) {
            includeItem.required = false;
          }
        }
      }
    }

    return Journal.findAll(query);
  },

  /**
   * * Создать журнал
   * @param {*} model
   * @param {*} transaction инстанс транзакции
   */
  Create(model, transaction) {
    return Journal.create(model, { transaction });
  },

  /**
   * * Обновить журнал
   * @param {*} journalId идентификатор журнала
   * @param {*} model модель
   * @param {*} transaction инстанс транзакции
   */
  Update(journalId, model, transaction) {
    return Journal.update(model, {
      where: {
        id: journalId,
      },
      transaction,
    });
  },

  /**
   * * Сделать связи M:M с тегами
   * @param {*} journal
   * @param {*} tags
   * @param {*} transaction
   */
  async CreateAssociationWithTags(journal, tags, transaction) {
    let instances = [];
    await Journal_tags.destroy({
      where: {
        journalId: journal.id,
      },
    });

    for (let index = 0; index < tags.length; index++) {
      const element = tags[index];

      const value = await Journal_tags.findOne({
        where: {
          journalId: journal.id,
          tagsId: element.id,
        },
      });
      if (!value) {
        const instance = await Journal_tags.create(
          {
            journalId: journal.id,
            tagsId: element.id,
          },
          { w: 1, transaction }
        );

        if (instance) {
          instances.push(instance);
        }
      }
    }

    return instances;
  },
};
