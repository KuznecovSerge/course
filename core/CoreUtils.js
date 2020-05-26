/**
 * * Core-Utils
 */
const CoreUtils = {
  /**
   * * Проверка ENV приложения
   */
  IsDevMode() {
    return (
      process.env.NODE_ENV === "development" &&
      process.env.NODE_ENV !== "production"
    );
  },

  /**
   * * Очистить ссылки sequelize-модели, оставить чистый объект DTO
   * @param {*} item 
   */
  CleanSequelizeModel(item) {
    return JSON.parse(JSON.stringify(item));
  },

  StringToBoolean(val) {
    if (!val) {
      return false;
    }
    switch (val.toLowerCase().trim()) {
      case "true":
      case "yes":
      case "1":
        return true;
      case "false":
      case "no":
      case "0":
      case null:
        return false;
      default:
        return Boolean(string);
    }
  },

  /**
   * * Удалить свойства объекта если они пустые или равны -1
   * @param {object} item
   */
  EraseArgsIfNull(item) {
    const keys = Object.keys(item);
    keys.forEach((k, i) => {
      const value = item[k];
      if (!value || value === -1 || value === "-1") {
        delete item[k];
      }
    });
  }
};

module.exports = CoreUtils;
