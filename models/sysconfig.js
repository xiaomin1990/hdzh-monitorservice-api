'use strict';

var mongoose = require('mongoose');

var schema = module.exports = new mongoose.Schema({
  key: { type: String,required: true, index: { unique: true } },  //key
  value: { type: String },  //值
  desc: { type: String },  //描述
  othervalue: { type: String },
  createdTime: { type: Date, default: Date.now }
});

schema.set('collection', 'sysconfig');

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
