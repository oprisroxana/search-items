#!/usr/bin/env node
'use strict';
require('dotenv').config();

const express = require('express');
const app = express();
const globalErrorHandler = require('../middleware/expressErrorHandler');
const routes = require('../router');

const ALLOW_ORIGIN = '*';
const ALLOW_METHODS = 'POST,OPTIONS';
const ALLOW_HEADERS = 'Authorization, Origin, X-Requested-With, Content-Type, Accept, X-App-Id, X-App-Secret, X-Naming-Strategy';

const WEBPORT = Number(process.env.HTTP_PORT);
const ADDRESS = process.env.ADDRESS;

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', ALLOW_ORIGIN);
  res.header('Access-Control-Allow-Headers', ALLOW_HEADERS);
  res.header('Access-Control-Allow-Methods', ALLOW_METHODS);
  next();
});


app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use('/', routes);
app.use(globalErrorHandler);
app.disable('x-powered-by');

app.listen(WEBPORT, ADDRESS, () => {
  console.log('Server is running', `${ADDRESS}:${WEBPORT}`);
});
