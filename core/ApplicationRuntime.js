const { BindAll } = require("./helpers/CoreHelpers");
const { Entities, NotifyType, FileStorage } = require("./Constants");
const { ServiceContainer } = require("./ServiceContainer");
const { CacheService } = require("./../services/CacheService");
const { RouteProvider } = require("./providers/RouteProvider");
const ILogger = require("./Logger");
const express = require("express");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const path = require("path");
const history = require("connect-history-api-fallback");

/**
 * * Runtime class
 */
class ApplicationRuntime {
  /**
   * * Конструктор
   * @param {express} express
   */
  constructor(app) {
    this.app = app;
    this.serviceContainer = new ServiceContainer();
    this.public_pwd = path.join(__dirname, "/../public");
    this.routes_pwd = path.join(__dirname, "/../routes");
    this.routeProvider = new RouteProvider(app, this.routes_pwd);

    this.reg = {
      inter: false,
      cors: false,
      const: false,
      helpers: false,
      routes: false
    };
  }

  /**
   * * Инициализация
   */
  Init() {
    global.ILogger = ILogger;
    this.RegisterInterceptors();
    this.RegisterCORS();
    this.RegisterConstants();
    this.RegisterHelpers();
    this.RegisterRoutes();
    this.serviceContainer.AddService("CacheService", () => new CacheService());

    global.ILocator = this.serviceContainer;
  }

  /**
   * * Подключаем маршруты
   */
  RegisterRoutes() {
    this.routeProvider.Init();
  }

  /**
   * * Шарить статику
   */
  ServeStatic() {
    this.app.use(
      history({
        verbose: true,
        rewrites: [
          { from: /^\/login/, to: '/login.html' },
          { from: /^\/signup/, to: '/login.html' },
          { from: /^\/signup\/./, to: '/login.html' },
          { from: /^\/restore/, to: '/login.html' }
        ]
      })
    );
    // бандл логина
    //this.app.use("/login", express.static(this.public_pwd + '/login.html'));
    //this.app.use("/login", (req, res) => { return res.status(200).json('OK') });
    // статика
    this.app.use(express.static(this.public_pwd));
    this.app.use("/public", express.static(this.public_pwd));
  }

  /**
   * * Подключение перехватчиков
   */
  RegisterInterceptors() {
    ILogger.info("Подключаем перехватчики express");
    this.app.use(passport.initialize());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(cookieParser());
  }

  /**
   * * Подключаем возможность Кросс браузерные запросы для всех хостов
   */
  RegisterCORS() {
    ILogger.info("Подключаем CORS");
    this.app.use((req, res, next) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, OPTIONS, PUT, DELETE"
      );
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
      );
      next();
    });
  }

  /**
   * * Подключаем константы
   */
  RegisterConstants() {
    ILogger.info("Регистрируем глобально константы");
    global.Entities = Entities;
    global.NotifyType = NotifyType;
    global.FileStorage = FileStorage;
    global.CoreUtils = require("./CoreUtils");
  }

  /**
   * * Подключаем хелперы
   */
  RegisterHelpers(helpers) {
    ILogger.info("Регистрируем глобально хелперы");
    global.BindAll = BindAll;
    global.IsProduction = () => process.env.NODE_ENV === "production";
    if (Array.isArray(helpers)) {
      helpers.forEach(h => (global[h.name] = h.helper));
    }
  }
}

module.exports = { ApplicationRuntime };
