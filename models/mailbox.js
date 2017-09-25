'use strict';

var mongoose = require('mongoose');

var bodyschema = new mongoose.Schema({
    content: { type: String }, //内容
    appendix: { type: String }, //附件地址
    time_stamp: { type: String }, //异常信封特别字段  出错信号的时间
    time_stamp_day: { type: Number, default: 1 },  //异常信封特别字段  出错信号的时间
    systemid: String  //异常信封特别字段  出错信号的systemid
});

var schema = module.exports = new mongoose.Schema({
    topic: { type: String }, //标题
    from: { type: String }, //发件人
    to: { type: String }, //收件人
    type: { type: Number, default: 1 },  //邮件类型
    body: bodyschema,  //信件内容
    isread:{ type: Number, default: 0 }  //是否已读
});

schema.set('collection', 'mailbox');

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
