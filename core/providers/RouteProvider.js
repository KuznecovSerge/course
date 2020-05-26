const fs = require("fs");
const createError = require("http-errors");

/**
 * * Провайдер маршрутов
 */
class RouteProvider {
  /**
   * * Конструктор
   * @param {express} app
   * @param {string} path
   */
  constructor(app, routes_pwd) {
    this.api_prefix = "/api";
    this.app = app;
    this.routes_pwd = routes_pwd;
  }

  /**
   * * Инициализация провайдера
   */
  Init() {
    ILogger.info("Инициализация провайдера маршрутов");
    this.RegisterRoutes();
    this.RegisterHandlers();
  }

  /**
   * * Регистрация перехватчиков
   */
  RegisterHandlers() {
    ILogger.info("Регистрация перехватчиков");
    // catch 404 and forward to error handler
    this.app.use(function(req, res, next) {
      next(createError(404));
    });

    // error handler
    this.app.use(function(err, req, res, next) {
      // set locals, only providing error in development
      res.locals.message = err.message;
      res.locals.error = req.app.get("env") === "development" ? err : {};

      // render the error page
      res.status(err.status || 500);
      return res.json({ error: err.message, success: false });
    });
  }

  /**
   * * Регистрация маршрутов
   */
  RegisterRoutes() {
    ILogger.info("Регистрация маршрутов");
    const extension = ".js";
    const routes = fs.readdirSync(this.routes_pwd).filter(route => {
      return route.indexOf(".") !== 0 && route.slice(-3) === extension;
    });
    ILogger.info("Папка с маршрутами: %s", this.routes_pwd);
    if (routes.length) {
      routes.forEach(route => {
        const controller = route.replace(extension, "");
        ILogger.info(
          "Регистрируем контроллер: %s с доступом по адресу адресу %s",
          controller,
          `${this.api_prefix}/${controller}`
        );
        this.app.use(
          `${this.api_prefix}/${controller}`,
          require(`${this.routes_pwd}/${controller}`)
        );
      });
    }
  }
}

module.exports = { RouteProvider };
