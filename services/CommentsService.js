"use strict";

const { comments, users, Likes } = require("../models/index");
const { createOrUpdate } = require("./LikeService");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

/**
 * * Построить дерево комментариев
 * @param {*} data
 */
const createTree = (data) => {
  const getChildren = (data, root) => {
    data.children = root.filter(i => i.parent === data.id);
  };

  for (let i = 0; i < data.length; i++) {
    let level = 0;
    const deepCalc = (level, item) => {
      if (!item.parent) {
        return level;
      }

      level++;
      const parent = data.find(i => i.id === item.parent);
      return deepCalc(level, parent);
    };
    const item = data[i];
    const deepLevel = deepCalc(level, item);
    item.deepLevel = deepLevel;
    getChildren(item, data);
  }
};

/**
 * * Отобразить в модели комментария модель лайков
 * @param {*} userId Идентификатор пользователя
 * @param {*} likes Список лайков
 * @param {*} comment Комментарий
 */
const mutateLikesWithComments = (userId, likes, comment) => {
  const commentLikes = likes.filter(like => like.referenceId === comment.id);
  const likeCount = commentLikes.filter(like => like.isLiked);
  const liked = commentLikes.find(like => like.userId === userId);

  comment.likes = likeCount.length;
  comment.dislikes = commentLikes.length - likeCount.length;
  comment.likeStatus = !!liked ? liked.isLiked : null;
}

/**
 * * Сервис работы с комментариями
 */
module.exports = {
  /**
   * * Создать комментарий
   * @param {*} userId Идентификатор пользователя
   * @param {*} entityId Идентификатор сущности 
   * @param {*} referenceId Идентификатор ссылки на сущность
   * @param {*} parent Идентификатор родителя
   * @param {*} comment Комментарий
   * @returns {*} Созданный комментарий с учетом вложенности и моделью лайков
   */
  async create(userId, entityId, referenceId, parent, comment) {
    return comments.create({
      userId,
      entityId,
      referenceId,
      parent,
      comment
    }).then(async res => {
      const comments = await this.getComments(userId, entityId, referenceId);
      const item = comments.find(comment => comment.id === res.id);
      return item;
    });
  },

  /**
   * * Получить комментарий
   * @param {*} commentId Идентификатор комментария
   * @returns {*} Комментарий с подключенной моделью лайков, без учета дерева вложенности
   * ! todo Поискать универсальный вариант с построением дерева
   */
  async getComment(commentId) {
    return comments.findOne({
      where: {
        id: commentId
      }
    }).then(async comment => {
      const commentJSON = comment.toJSON();
      const { userId } = comment;

      const likes = await Likes.findAll({
        where: {
          referenceId: comment.id,
          entityId: global.Entities.Comment
        }
      });

      mutateLikesWithComments(userId, likes, commentJSON);
      return commentJSON;
    });
  },

  /**
   * * Лайкнуть комментарий
   * @param {*} userId Идентификатор пользователя
   * @param {*} commentId Идентификатор комментария
   * @param {*} isLiked Статус лайка
   * @returns {*} Лайкнутый комментарий с обновленными статусами лайков
   */
  async likeComment(userId, commentId, isLiked) {
    const { Comment } = global.Entities;
    return createOrUpdate(Comment, commentId, userId, isLiked).then(() => {
      return this.getComment(commentId);
    });
  },

  /**
   * * Получить список сообщений
   * @param {*} userId Идентификатор пользователя
   * @param {*} entityId Идентификатор сущности
   * @param {*} referenceId Ссылка на сущность
   * @returns {*} Список комментариев с учетом вложенности комментария и подключенной моделью лайков
   */
  async getComments(userId, entityId, referenceId) {
    // аттрибуты - поля, которые вытаскиваем по комментариям
    const fields = Object.keys(comments.tableAttributes);
    return comments.findAll({
        attributes: [
          // перечисление полей (с raw вставками по-умолчанию sequelize не передаёт '*' )
          ...fields,
          [ // рейтинг
            Sequelize.literal(`(select ball from rates where referenceId=${referenceId} and userId=comments.userId and entityId=${entityId})`),
            'rate'
          ],
        ],
        where: {
          entityId,
          referenceId
        },
        include: [
          {
            model: users,
            as: "user",
            attributes: ["id", "firstName", "lastName", "avatar"]
          },
          {
            model: comments,
            as: "parentcomment",
            attributes: ["id", "parent"]
          }
        ]
      }).then(comments => {
        const commentsJSON = comments.map(comment => comment.toJSON());

        createTree(commentsJSON);
        return commentsJSON;
      }).then(async comments => {
        const likes = await Likes.findAll({
          where: {
            referenceId: {
              [Op.in]: comments.map(c => c.id)
            },
            entityId: global.Entities.Comment
          }
        });
        
        comments.forEach(comment => mutateLikesWithComments(userId, likes, comment));
        return comments;
    });
  },

  /**
   * * Получить количество комментариев
   * @param {*} where уловия отбора комментариев
   * @returns {*} Количество комментариев
   */
  async getCountComments(where) {
    return comments.count({where});
  }

};
