'use strict';
const logger = require('../config/logger');

module.exports = (err, req, res, next) => {
  logger.error(err);
  res.status(err.status || 500).json({
    ok: false,
    error: err,
  });
}
;
