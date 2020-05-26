const References = require("../models/index");
const { entity_reports, users } = require("../models/index");
const { CacheService } = require("./CacheService");
const { InboxService } = require("./InboxService");
const { IService } = require("../core/interfaces/IService");

/**
 * * Сервис работы с жалобами
 */
class ReportsService extends IService {
  /**
   * * Конструктор
   * ? Инстанцируется сервис, подумать может стоит переиграть
   */
  constructor() {
    super();
    this.inboxService = new InboxService();
  }

  /**
   * * Получить таблицу Sequeilize по reference-id
   * @param {*} reference
   */
  async GetDataTable(reference) {
    const tableName = CacheService.GetOrAdd(name => {
      return Object.keys(References).filter((val, idx) => {
        return val.toLowerCase() == name.toLowerCase();
      });
    }, reference);

    if (!tableName) {
      throw new Error(`Не найдена таблица по ссылке на ${reference}`);
    }

    return References[tableName];
  }

  /**
   * * Получить запись из таблицы по ссылке на таблицу и уникальному идентификатору
   */
  async GetReference(reference, referenceId) {
    const dataTable = await this.GetDataTable(reference);

    const data = await dataTable.findAll({
      where: {
        id: referenceId
      }
    });

    return data;
  }

  /**
   * * Переносим в архив запись таблицы на которую была жалоба
   * @param {*} reference
   * @param {*} referenceId
   */
  async DeleteRecord(reference, referenceId) {
    const dataTable = await this.GetDataTable(reference);
    const record = await dataTable.findOne({
      where: {
        id: referenceId,
        archive: false
      }
    });
    if (record !== null) {
      const result = await record.update({
        archive: true
      });

      const notify = await this.inboxService.Create({
        sender: 100000,
        receiver: result.userId,
        title: "Уведомление от системы",
        message: `${result.comment ? "Сообщение" : "Блог"} '${result.comment ||
          result.title}' удален/\удалено модератором!`
      });

      SocketProvider.Emit(result.userId, "fetchNotify");

      return result;
    }
    return record;
  }

  /**
   * * Удалить жалобу по уникальному идентификатору
   * @param {*} id
   */
  async DeleteWithId(id) {
    const entity = await entity_reports.findOne({
      where: { id: id }
    });
    const result = await entity.update({
      archive: true
    });

    return result;
  }

  /**
   * * Создать запись в таблице жалоб
   * @param {*} model
   */
  async CreateReport(model) {
    return await entity_reports.create(model);
  }

  /**
   * * Получить список жалоб по ссылке на таблицу
   * @param {*} reference
   */
  async GetReports(table) {
    const reports = await entity_reports.findAll({
      where: {
        reference: table,
        archive: false
      },
      include: [
        {
          model: users,
          as: "users",
          attributes: ["login", "email", "firstName", "lastName"]
        }
      ],
      raw: true
    });

    return reports;
  }
}

module.exports = { ReportsService };
