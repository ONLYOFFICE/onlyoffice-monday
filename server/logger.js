const winston = require('winston');
const { format } = require('winston');
const configuration = require('./config');

const logger = winston.createLogger({
    level: configuration.get("logger").level,
    format: winston.format[configuration.get("logger").format](),
    exitOnError: false,
    transports: [
        new winston.transports.Console(),
    ],
  });

module.exports = logger;