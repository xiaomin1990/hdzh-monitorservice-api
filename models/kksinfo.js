'use strict';

var mongoose = require('mongoose');

var schema = module.exports = new mongoose.Schema({
  longidstr: { type: String},
  shortidstr: {type: String},
  szPoint: { type: String}, //eDNA完整点名，格式：”站点名.服务名.ShortID” 
  siteid:String, //站点ID
  serverid:String,  //服务ID
  shortid:String, //标签ID
  szDesc: String,
  szUnits:String, //单位
  createdTime: {type: Date, default: Date.now }
});

schema.set('collection', 'kksinfo');

schema.pre('save', function(next) {
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
