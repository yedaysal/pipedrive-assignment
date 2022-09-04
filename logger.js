const { createLogger, format, transports } = require('winston');

const logger = createLogger({
  level: 'info',
  format: format.combine(format.timestamp(), format.simple()),
  transports: [
    new transports.File({ filename: 'app-info.log' }),
    new transports.File({ filename: 'app-error.log', level: 'error' }),
  ],
});

module.exports = logger