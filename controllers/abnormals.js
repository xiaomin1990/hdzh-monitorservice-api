
var debug = require('debug')('debug:controllers:abnormals');
var tool = require('../utils/tool');

/*
    obj = {
        systemid: "",
        systemname: "",
        operationid: "",
        kksid: "",
        kksname: "",
        time_stamp: "",
        w_condition: "",
        real_value:"",
        upper_value:"",
        lower_value:"",
        level:"",
        error_rate:"",
        time_window:"",
        time_interval:""
        warning:"",
        dangerous:"'"
}
*/

exports.save = function (obj) {
    var _doc = {};
    _doc.operationid = obj.operationid;
    _doc.systemid = obj.systemid;
    _doc.systemname = obj.systemname;
    _doc.kksid = obj.kksid;
    _doc.kksname = obj.kksname;
    _doc.error_rate = obj.error_rate;
    _doc.time_window = obj.time_window;
    _doc.time_interval = obj.time_interval;
    _doc.time_stamp = obj.time_stamp;
    _doc.time_stamp_Hour = parseInt(obj.time_stamp / 1000 / 3600);
    _doc.time_stamp_Day = parseInt(obj.time_stamp / 1000 / 3600 / 24);
    _doc.w_condition = obj.w_condition;
    _doc.real_value = obj.real_value;
    _doc.upper_value = obj.upper_value;
    _doc.lower_value = obj.lower_value;
    _doc.level = obj.level;
    _doc.dangerous_lower = obj.dangerous_lower;
    _doc.dangerous_upper = obj.dangerous_upper;
    _doc.warning_lower = obj.warning_lower;
    _doc.warning_upper = obj.warning_upper;
    _doc.type = obj.type;
    _doc.kpi = obj.kpi;
    return $Abnormals.create(_doc);
}

exports.find = function (query) {
    if (!query) {
        query = { status: 1 }
    }
    return $Catchnotify.find(query).exec();
}

//获取系统异常总时长
exports.getAbnormalPeriod = function (req, res, next) {
    var operationid = req.params.operationid;
    var time_stamp = req.params.time_stamp;
    var time_stamp_day = parseInt(time_stamp / 1000 / 3600 / 24);
    var p2 = $Abnormals.find({ operationid: operationid, time_stamp_Day: time_stamp_day }).exec();
    $Operation.findOne({ _id: operationid }).exec().then(function (doc) {
        var plist = [];
        var _monitoringsignal = doc && doc.monitoringsignal || [];
        _monitoringsignal.map(signal => {
            var p = new Promise(function (resove, reject) {
                $Abnormals.find({ operationid: operationid, kksid: signal.kksid, time_stamp_Day: time_stamp_day }).exec().then(function (docs) {
                    var _result = {}
                    _result.kksid = signal.kksid;
                    _result.warning_upper = signal.warning_upper || 0;
                    _result.warning_lower = signal.warning_lower || 0;
                    _result.dangerous_upper = signal.dangerous_upper || 0;
                    _result.dangerous_lower = signal.dangerous_lower || 0;
                    var _interval = 0;
                    docs.map(info => {
                        _interval += info.time_interval || 0;
                    })
                    _result.abnormal_period = _interval;
                    resove(_result)
                })
            });
            plist.push(p);
        })
        Promise.all(plist).then(function (data) {
            var result = tool.responseSuccess(data);
            res.json(result);

        }).catch(function (err) {
            var result = tool.responseFail('0', err);
            res.json(result);
        });
    })
}

exports.getListGroupBySystem = function (req, res, next) {
    //var time_stamp = req.query.time_stamp && parseInt(req.query.time_stamp / 1000 / 3600 / 24) || parseInt(new Date().getTime() / 1000 / 3600 / 24);
    var time_stamp = req.query.time_stamp || new Date().getTime();
    var parentsystemid = req.params.parentsystemid;
    $Systeminfo.find({ parent: parentsystemid }, ["_id", "name"]).exec().then(function (docs) {
        var plist = [];
        docs.map(doc => {
            var p = new Promise(function (resove, reject) {
                $Abnormals.find({ systemid: doc._id,time_stamp:{$gte: time_stamp-1000*3600*24, $lte: time_stamp} }, ["kksid", "time_interval", "type"]).exec().then(function (abnormals) {
                    var systemlist = [];
                    var temp = {};
                    var level1temp = {};
                    var level2temp = {};
                    var level3temp = {};
                    abnormals.map(info => {
                        if (!temp[info.kksid]) {
                            temp[info.kksid] = true;
                        }
                        var _val = 0
                        switch (info.type) {
                            case 1:
                                _val = level1temp[info.kksid] || 0;
                                _val += info.time_interval
                                level1temp[info.kksid] = _val;
                                break;
                            case 2:
                                _val = level2temp[info.kksid] || 0;
                                _val += info.time_interval
                                level2temp[info.kksid] = _val;
                                break;
                            case 3:
                                _val = level3temp[info.kksid] || 0;
                                _val += 1
                                level3temp[info.kksid] = _val;
                                break;
                        }
                    })
                    var rest = {};
                    var num = 0;
                    Object.keys(temp).forEach(key => {
                        rest.Period = level1temp[key];
                        rest.warning_period = level2temp[key];
                        rest.dangerous_num = level3temp[key];
                        rest.systemid = doc._id;
                        rest.systemname = doc.name;
                    })
                    resove(rest);
                });
            })
            plist.push(p);
        })
        Promise.all(plist).then(function (data) {
            var temp = [];
            data.map(d => {
                if (d && d.systemid) {
                    temp.push(d);
                }
            })
            var result = tool.responseSuccess(temp);
            res.json(result);
        }).catch(function (err) {
            var result = tool.responseFail('0', err);
            res.json(result);
        });
    });
}

exports.list = function (req, res, next) {
    var time_stamp = req.query.time_stamp || new Date().getTime();
    //req.query.time_stamp && parseInt(req.query.time_stamp / 1000 / 3600) || parseInt(new Date().getTime() / 1000 / 3600);
    var systemid = req.params.systemid;
    $Abnormals.find({ systemid: systemid,time_stamp:{$gte: time_stamp-1000*3600, $lte: time_stamp}}, ["kksid", "kksname", "time_stamp", "real_value", "upper_value", "lower_value", "level", "kpi"]).sort({ time_stamp: 1 }).exec().then(function (docs) {
        var rest = {};
        docs.map(doc => {
            if (rest[doc.kksid]) {
                var temp = rest[doc.kksid];
                temp.level = doc.level;
                temp.kksname = doc.kksname;
                temp.points.push({ time_stamp: doc.time_stamp, real_value: doc.real_value, upper_value: doc.upper_value, lower_value: doc.lower_value, kpi: doc.kpi });
                rest[doc.kksid] = temp;
            } else {
                var temp = {};
                temp.level = doc.level;
                temp.kksname = doc.kksname;
                temp.points = [];
                temp.points.push[{ time_stamp: doc.time_stamp, real_value: doc.real_value, upper_value: doc.upper_value, lower_value: doc.lower_value, kpi: doc.kpi }];
                rest[doc.kksid] = temp;
            }
        })
        var result = tool.responseSuccess(rest);
        res.json(result);
    }).catch(function (err) {
        var result = tool.responseFail('0', err);
        res.json(result);
    })
}

exports.getListGroupByDay = function (req, res, next) {

    var time_stamp = req.query.time_stamp && new Date(req.query.time_stamp) || new Date().getTime();
    //req.query.time_stamp && parseInt(req.query.time_stamp / 1000 / 3600 / 24) || parseInt(new Date().getTime() / 1000 / 3600 / 24);
    var time_stamp_day = parseInt(time_stamp / 1000 / 3600 / 24);
    var systemid = req.params.systemid;
    $Abnormals.find({ systemid: systemid,time_stamp:{$gte: time_stamp-1000*3600*24, $lte: time_stamp} }, ["time_stamp_Hour"]).exec().then(function (docs) {
        // var localnowtime = new Date(time_stamp).toLocaleDateString();
        // var utcTime = new Date(localnowtime).getTime();
        var rest = {};
        for (var i = 24; i > 0; i--) {
            var _timestamp = parseInt((time_stamp - 1000 * 3600 * i) / 1000 / 3600);
            rest[_timestamp] = 0;
        }
        var timelist = [];
        docs.map(doc => {
            if (timelist.indexOf(doc.time_stamp_Hour) < 0) {
                timelist.push(doc.time_stamp_Hour);
            }
        })
        timelist.map(info => {
            info=info.toString();
            if (Object.keys(rest).indexOf(info) > -1) {
                rest[info] = 1;
            }
        });
        var temp={};
        Object.keys(rest).forEach(function(key){
             var newkey=parseInt(key) * 1000 * 3600;
             temp[newkey]=rest[key];
        })
        var result = tool.responseSuccess(temp);
        res.json(result);
    }).catch(function (err) {
        var result = tool.responseFail('0', err);
        res.json(result);
    })
}

