var express = require('express');
var debug = require('debug')('debug:routes:mailbox');
var tool = require('../utils/tool');
var router = express.Router();

router.route('/')
    .get(function (req, res, next) {
        var pageindex = req.params.pageindex || 0;
        var pagesize = req.params.pagesize || 100;
        var query = {};
        var skip = pageindex * pagesize;
        $Mailbox.find(query).skip(skip).limit(pagesize).exec().then(function (docs) {
            var result = tool.responseSuccess(docs);
            res.json(result);
        }).catch(function (err) {
            var result = tool.responseFail('0', err);
            res.json(result);
        });
    })
    .post(function (req, res, next) {
        var result = tool.responseFail('0', "改接口还未实现");
        res.json(result);
    })
    .put(function (req, res, next) {
        var ids = req.body.ids;
        var isread = req.body.isread;
        $Mailbox.find({ _id: { $in: ids.split(',') } }).exec().then(function (docs) {
            var _data = undefined;
            if (docs) {
                docs.map(info => {
                    if (tool.NotNullAndUndefind(isread)) info.isread = isread;
                    info.save();
                });
                _data = docs;
            }
            var result = tool.responseSuccess(_data);
            res.json(result);
        }).catch(function (err) {
            var result = tool.responseFail('0', err);
            res.json(result);
        });
    })
    .delete(function (req, res, next) {
        var ids = req.body.ids;
        $Mailbox.remove({ _id: { $in: ids.split(',') } }).then(function (info) {
            var result = tool.responseSuccess(info);
            res.json(result);
        }).catch(function (err) {
            var result = tool.responseFail('0', err);
            res.json(result);
        });
    })

router.route('/:id')
    .get(function (req, res, next) {
        var _mailbox = req.mailbox;
        if (_mailbox && _mailbox.body && _mailbox.body.systemid) {
            var time_stamp_day = _mailbox.body.time_stamp_day;
            var systemid = _mailbox.body.systemid;
            //获取系统下的kksid
            $Operation.find({ systemid: systemid }, ["kksid", "name"]).exec().then(function (docs) {
                var promiselist = [];
                if (docs && Array.isArray(docs)) {
                    docs.map(info => {
                        var key = [info._id, time_stamp_day].join(":");
                        var p = new Promise(function (resole, reject) {
                            $Redis.lrange(key, [0, -1]).then(function (data) {
                                resole({ kksid: info.kksid, name: info.name, vals: data });
                            });
                        });
                        promiselist.push(p);
                    });
                }
                Promise.all(promiselist).then(function (data) {
                    var result = tool.responseSuccess(data);
                    res.json(result);
                })
            }).catch(function (err) {
                var result = tool.responseFail('0', err);
                res.json(result);
            });
        } else {
            var result = tool.responseSuccess(_mailbox);
            res.json(result);
        }
    })
    .put(function (req, res, next) {
        var id = req.mailbox._id;
        var result = tool.responseFail('0', "改接口还未实现");
        res.json(result);
    })
    .delete(function (req, res, next) {
        var id = req.mailbox._id;
        $Mailbox.remove({ _id: id }).then(function () {
            var result = tool.responseSuccess();
            res.json(result);
        }).catch(function (err) {
            var result = tool.responseFail('0', err);
            res.json(result);
        });
    })

router.param('id', function (req, res, next, id) {
    $Mailbox.findOne({ _id: id }).exec().then(function (info) {
        req.mailbox = info;
        next();
    }).catch(function (err) {
        var result = tool.responseFail('0', 'id无效');
        res.json(result);
    });
});

module.exports = router;
