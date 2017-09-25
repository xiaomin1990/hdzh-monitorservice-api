'use strict';

require("../env");
var models = require('require-directory')(module);
//var config = require('config');

var ignoremodel = ["index", "ijob"];

exports.jobInit = function () {
    Object.keys(models).forEach(function (key) {
        /* istanbul ignore else */
        if (ignoremodel.indexOf(key) < 0) {
            (new models[key]).run();
        }
    });
}

