var express = require('express');
var router = express.Router();

'use strict';

var routes = require('require-directory')(module);

module.exports = function(app) {
  Object.keys(routes).forEach(function(key) {
    /* istanbul ignore else */
    if (key !== 'index') {
      app.use('/' + key, routes[key]);
    }
  });

  app.get('/', function(req,res) {
    res.json({ 'API Version': '1.1', 'name': 'SERVICE-API' });
  });

  app.get('/ping', function(req,res) {
    res.json({ msg: 'pong' });
  });
}
