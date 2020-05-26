"use strict";

const { inbox, users } = require("../models/index");
const { IService } = require("../core/interfaces/IService");

/**
 * * Сервис работы с сообщениями от системы
 */
class InboxService extends IService {
  /**
   * * Создать сообщение
   */
  async Create(model) {
    const item = await inbox.create(model);
    return item;
  }

  /**
   * * Пометить сообщение прочитанным
   */
  async MarkAsRead(model) {
    return await inbox
      .findOne({
        where: {
          id: model.inboxId
        }
      })
      .then(value => {
        return value.update({
          read: true
        });
      });
  }

  /**
   * * Получить непрочитанное сообщение по идентификатору пользователя
   */
  async GetMessage(userId) {
    return await inbox.findOne({
      where: {
        receiver: userId,
        read: false
      },
      raw: true
    });
  }

  /**
   * * Получить все непрочитанные сообщения по идентификатору пользователя
   * @param {уникальный идентификатор} userId
   */
  async GetAllMessages(userId) {
    return await inbox.findAll({
      where: {
        receiver: userId
      },
      include: [
        {
          model: users,
          as: "userSender",
          attributes: ["login", "email", "firstName", "lastName"]
        }
      ],
      raw: true
    });
  }
}

module.exports = { InboxService };
