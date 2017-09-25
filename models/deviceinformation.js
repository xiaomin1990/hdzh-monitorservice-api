'use strict';

var mongoose = require('mongoose');

var schema = module.exports = new mongoose.Schema({
    server_id: { type: String },
    disk_usage: { type: Number },
    ip_address: { type: String },
    cpu_usage: { type: Number },
    ram_usage: { type: Number }, //
    cpu_current_temp: { type: Number }, //
    cpu_high_temp: { type: Number }, //
    cpu_critical_temp: { type: Number }, //
    createdTime: { type: Date, default: Date.now }
});

schema.set('collection', 'deviceinformation');

schema.pre('save', function (next) {
    next();
});


/* istanbul ignore else */
if (!schema.options.toJSON) {
    schema.options.toJSON = {};
}

schema.options.toJSON.transform = function (doc, ret) {
    delete ret._id;
    ret.createdTime = ret.createdTime && ret.createdTime.valueOf();
};
