var express = require('express');
var debug = require('debug')('debug:routes:trainmodel');
var tool = require('../utils/tool');
var router = express.Router();

/* GET users listing. */
// router.get('/', function (req, res, next) {
//     res.send('respond with a resource');
// });

router.get("/model/:key", function (req, res, next) {
    var key = req.params.key;
    $HbaseClient.table("trainmodel").row(key).get("cf:model", function (err, cells) {
        if (err) {
            var result = tool.responseFail('0', err);
            return res.json(result);
        } else {
            var result = tool.responseSuccess(cells[0].$);
            return res.json(result);
        }
    })
});

router.post("/model", function (req, res, next) {
    var key = req.body.key;
    var data = req.body.data;
    if (!key || !data) {
        var result = tool.responseFail('0', "参数错误");
        return res.json(result);
    }
    $HbaseClient.table("trainmodel").row(key).put("cf:model", data, function (err) {
        if (err) {
            var result = tool.responseFail('0', err);
            return res.json(result);
        } else {
            var result = tool.responseSuccess("");
            return res.json(result);
        }
    })
});



module.exports = router;
