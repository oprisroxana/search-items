const express = require('express');
const router = express.Router();
const routeHandler = require('./routeHandlers');
const asyncMiddleware = require('../middleware/asyncMiddleware');


router.get('/test', asyncMiddleware(routeHandler.test));

module.exports = router;
