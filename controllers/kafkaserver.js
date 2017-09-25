
var debug = require('debug')('debug:controllers:kafkaserver');
var tool = require('../utils/tool');

exports.produce = function (topic, key, message) {
    return new Promise(function (resove, reject) {
        var rediskey = ["kafka", "produce"].join(":");
        var _data = { key: key, data: message };
        $Redis.lpush(rediskey, JSON.stringify(_data)).then(function () {
            resove();
        }).catch(function (err) {
            reject(err);
        })
    });
}

exports.sava_operationpoint_abnormal = function (systemid, time_stamp, message) {
    return new Promise(function (resove, reject) {
        var _row = ["catch", systemid, time_stamp].join("_");  //catch_operationid_time_stamp
        var _column = "op:catch";
        $HbaseClient.table("operationpoint_abnormal").row(_row).put(_column, message, function (err, success) {
            if (err) {
                reject(err);
            } else {
                resove();
            }
        });
    });
}
