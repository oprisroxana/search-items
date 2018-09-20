const express = require('express');
const router = express.Router();
const routeHandler = require('./routeHandlers');
const asyncMiddleware = require('../middleware/asyncMiddleware');


router.get('/', asyncMiddleware(routeHandler.test));
router.post('/search10', asyncMiddleware(routeHandler.search10));

module.exports = router;
