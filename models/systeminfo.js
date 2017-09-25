'use strict';

var mongoose = require('mongoose');

var schema = module.exports = new mongoose.Schema({
    name: { type: String },
    parent: { type: String },
    path: { type: String },
    type: { type: Number, default: 1 },
    level:{type: Number,default: 0 },
    performance:{type: Number,default: 0 },  //系统性能指标0-1
    hashmachine:{type: Number,default: 0 },  //设备主机号，用于Hash取值
    createdTime: { type: Date, default: Date.now }
});

schema.set('collection', 'systeminfo');

schema.pre('save', function (next) {
    next();
});

/* istanbul ignore else */
if (!schema.options.toJSON) {
    schema.options.toJSON = {};
}

schema.options.toJSON.transform = function (doc, ret) {
    ret.createdTime = ret.createdTime && ret.createdTime.valueOf();
};
