const { ISocketService } = require("../../interfaces/ISocketService");
const { InboxService } = require("../../../services/InboxService");

/**
 * * Сервис работы с уведомлениями от системы
 */
class NotifiesService extends ISocketService {
  /**
   * * Ctor
   */
  constructor() {
    super();
    this.inboxService = new InboxService();
  }

  /**
   * * Получить список сообщений
   * @param {*} userId
   */
  async Messages(userId) {
    return this.inboxService.GetAllMessages(userId).then(messages => {
      return messages.map(m => {
        return {
          id: m.id,
          sender: m.sender,
          senderText: m["userSender.firstName"],
          title: m.title,
          message: m.message,
          date: m.createdAt,
          read: m.read
        };
      });
    });
  }

  /**
   * * Инициализация значений
   * @param {} socket
   * @param {*} connections
   */
  Init(socket) {
    socket.on("fetchNotify", data => {
      this.Messages(data).then(res => {
        socket.emit("NOTIFY", res);
      });
    });
  }

  /**
   * * Отправить сообщение клиенту
   * @param {*} socket
   * @param {*} data
   */
  Send(socket, event, data) {
    if (event == "fetchNotify") {
      this.Messages(data).then(res => {
        socket.emit("NOTIFY", res);
      });
    }
  }
}

module.exports = { NotifiesService };
