'use strict';

var mongoose = require('mongoose');

var schema = module.exports = new mongoose.Schema({
    id: { type: String },  //operationid
    systemid: { type: String },
    systemname: { type: String },
    systempath: { type: String },
    time_stamp: { type: Number }, //UTC time to millseconde
    time_stamp_day: { type: Number }, //UTC time 
    vself: { type: Number },
    vcompar: { type: Number },
    vresult: Number,
    kkses: { type: Array },
    vals: { type: Array },
    type: { type: Number, default: 1 }, //
    createdTime: { type: Date, default: Date.now }
});

schema.set('collection', 'operationdata');

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