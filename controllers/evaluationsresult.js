var debug = require('debug')('debug:controllers:evaluationsresult');
var tool = require('../utils/tool');



exports.list = function (req, res, next) {
    var operationid = req.params.operationid;
    $Evaluationsresult.find({ operationid: operationid }).exec().then(function (docs) {
        var result = tool.responseSuccess(docs);
        return res.json(result);
    }).catch(function (err) {
        var result = tool.responseFail('0', err);
        return res.json(result);
    })
}

exports.create = function (req, res, next) {
    var data = req.body.data;
    var type = req.body.type;
    if (!data || !type) {
        var result = tool.responseFail('0', '参数错误');
        return res.json(result);
    }
    try {
        var info = JSON.parse(data);
        var operationid = info.operationid;
        var kkses = info.kkses;
        var kksname = info.kksname;
        var vals = info.vals;
        var otherids = info.otherids;
        var othernames = info.othernames;
        $Evaluationsresult.findOne({ operationid: operationid, type: type }).exec().then(function (doc) {
            if (doc) {
                if (tool.NotNullAndUndefind(kkses)) doc.kkses = kkses;
                if (tool.NotNullAndUndefind(kksname)) doc.kksname = kksname;
                if (tool.NotNullAndUndefind(vals)) doc.vals = vals;
                if (tool.NotNullAndUndefind(otherids)) doc.otherids = otherids;
                if (tool.NotNullAndUndefind(othernames)) doc.othernames = othernames;
                doc.save();
            } else {
                info.type = type;
                return $Evaluationsresult.create(info);
            }
        }).then(function (doc) {
            var result = tool.responseSuccess(doc);
            return res.json(result);
        });
    }
    catch (err) {
        var result = tool.responseFail('0', '参数格式错误');
        return res.json(result);
    }
}

//查看训练结果
exports.trainingresults = {
    create: function (req, res, next) {
        var systemid = req.body.systemid;
        var data = req.body.data;
        try {
            var begintime = new Date().getTime();
            data = tool.JSONParse(data);
            var _put = [];
            if (data && Array.isArray(data)) {
                data.map(info => {
                    if (info) {
                        var valobj = tool.JSONParse(info);
                        var time_stamp = valobj.time_stamp;
                        var _row = ["trainingresults", systemid, parseInt(time_stamp / 1000 / 3600)].join("_");  //
                        var _column = ["op", time_stamp].join(":");
                        _put.push({ key: _row, column: _column, '$': info });
                    }
                })
            }
            var endtime = new Date().getTime();
            debug('endtime-begintime:', endtime - begintime);
            $HbaseClient.table('operationpoint_abnormal').row(null).put(_put, function (err) {
                if (err) {
                    var result = tool.responseFail('0', err);
                    return res.json(result);
                }
                else {
                    var result = tool.responseSuccess("");
                    return res.json(result);
                }
            });
            // $HbaseClient.table('operationpoint_abnormal').row(null).put(_put,function(){})
            // var result = tool.responseSuccess("");
            // return res.json(result);

        } catch (err) {
            debug('err:', err);
            var result = tool.responseFail('0', "未知异常");
            return res.json(result);
        }
    },
    alarmCreate: function (req, res, next) {
        var systemid = req.body.systemid;
        var data = req.body.data;
        try {
            var _row = ["trainingresults_report", systemid].join("_");  //
            var _column = ["op", "report"].join(":");
            $HbaseClient.table("operationpoint_abnormal").row(_row).put(_column, data, function (err, success) {
                if (err) {
                    var result = tool.responseFail('0', err);
                    return res.json(result);
                } else {
                    var result = tool.responseSuccess("");
                    return res.json(result);
                }
            });
        } catch (err) {
            var result = tool.responseFail('0', "未知异常");
            return res.json(result);
        }
    },
    list: function (req, res, next) {
        var systemid = req.params.systemid;
        var time_stamp = req.query.time_stamp && parseInt(req.query.time_stamp / 1000 / 3600) || parseInt(new Date().getTime() / 1000 / 3600)
        var nowtime = new Date();
        var _row = ["trainingresults", systemid, time_stamp].join("_");
        var _column = "op:";
        $HbaseClient.table("operationpoint_abnormal").row(_row).get(["op"], function (err, rows) {
            if (err) {
                var result = tool.responseFail('0', err);
                return res.json(result);
            } else {
                var temp = {};
                rows.map(info => {
                    var _val = tool.JSONParse(info.$);
                    if (typeof _val === "string") _val = JSON.parse(_val);
                    var kkslist = _val && _val.kks || [];
                    var real_values = _val && _val.real_value || [];
                    var upper_values = _val && _val.upper_value || [];
                    var lower_values = _val && _val.lower_value || [];
                    var w_condition = _val.w_condition && parseInt(_val.w_condition) || 0;

                    kkslist.forEach((kksid, i) => {
                        // var ret = {}
                        // ret.time_stamp = _val.time_stamp;
                        // ret.real_value = real_values[i];
                        // ret.upper_value = upper_values[i];
                        // ret.lower_value = lower_values[i];
                        // ret.w_condition = w_condition;
                        // if ((ret.lower_value != 0 && ret.upper_value != 0) && (ret.real_value < ret.lower_value || ret.real_value > ret.upper_value)) {
                        //     ret.redpoint = _val;
                        // }
                        var retlist = [];
                        retlist.push(_val.time_stamp);
                        retlist.push(real_values[i]);
                        retlist.push(upper_values[i]);
                        retlist.push(lower_values[i]);
                        retlist.push(w_condition);

                        if (temp[kksid]) {
                            temp[kksid].push(retlist);
                        } else {
                            temp[kksid] = [retlist];
                        }
                    });
                });
                
                var result = tool.responseSuccess(temp);
                return res.json(result);
            }
        });
    },
    alarmlist: function (req, res, next) {
        var systemid = req.params.systemid;
        var _row = ["trainingresults_report", systemid].join("_");
        var _column = ["op", "report"].join(":");
        $HbaseClient.table("operationpoint_abnormal").row(_row).get(_column, function (err, rows) {
            if (err) {
                var result = tool.responseFail('0', err);
                return res.json(result);
            } else {
                var temp = rows[0].$;
                var result = tool.responseSuccess(temp);
                return res.json(result);
            }
        });
    },
    delete: function (req, res, next) {
        var systemid = req.params.systemid;
        var promiselist = [];
        $Operation.findOne({ systemid: systemid, type: 2 }, ["start_time", "end_time"]).exec().then(function (doc) {
            if (doc) {
                var start_time = doc.start_time && parseInt(doc.start_time.getTime() / 100 / 3600);
                var end_time = doc.end_time && parseInt(doc.end_time.getTime() / 100 / 3600);
                for (let i = start_time; i <= end_time; i++) {
                    var p = new Promise(function (resove, reject) {
                        var _row = ["trainingresults", systemid, start_time].join("_");
                        $HbaseClient.table("operationpoint_abnormal").row(_row).delete(function (err, success) {
                            resove();
                        });
                    });
                    promiselist.push(p);
                }
                Promise.all(promiselist).then(function (data) {
                    var result = tool.responseSuccess("");
                    return res.json(result);
                }).catch(function (err) {
                    var result = tool.responseFail('0', err);
                    return res.json(result);
                });
            } else {
                var result = tool.responseFail('0', "参数错误");
                return res.json(result);
            }
        })
    }
}



// evaluation:relation 
// {
//     "isSuccess": 0, 
//     "kkses": ["TJBJSIS.DCS1PUSH.AI00004", "TJBJSIS.DCS1PUSH.AI00005", "TJBJSIS.DCS1PUSH.AI00003", "TJBJSIS.DCS1PUSH.AI00002"], 
//     "vals": [[NaN, NaN, NaN, NaN], [NaN, NaN, NaN, NaN], [NaN, NaN, NaN, NaN], [NaN, NaN, NaN, NaN]], 
//     "kksname": ["\u4e3b\u53d8\u538b\u5668A\u76f8\u6cb9\u6e29\u5ea6\u8ba1\u6e29\u5ea6", "\u4e3b\u53d8\u538b\u5668B\u76f8\u6cb9\u6e29\u5ea6\u8ba1\u6e29\u5ea6", "\u4e3b\u53d8\u538b\u5668C\u76f8\u6cb9\u6e29\u5ea6\u8ba1\u6e29\u5ea6", "\u4e3b\u53d8\u538b\u5668B\u76f8\u6cb9\u6e29\u5ea6\u8ba1\u6e29\u5ea6"], 
//     "operationid": "599f95b9cd8a5f65b2ab3a05"
// }

// evaluation:importances 
// {
//     "kkses": ["TJBJSIS.DCS1PUSH.AI00004", "TJBJSIS.DCS1PUSH.AI00005", "TJBJSIS.DCS1PUSH.AI00002"], 
//     "operationid": "599f95b9cd8a5f65b2ab3a05", 
//     "kksname": ["\u4e3b\u53d8\u538b\u5668A\u76f8\u6cb9\u6e29\u5ea6\u8ba1\u6e29\u5ea6", "\u4e3b\u53d8\u538b\u5668B\u76f8\u6cb9\u6e29\u5ea6\u8ba1\u6e29\u5ea6", "\u4e3b\u53d8\u538b\u5668B\u76f8\u6cb9\u6e29\u5ea6\u8ba1\u6e29\u5ea6"], 
//     "otherids": [["TJBJSIS.DCS1PUSH.AI00005", "TJBJSIS.DCS1PUSH.AI00003", "TJBJSIS.DCS1PUSH.AI00002"], ["TJBJSIS.DCS1PUSH.AI00004", "TJBJSIS.DCS1PUSH.AI00003", "TJBJSIS.DCS1PUSH.AI00002"], ["TJBJSIS.DCS1PUSH.AI00004", "TJBJSIS.DCS1PUSH.AI00005", "TJBJSIS.DCS1PUSH.AI00003"]], 
//     "othernames": [["\u4e3b\u53d8\u538b\u5668B\u76f8\u6cb9\u6e29\u5ea6\u8ba1\u6e29\u5ea6", "\u4e3b\u53d8\u538b\u5668C\u76f8\u6cb9\u6e29\u5ea6\u8ba1\u6e29\u5ea6", "\u4e3b\u53d8\u538b\u5668B\u76f8\u6cb9\u6e29\u5ea6\u8ba1\u6e29\u5ea6"], ["\u4e3b\u53d8\u538b\u5668A\u76f8\u6cb9\u6e29\u5ea6\u8ba1\u6e29\u5ea6", "\u4e3b\u53d8\u538b\u5668C\u76f8\u6cb9\u6e29\u5ea6\u8ba1\u6e29\u5ea6", "\u4e3b\u53d8\u538b\u5668B\u76f8\u6cb9\u6e29\u5ea6\u8ba1\u6e29\u5ea6"], ["\u4e3b\u53d8\u538b\u5668A\u76f8\u6cb9\u6e29\u5ea6\u8ba1\u6e29\u5ea6", "\u4e3b\u53d8\u538b\u5668B\u76f8\u6cb9\u6e29\u5ea6\u8ba1\u6e29\u5ea6", "\u4e3b\u53d8\u538b\u5668C\u76f8\u6cb9\u6e29\u5ea6\u8ba1\u6e29\u5ea6"]],
//     "vals": [[0.0, 0.0, 0.0], [0.0, 0.0, 0.0], [0.0, 0.0, 0.0]]
// }

