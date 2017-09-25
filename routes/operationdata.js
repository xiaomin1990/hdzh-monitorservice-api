var express = require('express');
var debug = require('debug')('debug:routes:operationdata');
var tool = require('../utils/tool');
var router = express.Router();

/* GET users listing. */
router.get('/:id', function (req, res, next) {
    var id = req.params.id;
    $Operationdata.findOne({ _id: id }).exec().then(function (info) {
        var result = tool.responseSuccess(info);
        res.json(result);
    }).catch(function (err) {
        var result = tool.responseFail('0', err);
        res.json(result);
    });
});

router.get('/list/:systemid/:inlevel/:kpi', function (req, res, next) {
    var systemid = req.params.systemid;
    var inlevel = req.params.inlevel;
    var kpi = req.params.kpi;
    var pageindex = req.query.pageindex && parseInt(req.query.pageindex) || 0;  //当前月为0  上一个月为 -1 依次类推
    if (inlevel == 41) {
        var nowtime = new Date();
        var endtime = nowtime.setMonth(nowtime.getMonth() + pageindex);
        var endmonttimestamp = parseInt(endtime / 1000 / 3600);
        var beginmonthtime = nowtime.setMonth(nowtime.getMonth() - 1);
        var beginmonthtimestamp = parseInt(beginmonthtime / 1000 / 3600);
        var o = {};
        o.map = function () { emit(this.performanceid, { time: this.time_stamp, val: this.vresult }) };
        o.reduce = function (k, values) {
            var _time=[];
            var _vresult=[];
            values.map(info => {
                _time.push(info.time);
                _vresult.push(info.val);
            });
            return {time:_time.join(','),val:_vresult.join(',')};
        };
        o.query = { systemid: systemid, time_stamp: { $gte: beginmonthtimestamp, $lte: endmonttimestamp } };
        o.sort = { time_stamp: 1 };
        //o.limit = 30;
        $Operationdata.mapReduce(o, function (err, data) {
            var result = tool.responseSuccess(data);
            res.json(result);
        });
    }
    if (inlevel == 42) {
        var daystamp = parseInt(new Date().getTime() / 1000 / 3600 / 24);
        $Operation.find({ systemid: systemid, kpi: kpi }).sort({ time_stamp: -1 }).limit(30).exec().then(function (list) {
            var promiselist = [];
            list.map(info => {
                var key = [info._id, daystamp].join(':');
                var p = new Promise(function (resolve, reject) {
                    $Redis.lrange([key, -30, -1], function (err, result) {
                        if (err) reject(err);
                        var dst = { id: info._id, list: result };
                        resolve(dst);
                    });
                });
                promiselist.push(p);
            });
            Promise.all(promiselist).then(function (data) {
                var result = tool.responseSuccess(data);
                res.json(result);
            });
        }).catch(function (err) {
            var result = tool.responseFail('0', err);
            res.json(result);
        });
    }
});

//systemid type=41
router.get('/sysmonthlist/:systemid', function (req, res, next) {
    var systemid = req.params.systemid;
    var nowtime = new Date();
    var currenttimestamp = parseInt(nowtime.getTime() / 1000 / 3600);
    var prvemonthtime = nowtime.setMonth(nowtime.getMonth() - 1);
    var prvemonthtimestamp = parseInt(prvemonthtime / 1000 / 3600);
    var o = {};
    o.map = function () { emit(this.time_stamp_day, { time: this.time_stamp_day, vresult: this.vresult }) };
    o.reduce = function (k, vals) {

        var len = 0;
        var nulllen = 0;
        var sum = 0;
        vals.map(info => {
            //业务需求,info=-1 不计算平均值，如果vals 全部为-1 则返回-1.
            if (info.vresult != -1) {
                sum += info.vresult;
                len++;
            } else {
                nulllen++;
            }
        })
        if (nulllen == vals.length) {
            return { time: k, vresult: -1 };
        } else {
            var _val = sum / len;
            return { time: k, vresult: _val }
        }
    };
    o.query = { systemid: systemid, time_stamp: { $gte: prvemonthtimestamp, $lte: currenttimestamp } };
    o.sort = { time_stamp: 1 };
    $Operationdata.mapReduce(o, function (err, data) {
        // debug('data:',data);
        var temp = [];
        if (data && Array.isArray(data)) {
            data.map(info => {
                temp.push(info.value);
            });
        }
        //if(temp.length==0) debug('=====temp is null======');
        var result = tool.responseSuccess(temp);
        res.json(result);
    });
});

//systemid type=42
router.get('/sysdaylist/:systemid', function (req, res, next) {
    var systemid = req.params.systemid;
    var nowtime = new Date();
    var currenttimestamp = parseInt(nowtime.getTime() / 1000 / 3600 / 24);
    var key = ["dayratekey", currenttimestamp, systemid].join(":");
    $Redis.lrange(key, [0, -1], function (err, data) {
        var temp = [];
        data.map(info => {
            if (temp.indexOf(info) < 0) {
                temp.push(info);
            }
        })
        var result = tool.responseSuccess(temp);
        res.json(result);
    });
});

router.get('/maxtimestamp/:systemid', function (req, res, next) {
    var systemid = req.params.systemid;
    $Operationdata.findOne({ systemid: systemid }).sort({ time_stamp: -1 }).exec().then(function (info) {
        var result = tool.responseSuccess(info);
        res.json(result);
    }).catch(function (err) {
        var result = tool.responseFail('0', err);
        res.json(result);
    });
});

router.post('/', function (req, res, next) {
    //data=[{systemid:"",systemname:"",systempath:"",time_stamp:"",vpre:"",vtrue:"",vresult:"",type:2}]
    var performanceid = req.body.performanceid;
    var systemid = req.body.systemid;
    var systemname = req.body.systemname;
    var systempath = req.body.systempath;
    var time_stamp = req.body.time_stamp;
    var time_stamp_day = parseInt(time_stamp / 24);
    var vpre = req.body.vpre;
    var vtrue = req.body.vtrue;
    var vresult = req.body.vresult;
    var type = req.body.type || 2;
    var info = { performanceid: performanceid, systemid: systemid, systemname: systemname, systempath: systempath, time_stamp: time_stamp, time_stamp_day: time_stamp_day, vpre: vpre, vtrue: vtrue, vresult: vresult, type: type }
    $Operationdata.create(info).then(function () {
        var result = tool.responseSuccess(null);
        res.json(result);
    }).catch(function (err) {
        var result = tool.responseFail('0', err);
        res.json(result);
    });
});

router.post('/batch', function (req, res, next) {
    //data=[{systemid:"",systemname;"",systempath:"",time_stamp:"",vpre:"",vtrue:"",vresult:"",type:1}]
    var data = req.body.data;
    if (data && Array.isArray(data)) {
        $Operationdata.create(data).then(function () {
            var result = tool.responseSuccess(null);
            res.json(result);
        }).catch(function (err) {
            var result = tool.responseFail('0', err);
            res.json(result);
        });
    } else {
        var result = tool.responseFail('0', '参数错误');
        res.json(result);
    }
});


router.delete('/:id', function (req, res, next) {
    var id = req.params.id;
    $Operationdata.remove({ _id: id }).then(function () {
        var result = tool.responseSuccess();
        res.json(result);
    }).catch(function (err) {
        var result = tool.responseFail('0', err);
        res.json(result);
    });
});


module.exports = router;
