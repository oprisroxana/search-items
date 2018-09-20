const winston = require('winston');

const level = process.env.LOG_LEVEL || 'info';

const logger = new winston.Logger({
  transports: [
    new winston.transports.Console({
      level: level,
      colorize: true,
      timestamp: function () {
        return (new Date()).toISOString();
      }
    })
  ]
});

module.exports = logger;
