'use strict';

var mongoose = require('mongoose');

var schema = module.exports = new mongoose.Schema({
    kkses: { type: Array }, //评估的kksid
    kksname: { type: Array }, //评估的name
    operationid: { type: String }, //id
    vals: { type: Array },  //
    otherids: { type: Array },  //
    othernames: { type: Array },  //
    type: { type: String },  //类型  relation 相关性  importances 重要程度
    createdTime: { type: Date, default: Date.now }
});

schema.set('collection', 'evaluationsresult');

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
