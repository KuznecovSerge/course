const { ISocketService } = require("../../interfaces/ISocketService");
const { CacheService } = require("../../../services/CacheService");

/**
 * * Сервис работы с подключениями клиентов
 */
class ClientService extends ISocketService {
  constructor() {
    super();
    this.cache = new CacheService();
  }

  /**
   * * Инициализация сервиса
   * @param {*} socket
   */
  Init(socket) {
    socket.on("userEntered", data => {
        this.cache.GetOrAdd(`user___${data}`, () => socket);
    });
  }

  /**
   * * Отправить сообщение клиенту
   * @param {*} socket
   * @param {*} data
   */
  Send(socket, event, data) {
    // todo
  }
}

module.exports = { ClientService };
