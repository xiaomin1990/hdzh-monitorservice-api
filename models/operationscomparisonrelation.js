'use strict';

var mongoose = require('mongoose');

var schema = module.exports = new mongoose.Schema({
    performanceid: { type: String },
    comparisons: { type: Array },  //[{id:””,name:””,kksid:””}],
    createdtime: { type: Date, default: Date.now }
});

schema.set('collection', 'operationscomparisonrelation');

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