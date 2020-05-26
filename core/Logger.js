const winston = require("winston");
const { createLogger, format, transports } = require("winston");
var stackTrace = require("stack-trace");
require("winston-daily-rotate-file");

const dailyRotate = new transports.DailyRotateFile({
  filename: "courses-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  dirname: "log",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "14d"
});

const prettyPrint = f => {
  return f.printf(
    info => {
      if (info.message.constructor === Object) {
        info.message = JSON.stringify(info.message, null, 4)
      }
      return `[${info.timestamp}] [${info.level.toUpperCase()}] ${info.message}` +
      (info.splat !== undefined ? `${info.splat}` : " ")
    }
  );
};

const logger = createLogger({
  format: format.combine(
    format.splat(),
    format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss"
    }),
    prettyPrint(format)
  ),
  transports: [dailyRotate]
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new transports.Console({
      format: format.combine(format.simple(), prettyPrint(format))
    })
  );
}

const GetCaller = () => {
  const trace = stackTrace.get();
  return trace[2];
};

logger.method = function(...args) {
  const trace = GetCaller();
  let callerFunc;
  if (trace) {
    callerFunc = trace.getFunctionName();
  }
  args[0] = `Вызов метода '${callerFunc}' ${args[0]}`;
  return logger.info(...args)
};

module.exports = logger;
