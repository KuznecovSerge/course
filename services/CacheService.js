"use strict";

const NodeCache = require("node-cache");
const { IService } = require("../core/interfaces/IService");

/**
 * * Сервис работы с кешом
 */
class CacheService extends IService {
  /**
   * * Конструктор
   * @param {number} Время жизни кеша
   */
  constructor(ttlSeconds) {
    super();
    const ttl = (ttlSeconds || 60) * (60 * 60);
    this.cache = new NodeCache({
      stdTTL: ttl,
      checkperiod: ttl * 0.2,
      useClones: false
    });
  }

  OnInit() {}

  /**
   * * Получить или добавить значения для кеша
   * @param {Ключ} key
   * @param {Func вычисления значения} storeFunction
   */
  GetOrAdd(key, storeFunction) {
    const value = this.Get(key);
    if (!value) {
      const func = storeFunction();
      if (func.then) {
        return func.then(result => {
          this.cache.set(key, result);
          return result;
        });
      } else {
        this.cache.set(key, func);
        return func;
      }
    }

    return value;
  }

  /**
   * * Получить значение из кеша
   * @param {Ключ} key
   */
  Get(key) {
    const value = this.cache.get(key);
    if (value) {
      return Promise.resolve(value);
    }

    return null;
  }

  /**
   * * Удалить из кеша
   * @param {Ключ} key
   */
  Delete(key) {
    this.cache.del(key);
  }

  /**
   * * Получить все ключи
   */
  GetKeys() {
    return this.cache.keys();
  }

  /**
   * * Очистить хранилище кеша
   */
  flush() {
    this.cache.flushAll();
  }
}

module.exports = { CacheService };
