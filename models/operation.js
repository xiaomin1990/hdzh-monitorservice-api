'use strict';

var mongoose = require('mongoose');

var schema = module.exports = new mongoose.Schema({
    systemid: { type: String },
    systemname: {type: String },
    systempath: { type: String },
    name: { type: String },
    kksid: String,  //type=1 的时候 kksid 为多个kksid组成之间用“，”隔开
    type: Number,  //1 为指标信号  2 为异常监测
    output: String,
    input: String,
    level: String,  //重要性
    monitoringsignal: { type: Array },  //[{id:””,name:””,kksid:””,kpi:"",level:"",wcondition:"",time_window:"",error_rate:"",warning_upper:"",warning_lower:"",dangerous_upper:"",dangerous_lower:"",abnormal_period:"",alarm_upper:"",alarm_lower:""},{}], 监测信号 报警值：warning,跳闸保护值：dangerous,异常时间长度：abnormal_period
    time_interval: { type: Number,default: 3600 },
    time_window: { type: Number }, //时间窗
    error_rate: Number,  //错误率
    retrain: { type: Number, default: 0 },
    auto_learn: { type: Number, default: 1 },
    doneread: { type: Number, default: -1 },
    donetrain: { type: Number, default: -1 },
    memory_period: { type: Number },  //记忆时间长度,初始化为3*time_interval
    prediction_same: { type: Number, default: -1 },  //是否预测同类信号：不打钩的时候是0，打钩的时候是1
    status: { type: Number, default: 0 },  // 0 未启动 1 已启动 2 已删除
    start_time: Date,
    end_time: Date,
    description:String,
    hashmachine:{type: Number},  //设备主机号，用于Hash取值
    createdTime: { type: Date, default: Date.now }
});

schema.set('collection', 'operation');

schema.pre('save', function (next) {
    next();
});

/* istanbul ignore else */
if (!schema.options.toJSON) {
    schema.options.toJSON = {};
}

schema.options.toJSON.transform = function (doc, ret) {
    ret.start_time=ret.start_time && ret.start_time.valueOf();
    ret.end_time=ret.end_time && ret.end_time.valueOf();
    ret.createdTime = ret.createdTime && ret.createdTime.valueOf();
};
