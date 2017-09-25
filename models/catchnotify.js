'use strict';

var mongoose = require('mongoose');

var schema = module.exports = new mongoose.Schema({
    systemid: { type: String },
    systemname: { type: String },
    operationid: { type: String },
    kksid: { type: String },
    kksname: String, //
    status: { type: Number },  // 0 正常 1 异常
    w_condition: { type: Number }, // 0 正常 1 停机
    real_value: { type: Number },
    upper_value: { type: Number },
    lower_value: { type: Number },
    level: { type: Number },
    dangerous_lower: { type: Number },
    dangerous_upper: { type: Number },
    warning_lower: { type: Number },
    warning_upper: { type: Number },
    type: { type: Number },  // 1 表示 预测异常 2 表示 警告异常 3 表示 跳闸异常
    updatetime: { type: Date },
    createdTime: { type: Date, default: Date.now }
});

schema.set('collection', 'catchnotify');

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
    ret.updatetime = ret.updatetime && ret.updatetime.valueOf();
};