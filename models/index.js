'use strict';

var models = require('require-directory')(module);
var mongoose = require('mongoose');
mongoose.Promise = Promise;
var config = require('config');
var lingo = require('lingo');

var mongodbConnString = 'mongodb://' + config.mongodb.host + '/' + config.mongodb.database;

var mongodbUser = config.mongodb.username;
var mongodbPass = config.mongodb.password;
/* istanbul ignore if */
if (config.mongodb.replsets && config.mongodb.replsets.length) {
  mongodbConnString = 'mongodb://' + config.mongodb.host;
  config.mongodb.replsets.forEach(function (replset) {
    mongodbConnString += (',' + 'mongodb://' + replset.host);
  });

  mongodbConnString += '/' + config.mongodb.database;
}

/* istanbul ignore if */
if (mongodbUser && mongodbPass) {
  mongoose.connect(mongodbConnString, {
    user: mongodbUser,
    pass: mongodbPass,
    server: {
      auto_reconnect: true,
      socketOptions: {
        socketTimeoutMS: config.mongodb.socketTimeoutMS || 0
      }
    },
    db: {
      readPreference: 'secondaryPreferred'
    }
  });
} else {
  mongoose.connect(mongodbConnString);
}


var self = module.exports = {};
Object.keys(models).forEach(function (key) {
  /* istanbul ignore else */
  if (key !== 'index') {
    var modelName = lingo.capitalize(key);
    var nodelControllName = ['$', modelName].join('');
    self[nodelControllName] = mongoose.model(modelName, models[key]);
  }
});

self.DB = mongoose;
//self.DBAlgorithm = require('mongodb').MongoClient;

var redisOptions = {
  port: (config.redis && config.redis.port) || 6379,
  host: (config.redis && config.redis.host) || '127.0.0.1',
  db: (config.redis && config.redis.index) || 0
};
if (config.redis && config.redis.password) {
  redisOptions.password = config.redis.password;
}

/* istanbul ignore if */
if (config.redis.password) {
  redisOptions.password = config.redis.password;
}

self.$Redis = new require('ioredis')(redisOptions);
self.$RedisSub = new require('ioredis')(redisOptions);
var hbaseoption = {
  host: config.hbase.rest.host || "192.188.108.151",
  port: config.hbase.rest.port || 8080
}
self.$HbaseClient = require('hbase')(hbaseoption);