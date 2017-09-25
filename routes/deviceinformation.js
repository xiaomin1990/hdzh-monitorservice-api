var express = require('express');
var debug = require('debug')('debug:routes:deviceinformation');
var tool = require('../utils/tool');
var router = express.Router();

const deviceinformationCtr = require('../controllers/deviceinformation');

router.post("/working", function (req, res, next) {
  
    var info = req.body.data;
     // debug(info);
    try {
        info = JSON.parse(info);
        deviceinformationCtr.working.save(info).then(function (doc) {
            var result = tool.responseSuccess(doc);
            res.json(result);
        });
    } catch (err) {
        var result = tool.responseFail('0', err);
        res.json(result);
    }
});
router.get("/working/list", function (req, res, next) {
    deviceinformationCtr.working.find().then(function (docs) {
        var result = tool.responseSuccess(docs);
        res.json(result);
    }).catch(function (err) {
        var result = tool.responseFail('0', err);
        res.json(result);
    });
});

module.exports = router;
