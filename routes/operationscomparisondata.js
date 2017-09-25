var express = require('express');
var debug = require('debug')('debug:routes:operationscomparisondata');
var tool = require('../utils/tool');
var router = express.Router();

router.post('/', function (req, res, next) {
    //{performanceid:"",systemid:"",systemname:"",systempath:"",time_stamp:"",vcompar:"",vself:“”}
    var performanceid = req.body.performanceid;
    var systemid = req.body.systemid;
    var systemname = req.body.systemname;
    var systempath = req.body.systempath;
    var time_stamp = req.body.time_stamp;
    var vcompar = req.body.vcompar;
    var vself = req.body.vself;
    var info = { performanceid: performanceid, systemid: systemid, systemname: systemname, systempath: systempath, time_stamp: time_stamp, vcompar: vcompar, vself: vself }
    //debug('info:', info)
    $Operationscomparisondata.create(info).then(function () {
        var result = tool.responseSuccess(null);
        res.json(result);
    }).catch(function (err) {
        var result = tool.responseFail('0', err);
        res.json(result);
    });
});

router.get('/:performanceid', function (req, res, next) {
    var nowtime = new Date();
    var currenttimestamp = parseInt(nowtime.getTime() / 1000 / 3600);
    var prvemonthtime = nowtime.setMonth(nowtime.getMonth() - 1);
    var prvemonthtimestamp = parseInt(prvemonthtime / 1000 / 3600);
    var performanceid = req.params.performanceid;
    var query = { performanceid: performanceid, time_stamp: { $gte: prvemonthtimestamp, $lte: currenttimestamp } };
    $Operationscomparisondata.find(query).exec().then(function (list) {
        var result = tool.responseSuccess(list);
        res.json(result);
    }).catch(function (err) {
        var result = tool.responseFail('0', err);
        res.json(result);
    });
})

/**对标 */
router.get('/report/:systemid', function (req, res, next) {
    var pageindex = req.query.pageindex && parseInt(req.query.pageindex) || 0;//当前月为0  上一个月为 -1 依次类推
    var nowtime = new Date();
    var endtime = nowtime.setMonth(nowtime.getMonth() + pageindex);
    var endmonttimestamp = parseInt(endtime / 1000 / 3600);
    var beginmonthtime = nowtime.setMonth(nowtime.getMonth() - 1);
    var beginmonthtimestamp = parseInt(beginmonthtime / 1000 / 3600);

    var systemid = req.params.systemid;
    var query = { systemid: systemid, time_stamp: { $gte: beginmonthtimestamp, $lte: endmonttimestamp } };
    debug('query:', query);
    $Operationscomparisondata.find(query, ["time_stamp", "vcompar", "vself"]).exec().then(function (list) {
        var result = tool.responseSuccess(list);
        res.json(result);
    }).catch(function (err) {
        var result = tool.responseFail('0', err);
        res.json(result);
    });
});

/**获取对标 原始信号数据 */
router.get('/singeinfo/:performanceid/:comparisonid', function (req, res, next) {
    var performanceid = req.params.performanceid;
    var comparisonid = req.params.comparisonid;
    $Operation.findOne({ _id: performanceid }).exec().then(function (info) {
        if (info) {
            var selfkksid = info.kksid;
            var comparisons = info.comparisons;
            var comparisonkksid = undefined;
            if (comparisons && Array.isArray(comparisons)) {
                comparisons.map(c => {
                    if (c.id == comparisonid) {
                        comparisonkksid = c.kksid;
                    }
                });
            }
            if (!comparisonkksid) {
                var result = tool.responseFail('0', "comparisonid 参数错误");
                res.json(result);
            }
            var comparisonkksidlist = comparisonkksid.split(",");
            var selfkksidlist = selfkksid.split(",");
            var temp = [];
            var promiselist = [];
            for (let i = 0; i < selfkksidlist.length; i++) {
                let _selfkksid = selfkksidlist[i];
                var _comparkksid = comparisonkksidlist[i];
                var keyself = ["comparison", performanceid, _selfkksid].join(':');
                var keycompar = ["comparison", comparisonid, _comparkksid].join(':');
                var p = new Promise(function (resolve, reject) {
                    Promise.all([$Redis.lrange([keyself, -30 * 24, -1]), $Redis.lrange([keycompar, -30 * 24, -1])]).then(function (data) {
                        // debug('redis Promise data:',data);
                        //获取kksname
                        var _selfkksidpoint = _selfkksid.split('.');
                        var _comparkksidpoint = __comparkksid.split('.');
                        if (_selfkksidpoint.length == 3 && _comparkksidpoint.length == 3) {
                            var pself = $Kksinfo.findOne({ siteid: _selfkksidpoint[0], serverid: _selfkksidpoint[1] }, ["szDesc"]).or([{ shortidstr: _selfkksidpoint[2] }, { shortid: _selfkksidpoint[2] }]).exec();
                            var pcompar = $Kksinfo.findOne({ siteid: _comparkksidpoint[0], serverid: _comparkksidpoint[1] }, ["szDesc"]).or([{ shortidstr: _comparkksidpoint[2] }, { shortid: _comparkksidpoint[2] }]).exec();
                            Promise.all([pself, pcompar]).then(function (kksdata) {
                                resolve({ kksid: _selfkksid, vself: data[0], nameself: kksdata[0] && kksdata[0].szDesc, vcompar: data[1], namecompar: kksdata[1] && kksdata[1].szDesc });
                            });
                        } else {
                            debug('kksid error', _selfkksid, ",", _comparkksid);
                            resolve({ kksid: _selfkksid, vself: data[0], vcompar: data[1] });
                        }
                    }).catch(function (err) {
                        debug('redis Promise err:', err);
                        reject(err);
                    });
                });
                //var p=Promise.all([$Redis.lrange([keyself, -30, -1]), $Redis.lrange([keycompar, -30, -1])]);
                promiselist.push(p);
            }

            Promise.all(promiselist).then(function (data) {
                debug('Promise data:', data);
                var result = tool.responseSuccess(data);
                res.json(result);
            }).catch(function (err) {
                debug('Promise err:', err);
                var result = tool.responseFail('0', err);
                res.json(result);
            })
        } else {
            var result = tool.responseFail('0', "performanceid 参数错误");
            res.json(result);
        }
    }).catch(function (err) {
        var result = tool.responseFail('0', err);
        res.json(result);
    });
});


/**获取未对标 原始信号数据 */
router.get('/singeinfo/:performanceid', function (req, res, next) {
    var performanceid = req.params.performanceid;
    $Operation.findOne({ _id: performanceid }).exec().then(function (info) {
        if (info) {
            var selfkksid = info.kksid;
            var selfkksidlist = selfkksid.split(",");
            var temp = [];
            var promiselist = [];
            for (let i = 0; i < selfkksidlist.length; i++) {
                let _selfkksid=selfkksidlist[i];
                var keyself = ["comparison", performanceid,_selfkksid].join(':');
                var p = new Promise(function (resolve, reject) {
                    $Redis.lrange([keyself, -30 * 24, -1]).then(function (data) {
                        // debug('redis Promise data:',data);
                        var _selfkksidpoint = _selfkksid.split('.');
                        if (_selfkksidpoint.length == 3) {
                            var pself = $Kksinfo.findOne({ siteid: _selfkksidpoint[0], serverid: _selfkksidpoint[1] }, ["szDesc"]).or([{ shortidstr: _selfkksidpoint[2] }, { shortid: _selfkksidpoint[2] }]).exec();
                            pself.then(function (kksinfo) {
                                resolve({ kksid: _selfkksid, vself: data, nameself: kksinfo && kksinfo.szDesc, vcompar: undefined });
                            });
                        } else {
                            debug('kksid error', _selfkksid);
                            resolve({ kksid: _selfkksid, vself: data, vcompar: undefined });
                        }
                    }).catch(function (err) {
                        debug('redis Promise err:', err);
                        reject(err);
                    });
                });
                promiselist.push(p);
            }
            Promise.all(promiselist).then(function (data) {
                //debug('Promise data:', data);
                var result = tool.responseSuccess(data);
                res.json(result);
            }).catch(function (err) {
                debug('Promise err:', err);
                var result = tool.responseFail('0', err);
                res.json(result);
            })
        } else {
            var result = tool.responseFail('0', "performanceid 参数错误");
            res.json(result);
        }
    }).catch(function (err) {
        var result = tool.responseFail('0', err);
        res.json(result);
    });
});

module.exports = router;