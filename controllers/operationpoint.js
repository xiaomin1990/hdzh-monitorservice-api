var debug = require('debug')('debug:controllers:operationpoint');
var tool = require('../utils/tool');
var pako = require('pako');

//性能
exports.performance = {
    create: function (req, res, next) {
        var id = req.body.id;
        var time_stamp = req.body.time_stamp;
        var data = req.body.data;
        try {
            var dataObj = JSON.parse(data);
            if (dataObj && Object.keys(dataObj).length > 0) {
                dataObj.time_stamp_day = parseInt(dataObj.time_stamp / 1000 / 3600 / 24);
                $Operationdata.create(dataObj).then(function () {
                    var result = tool.responseSuccess("");
                    return res.json(result);
                });
            }
        } catch (err) {
            var result = tool.responseFail('0', '数据格式错误');
            return res.json(result);
        }
    },
    sysmonthlist: function (req, res, next) {  //一天为单位获取健康评估性能数据，
        var systemid = req.params.systemid;
        var pageindex = req.query.pageindex || 0;
        var nowtime = new Date();
        var endmonttimestamp = nowtime.setMonth(nowtime.getMonth() - pageindex);
        var beginmonthtimestamp = nowtime.setMonth(nowtime.getMonth() - 1);
        var ret = {};
        getPerformancesByDay(systemid, null, beginmonthtimestamp, endmonttimestamp, ret).then(function (docs) {
            var result = tool.responseSuccess(docs.data);
            return res.json(result);
        }).catch(function (err) {
            var result = tool.responseFail('0', err);
            return res.json(result);
        })
    },
    sysyearlist: function (req, res, next) {
        var systemid = req.params.systemid;
        var pageindex = req.query.pageindex || 0;
        var nowtime = new Date();
        var endmonttimestamp = nowtime.setFullYear(nowtime.getFullYear() - pageindex);
        var beginmonthtimestamp = nowtime.setFullYear(nowtime.getFullYear() - 1);
        //first get operationids by systemid

        $Operation.find({ systemid: systemid, type: 1 }, ["name"]).exec().then(function (docs) {
            var promiselist = [];
            if (docs) {
                docs.map(doc => {
                    var ret = { operationid: doc._id, name: doc.name };
                    promiselist.push(getPerformancesByDay(null, doc._id, beginmonthtimestamp, endmonttimestamp, ret));
                });
            }
            return Promise.all(promiselist)
        }).then(function (data) {
            //计算总指标 计算各个指标的平均值
            var tempdata = {};
            data.map(d => {
                var _vallist = d.data;
                _vallist.forEach((_value, i) => {
                    if (_value.vresult && _value.vresult != -1) {
                        if (tempdata[_value.time]) {
                            tempdata[_value.time].push(_value.vresult);
                        } else {
                            tempdata[_value.time] = [_value.vresult];
                        }
                    } else {
                        if (!tempdata[_value.time]) {
                            tempdata[_value.time] = [];
                        }
                    }
                });
            });
            var avgdate = [];
            Object.keys(tempdata).forEach((key) => {
                var _val1 = tempdata[key];
                if (_val1 && _val1.length > 0) {
                    avgdate.push({ time: key, vresult: tool.ArraySum(_val1) / _val1.length });
                } else {
                    avgdate.push({ time: key, vresult: -1 });
                }
            });
            data.push({ operationid: "avg", name: "总指标", data: avgdate });
            var result = tool.responseSuccess(data);
            return res.json(result);
        }).catch(function (err) {
            var result = tool.responseFail('0', err);
            return res.json(result);
        });
    },
    yearlist: function (req, res, next) {
        var operationid = req.params.operationid;
        var pageindex = req.query.pageindex || 0;
        var begintime = req.query.begintime;
        var endtime = req.query, endtime;
        if (!begintime || !endtime) {
            var nowtime = new Date();
            endtime = nowtime.setFullYear(nowtime.getFullYear());
            begintime = nowtime.setFullYear(nowtime.getFullYear() - 1);
        }
        $Operationdata.find({ id: operationid, time_stamp: { $gte: begintime, $lte: endtime } }, ["time_stamp", "vresult", "vself", "vcompar"]).sort({ time_stamp: 1 }).exec().then(function (docs) {
            var result = tool.responseSuccess(docs);
            return res.json(result);
        }).catch(function (err) {
            var result = tool.responseFail('0', err);
            return res.json(result);
        });
    },
    yearsignerlist: function (req, res, next) {
        var operationid = req.params.operationid;
        var pageindex = req.query.pageindex || 0;
        var begintime = req.query.begintime;
        var endtime = req.query, endtime;
        if (!begintime || !endtime) {
            var nowtime = new Date();
            endtime = nowtime.setFullYear(nowtime.getFullYear());
            begintime = nowtime.setFullYear(nowtime.getFullYear() - 1);
        }
        // var nowtime = new Date();
        // var endmonttimestamp = nowtime.setFullYear(nowtime.getFullYear() - pageindex);
        // var beginmonthtimestamp = nowtime.setFullYear(nowtime.getFullYear() - 1);
        $Operationdata.find({ id: operationid, time_stamp: { $gte: begintime, $lte: endtime } }, ["kkses", "vals", "time_stamp"]).sort({ time_stamp: 1 }).exec().then(function (docs) {
            var temp = {};
            docs.map(info => {
                var kkseslist = info.kkses || [];
                var valslist = info.vals || [];
                var time_stamp = info.time_stamp;
                kkseslist.forEach((kksid, i) => {
                    if (temp[kksid]) {
                        temp[kksid].push({ time: time_stamp, val: valslist[i] });
                        //temp[kksid].push([time_stamp, valslist[i]]);
                    } else {
                        temp[kksid] = [{ time: time_stamp, val: valslist[i] }];
                        //temp[kksid] = [[time_stamp, valslist[i]]];
                    }
                });
            });
            var kkses = Object.keys(temp);
            temp.kkses = kkses;
            //获取kksname
            var promiselist = [];
            kkses.map(kksid => {
                var kksidlist = kksid.split(".");
                var p = $Kksinfo.findOne({ siteid: kksidlist[0], serverid: kksidlist[1] }).or([{ shortid: kksidlist[2] }, { shortidstr: kksidlist[2] }]).exec();
                promiselist.push(p);
            });
            Promise.all(promiselist).then(function (docs) {
                var kksname = [];
                docs.map(doc => {
                    kksname.push(doc.szDesc);
                });
                temp.kksname = kksname;
                var binaryString = pako.deflate(JSON.stringify(temp), { to: 'string' });
                var result = tool.responseSuccess(binaryString);
                return res.json(result);
            })

        }).catch(function (err) {
            var result = tool.responseFail('0', err);
            return res.json(result);
        });
    },
    delete: function (req, res, next) {
        var operationid = req.params.operationid;
        $Operationdata.remove({ id: operationid }).then(function () {
            var result = tool.responseSuccess("");
            return res.json(result);
        }).catch(function (err) {
            var result = tool.responseFail('0', err);
            return res.json(result);
        })
    }
}

//异常
exports.abnormal = {
    create: function (req, res, next) {
        var result = tool.responseFail('0', "API失效");
        return res.json(result);
    },
    list: function (req, res, next) {
        var systemid = req.params.systemid;
        var time_interval = req.query.time_interval || 10;
        var kks_id = req.query.kksid;
        var nowtime = new Date();
        var endmonttimestamp = req.query.begintime || nowtime.getTime();
        //根据点数和time_interval 计算时间
        var interval = time_interval * 60;
        var beginmonthtimestamp = req.query.endtime || nowtime.setSeconds(nowtime.getSeconds() - interval);
        // var endmonttimestamp = nowtime.setMonth(nowtime.getMonth() - pageindex);
        // var beginmonthtimestamp = nowtime.setMonth(nowtime.getMonth() - 1);
        var _startrow = ["catch", systemid, beginmonthtimestamp].join("_");
        var _endrow = ["catch", systemid, endmonttimestamp].join("_");
        var _column = "op:catch";
        debug(_startrow, _endrow, _column);
        $HbaseClient.table("operationpoint_abnormal").scan({
            startRow: _startrow,
            endRow: _endrow,
            maxVersions: 1,
            column: [_column]
        }, (err, rows) => {
            if (err) {
                var result = tool.responseFail('0', err);
                return res.json(result);
            } else {
                var temp = {};
                rows.map(info => {
                    var _val = tool.JSONParse(info.$);
                    var kkslist = _val && _val.kks || [];
                    var real_values = _val && _val.real_value || [];
                    var upper_values = _val && _val.upper_value || [];
                    var lower_values = _val && _val.lower_value || [];
                    var mean_values = _val && _val.mean_value || [];
                    var w_condition = _val.w_condition && parseInt(_val.w_condition);
                    kkslist.forEach((kksid, i) => {
                        var ret = {}
                        ret.time_stamp = _val.time_stamp;
                        ret.real_value = real_values[i];
                        ret.upper_value = upper_values[i];
                        ret.lower_value = lower_values[i];
                        ret.mean_value = mean_values[i];
                        ret.w_condition = w_condition;
                        if (w_condition == 0 && (ret.lower_value != 0 && ret.upper_value != 0) && (ret.real_value < ret.lower_value || ret.real_value > ret.upper_value)) {
                            ret.redpoint = _val;
                        }
                        if (temp[kksid]) {
                            temp[kksid].push(ret);
                        } else {
                            temp[kksid] = [ret];
                        }
                    });
                });
                var rest = {};
                if (kks_id) {
                    rest = temp[kks_id];
                } else {
                    rest = temp;
                }
                var result = tool.responseSuccess(rest);
                return res.json(result);
            }
        })
    },
    day: function (req, res, next) {
        var systemid = req.params.systemid;
        var nowtime = new Date();
        var currenttimestamp = parseInt(nowtime.getTime() / 1000 / 3600 / 24);
        var key = ["dayratekey", currenttimestamp, systemid].join(":");
        //debug('key:',key);
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
    }
}

function getPerformancesByDay(systemid, operationid, starttime, endtime, ret) {
    return new Promise(function (resove, reject) {
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
        o.query = { time_stamp: { $gte: starttime, $lte: endtime } };
        if (systemid) {
            o.query.systemid = systemid;
        }
        if (operationid) {
            o.query.id = operationid;
        }
        o.sort = { time_stamp: 1 };
        $Operationdata.mapReduce(o, function (err, data) {
            if (err) reject(err);
            var temp = [];
            if (data && Array.isArray(data)) {
                data.map(info => {
                    temp.push(info.value);
                });
            }
            ret.data = temp;
            resove(ret)
        });
    });
}


// abnormal
// {
//     id:"599fb9ba91b213868336bf48",
//     time_stamp:1503819925000,
//     "kks": ["TJBJSIS.DCS1PUSH.10HFB20AF001GT", "TJBJSIS.DCS1PUSH.10HFE52AA101GT", "TJBJSIS.DCS1PUSH.10HFE62AA101GT", "TJBJSIS.DCS1PUSH.10HFE72CP101", "TJBJSIS.DCS1PUSH.10HFE72CT601-SEL", "TJBJSIS.DCS1PUSH.10HFC20CE101", "TJBJSIS.DCS1PUSH.10HFE72CF101-SEL", "TJBJSIS.DCS1PUSH.10HFC20CT311A-SEL", "TJBJSIS.DCS1PUSH.10HFC20DP101", "TJBJSIS.DCS1PUSH.10HFC20AU101GT", "TJBJSIS.DCS1PUSH.10HFC22CP101"], 
//     "kks_name": ["\u7ed9\u7164\u673aB\u77ac\u65f6\u7ed9\u7164\u91cf", "B\u78e8\u70ed\u98ce\u8c03\u6574\u95e8\u4f4d\u7f6e\u53cd\u9988", "B\u78e8\u51b7\u98ce\u8c03\u6574\u95e8\u4f4d\u7f6e\u53cd\u9988", "B\u78e8\u5165\u53e3\u4e00\u6b21\u98ce\u538b\u529b", "B\u78e8\u5165\u53e3\u4e00\u6b21\u98ce\u6e29\u5ea6(2\u9009\u540e", "B\u78e8\u7535\u52a8\u673a\u7535\u6d41", "B\u78e8\u5165\u53e3\u4e00\u6b21\u98ce\u6d41\u91cf(2\u9009\u540e", "B\u78e8\u51fa\u53e3\u98ce\u7c89\u6df7\u5408\u7269\u6e29\u5ea6(3", "B\u78e8\u51fa\u53e3\u4e0e\u4e00\u6b21\u98ce\u5dee\u538b", "\u78e8B\u5206\u79bb\u5668\u53d8\u9891\u5668\u8f6c\u901f\u53cd\u9988", "B\u78e8\u6db2\u538b\u7ad9\u4f9b\u6cb9\u538b\u529b"], 
//     "real_value": [94.41681420213024, 105.2090955248079, 87.2373946377508, 12.963717490336858, 237.86068661402157, 29.89427353325293, 61.171115517941764, 12.025202122682883, 2.3826388311930375, 390.1409779731227, 7.505797000000001], 
//     "upper_value": [91.09823516239597, 101.23289070624332, 93.14407671328193, 13.430777343088053, 416.6136326750517, 53.589130470000306, 117.04354448880724, 23.634848762656905, 4.461164851254517, 669.1209461494465, 13.43768709913684], 
//     "lower_value": [84.47570921277865, 93.56070856300657, 78.9620823575004, 11.679285417762852, 377.5434705571681, 48.50681180553722, 98.49525620109762, 19.693890830494656, 3.8869428882023613, 641.1420322752441, 12.270364653217252], 
//     "mean_value": [97.87664744425076, 109.03669593600304, 90.43324571046682, 13.432739869832467, 438.82961658167295, 55.58709816178002, 113.861281644829, 22.381614957646537, 4.435395447100199, 730.8122071892185, 14.114260766719093]
// }

//  performance 
//  {
//      "id": "59a0d38df752b394f5d51105",
//      "time_stamp":1503819925000,
//      "vresult": 0.7176497669662685, 
//      "systemname": "\u6e29\u5ea6\u6c34\u5e73", 
//      "systempath": ",599f857ccd8a5f65b2ab39fa,599f8587cd8a5f65b2ab39fc,599f8598cd8a5f65b2ab39fe,", 
//      "vself": 42.261025, 
//      "vcompar": 32.19921762664408, 
//      "kkses": ["TJBJSIS.DCS1PUSH.AI01584", "TJBJSIS.DCS1PUSH.10HFC10CE101"], 
//      "vals": [42.261025, 65.151543]
// }