var express = require('express');
var debug = require('debug')('debug:routes:kksinfo');
var tool = require('../utils/tool');
var router = express.Router();

/* GET users listing. */
router.get('/get', function (req, res, next) {
    var kksid = req.query.kksid;
    if (!kksid) {
        var result = tool.responseFail('0', '参数错误');
        return res.json(result);
    }
    var klist = kksid.split('\n');
    var promiselist = [];
    klist.map(info => {
        var kksidlist = info.split('.');
        if (kksidlist.length < 3) {
            // errorlist.push(info);
        }
        else {
            var p = new Promise(function (resolve, rejecte) {
                $Kksinfo.findOne({ siteid: kksidlist[0], serverid: kksidlist[1] }).or([{ shortid: kksidlist[2] }, { shortidstr: kksidlist[2] }]).exec().then(function (doc) {
                    if (doc) {
                        resolve({ kksid: info, desc: doc.szDesc });
                    } else {
                        resolve();
                    }
                });
            });
            promiselist.push(p);
        }
    });
    Promise.all(promiselist).then(function (docs) {
        var result = tool.responseSuccess(docs);
        return res.json(result);
    }).catch(function (err) {
        var result = tool.responseFail('0', err);
        return res.json(result);
    });
});

router.get("/validate", function (req, res, next) {
    var _input = req.query.input;
    var _output = req.query.output;
    if (!_input && !_output) {
        var result = tool.responseFail('0', "参数错误");
        return res.json(result);
    }
    var kksid = tool.getkksid(_output, _input);
    var klist = kksid.split(',');
    var promiselist = [];
    klist.map(info => {
        var kksidlist = info.split('.');
        if (kksidlist.length < 3) {
            // errorlist.push(info);
        }
        else {
            var p = new Promise(function (resolve, rejecte) {
                $Kksinfo.findOne({ siteid: kksidlist[0], serverid: kksidlist[1] }).or([{ shortid: kksidlist[2] }, { shortidstr: kksidlist[2] }]).exec().then(function (doc) {
                    if (doc) {
                        resolve({ kksid: info, desc: doc.szDesc });
                    } else {
                        resolve();
                    }
                });
            });
            promiselist.push(p);
        }
    });
    Promise.all(promiselist).then(function (docs) {
        var result = tool.responseSuccess(docs);
        return res.json(result);
    }).catch(function (err) {
        var result = tool.responseFail('0', err);
        return res.json(result);
    });
})

module.exports = router;
