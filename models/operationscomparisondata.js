'use strict';

var mongoose = require('mongoose');

var schema = module.exports = new mongoose.Schema({
    performanceid: { type: String },
    systemid: { type: String },
    systemname: { type: String },
    systempath: { type: String },
    time_stamp: { type: Number }, //UTC time to seconde
    vcompar:Number,
    vself: Number,
    createdTime: { type: Date, default: Date.now }
});

schema.set('collection', 'operationscomparisondata');

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