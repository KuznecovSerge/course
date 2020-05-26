const { NotifiesService } = require("./modules/NotifiesService");
const { ClientService } = require("./modules/ClientService");
const { CacheService } = require("../../services/CacheService");
const EventEmitter = require("events");

/**
 * * Провайдер обслуживания socket-запросов
 */
class SocketProvider extends EventEmitter {
  /**
   * * Конструктор провайдера
   * * Для добавления новой реализации получения сообщений от сервера
   * * при использовании сокетов, требуется создать модуль
   * * модуль унаследовать от ISocketService
   * @param {Socket IO Server} ioserver
   */
  constructor() {
    super();
    this.cacheService = new CacheService();
    this.services = [new ClientService(), new NotifiesService()];
  }

  /**
   * * Инициализация обработки сообщений
   */
  Init(ioserver) {
    ioserver.on("connection", socket => {
      this.services.forEach(service => {
        service.Init(socket);
      });
    });
  }

  /**
   *
   * @param {Уникальный идентификатор клиента} clientId
   * @param {Наименование события} event
   */
  Emit(clientId, event) {
    const socket = this.cacheService.GetOrAdd(`user___${clientId}`);
    if (socket) {
      this.services.forEach(service => {
        service.Send(socket, event, clientId);
      });
    }
  }
}

module.exports = { SocketProvider };
