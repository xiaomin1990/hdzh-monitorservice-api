'use strict';

var mongoose = require('mongoose');

var schema = module.exports = new mongoose.Schema({
    operationid: { type: String },
    systemid: { type: String },
    systemname: { type: String },
    kksid: { type: String },
    kksname: String, //
    error_rate: { type: Number },
    time_window: { type: Number },
    time_interval: { type: Number },
    time_stamp: { type: Number },
    time_stamp_Hour: { type: Number },
    time_stamp_Day: { type: Number },
    w_condition: { type: Number }, // 0 正常 1 停机
    real_value: { type: Number },
    upper_value: { type: Number },
    lower_value: { type: Number },
    kpi: { type: Number, default: 0 },
    level: { type: Number },
    dangerous_lower: { type: Number },
    dangerous_upper: { type: Number },
    warning_lower: { type: Number },
    warning_upper: { type: Number },
    type: { type: Number },  // 1 表示 预测异常 2 表示 警告异常 3 表示 跳闸异常
    createdTime: { type: Date, default: Date.now }

});

schema.set('collection', 'abnormals');

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