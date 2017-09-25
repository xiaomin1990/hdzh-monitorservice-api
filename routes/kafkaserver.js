var express = require('express');
var debug = require('debug')('debug:routes:kafkaserver');
var tool = require('../utils/tool');
var router = express.Router();

const kafkaserverCtr = require('../controllers/kafkaserver')


router.post("/produce/:topic/:key", function (req, res, next) {
    var topic = req.params.topic;
    var key = req.params.key;
    var systemid = req.body.systemid;
    var time_stamp = req.body.time_stamp;
    var message = req.body.message;
    var rediskey = ["kafka", "produce"].join(":");
    var _data = { key: key, data: message };
    var plist=[kafkaserverCtr.produce(topic,key,message)];
    if(time_stamp && time_stamp !="0"){
        plist.push(kafkaserverCtr.sava_operationpoint_abnormal(systemid,time_stamp,message));
    }
    Promise.all(plist).then(function (data) {
        var result = tool.responseSuccess("");
        return res.json(result);
    }).catch(function (err) {
        var result = tool.responseFail('0', err);
        return res.json(result);
    });

});

module.exports = router;
