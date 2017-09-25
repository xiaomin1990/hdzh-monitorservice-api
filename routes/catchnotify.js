var express = require('express');
var debug = require('debug')('debug:routes:catchnotify');
var tool = require('../utils/tool');
var router = express.Router();

const catchnotifyCtr = require('../controllers/catchnotify')

router.get("/list", function (req, res, next) {
    catchnotifyCtr.find().then(function (docs) {
        var result = tool.responseSuccess(docs);
        res.json(result);
    }).catch(function (err) {
        var result = tool.responseFail('0', err);
        res.json(result);
    });
});

module.exports = router;
