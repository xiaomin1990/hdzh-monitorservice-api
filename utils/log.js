var config = require('config');
var path = require('path');
var filelogs = require('filelogs');


/**
  * require('./log')(name)
  * 
  * @return {Function} log
  */
module.exports = function(name){
  var options = {};
  options.name = name;
  options.dir = path.join(__dirname + '/..' + config.logDir);
  var logConfig = config.logConfig || {};
  var level = logConfig[name] && logConfig[name].level || config.logLevel;
  var output = (logConfig[name] && logConfig[name].hasOwnProperty('output')) ? logConfig[name].output : config.logOutput;
  options.level = process.env.LEVEL || level;
  options.output = output;
  return filelogs(options);
};