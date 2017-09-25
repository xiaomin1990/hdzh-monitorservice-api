var express = require('express');
var debug = require('debug')('debug:routes:electric');
var tool = require('../utils/tool');
var router = express.Router();

/* GET users listing. */
// router.get('/', function (req, res, next) {
//     res.send('respond with a resource');
// });

router.get("/cost", function (req, res, next) {
    var yeartimestamp = (new Date()).getFullYear();
    var key = ["day_consumption", yeartimestamp].join(":");
    $Redis.lrange(key,[ 0, -1]).then(function (list) {
        var result = tool.responseSuccess(list);
        res.json(result);
    }).catch(function (err) {
        debug('/cost error ', err);
        var result = tool.responseFail('0', err);
        res.json(result);
    });
});

module.exports = router;
