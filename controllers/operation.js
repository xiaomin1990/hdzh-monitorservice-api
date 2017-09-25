var debug = require('debug')('debug:controllers:operation');
var tool = require('../utils/tool');



exports.list = function (req, res, next) {
    var retrain = req.query.retrain;
    var doneread = req.query.doneread;
    var donetrain = req.query.donetrain;
    var status = req.query.status;
    var type = req.query.type;
    var systemid = req.query.systemid;
    var query = req.$query || {};
    if (tool.NotNullAndUndefind(type)) query.type = type;
    if (tool.NotNullAndUndefind(systemid)) query.systemid = systemid;
    if (tool.NotNullAndUndefind(retrain)) query.retrain = retrain;
    if (tool.NotNullAndUndefind(doneread)) query.doneread = doneread;
    if (tool.NotNullAndUndefind(donetrain)) query.donetrain = donetrain;
    if (tool.NotNullAndUndefind(status)) query.status = status;
    $Operation.find(query, []).exec().then(function (docs) {
        var result = tool.responseSuccess(docs);
        return res.json(result);
    }).catch(function (err) {
        var result = tool.responseFail('0', err);
        return res.json(result);
    });
}

exports.update = function (req, res, next) {
    var kksid, monitoringsignal;
    var output = req.body.output;
    var input = req.body.input;
    var level = req.body.level;
    var name = req.body.name;
    var time_interval = req.body.time_interval;
    var time_window = req.body.time_window;
    var error_rate = req.body.error_rate;
    var retrain = req.body.retrain;
    var auto_learn=req.body.auto_learn;
    var doneread = req.body.doneread;
    var donetrain = req.body.donetrain;
    var status = req.body.status;
    var start_time = req.body.start_time;
    var end_time = req.body.end_time;
    var description = req.body.description;
    var memory_period = req.body.memory_period;
    var prediction_same = req.body.prediction_same;

    if (output || input) {
        //匹配Kks
        kksid = tool.getkksid(output, input);
    } else {
        monitoringsignal = req.body.monitoringsignal && tool.JSONParse(req.body.monitoringsignal); //[{name:””,kksid:””,kpi:"",level:"",wcondition:""}], 监测信号
    }

    var info = req._info;
    if (tool.NotNullAndUndefind(kksid)) info.kksid = kksid;
    if (tool.NotNullAndUndefind(output)) info.output = output;
    if (tool.NotNullAndUndefind(input)) info.input = input;
    if (tool.NotNullAndUndefind(level)) info.level = level;
    if (tool.NotNullAndUndefind(monitoringsignal) && Array.isArray(monitoringsignal)) info.monitoringsignal = monitoringsignal;
    if (tool.NotNullAndUndefind(name)) info.name = name;
    if (tool.NotNullAndUndefind(time_interval)) info.time_interval = time_interval;
    if (tool.NotNullAndUndefind(time_window)) info.time_window = time_window;
    if (tool.NotNullAndUndefind(error_rate)) info.error_rate = error_rate;
    if (tool.NotNullAndUndefind(retrain)) {
        info.retrain = retrain;
        $Catchnotify.update({ operationid: info._id }, { $set: { status: 0 } },function(){});
    }
    if(tool.NotNullAndUndefind(auto_learn)) info.auto_learn=auto_learn;
    if (tool.NotNullAndUndefind(doneread)) info.doneread = doneread;
    if (tool.NotNullAndUndefind(donetrain)) info.donetrain = donetrain;
    if (tool.NotNullAndUndefind(status)) info.status = status;
    if (tool.NotNullAndUndefind(start_time)) info.start_time = start_time;
    if (tool.NotNullAndUndefind(end_time)) info.end_time = end_time;
    if (tool.NotNullAndUndefind(description)) info.description = description;
    if (tool.NotNullAndUndefind(memory_period)) info.memory_period = memory_period;
    if (tool.NotNullAndUndefind(prediction_same)) info.prediction_same = prediction_same;
    try {
        info.save();
        var result = tool.responseSuccess(info);
        return res.json(result);
    } catch (err) {
        var result = tool.responseFail('0', err);
        return res.json(result);
    }
}

//配置kks信息 time_windown error_rate 等
exports.setconfigure = function (req, res, next) {
    var operationid = req.params.operationid;
    var kksid = req.params.kksid;
    var level = req.body.level;
    var time_window = req.body.time_window;
    var error_rate = req.body.error_rate;
    var warning_upper = req.body.warning_upper;
    var warning_lower = req.body.warning_lower;
    var dangerous_upper = req.body.dangerous_upper;
    var dangerous_lower = req.body.dangerous_lower;
    var alarm_upper = req.body.alarm_upper;  //是否上限报警
    var alarm_lower = req.body.alarm_lower;  //是否下限报警
    var istrain = req.body.istrain || 0;
    // if (!time_window || !error_rate || !level) {
    //     var result = tool.responseFail('0', '参数错误');
    //     return res.json(result);
    // }
    var upset = {};
    if (tool.NotNullAndUndefind(time_window)) upset["monitoringsignal.$.time_window"] = time_window;
    if (tool.NotNullAndUndefind(error_rate)) upset["monitoringsignal.$.error_rate"] = error_rate;
    if (tool.NotNullAndUndefind(level)) upset["monitoringsignal.$.level"] = level;
    if (tool.NotNullAndUndefind(warning_upper)) upset["monitoringsignal.$.warning_upper"] = warning_upper;
    if (tool.NotNullAndUndefind(warning_lower)) upset["monitoringsignal.$.warning_lower"] = warning_lower;
    if (tool.NotNullAndUndefind(dangerous_upper)) upset["monitoringsignal.$.dangerous_upper"] = dangerous_upper;
    if (tool.NotNullAndUndefind(dangerous_lower)) upset["monitoringsignal.$.dangerous_lower"] = dangerous_lower;
    if (tool.NotNullAndUndefind(alarm_upper)) upset["monitoringsignal.$.alarm_upper"] = alarm_upper;
    if (tool.NotNullAndUndefind(alarm_lower)) upset["monitoringsignal.$.alarm_lower"] = alarm_lower;
    $Operation.update({ "monitoringsignal.kksid": kksid }, upset).then(function (info) {
        if (istrain) {
            $Redis.publish("GetTrainingResult", operationid);
            $Catchnotify.update({ operationid: operationid }, { $set: { status: 0 } },function(){});
        }
        var _res = {
            operationid: operationid,
            kksid: kksid,
            level: level,
            time_window: time_window,
            error_rate: error_rate,
            warning_upper: warning_upper,
            warning_lower: warning_lower,
            dangerous_upper: dangerous_upper,
            dangerous_lower: dangerous_lower
        }
        var result = tool.responseSuccess(_res);
        return res.json(result);
    }).catch(function (err) {
        var result = tool.responseFail('0', err);
        return res.json(result);
    })
}

exports.delete = function (req, res, next) {
    var id = req._info._id;
    $Operation.remove({ _id: id }).then(function () {
        var result = tool.responseSuccess('');
        return res.json(result);
    }).catch(function (err) {
        var result = tool.responseFail('0', err);
        return res.json(result);
    });
}

exports.get = function (req, res, next) {
    var result = tool.responseSuccess(req._info);
    return res.json(result);
}


exports.create = function (req, res, next) {
    var systemid = req.body.systemid;
    var systemname = req.body.systemname;
    var systempath = req.body.systempath;
    var type = req.body.type;
    var hashmachine=req.body.hashmachine;
    if (!systemid || !systemname || !systempath || !type) {
        var result = tool.responseFail('0', '参数错误');
        return res.json(result);
    }
    // debug('params:',systemid,systemname,systempath,type);
    var operationinfo = {};
    operationinfo.systemid = systemid;
    operationinfo.systemname = systemname;
    operationinfo.systempath = systempath;
    operationinfo.type = type;
    operationinfo.hashmachine=hashmachine;
    if (type == 1) {
        operationinfo.output = req.body.output;
        operationinfo.input = req.body.input;
        if (!operationinfo.output && !operationinfo.input) {
            var result = tool.responseFail('0', '参数错误');
            return res.json(result);
        }
        //匹配Kks
        operationinfo.kksid = tool.getkksid(operationinfo.output, operationinfo.input);
    } else {
        operationinfo.monitoringsignal = req.body.monitoringsignal && tool.JSONParse(req.body.monitoringsignal); //[{name:””,kksid:””,kpi:"",level:"",wcondition:""}], 监测信号
        //debug('monitoringsignal:',operationinfo.monitoringsignal,Array.isArray(operationinfo.monitoringsignal));
        if (!operationinfo.monitoringsignal || !Array.isArray(operationinfo.monitoringsignal)) {
            var result = tool.responseFail('0', '参数错误');
            return res.json(result);
        }
    }
    operationinfo.level = req.body.level;
    operationinfo.name = req.body.name;
    operationinfo.time_interval = req.body.time_interval;
    operationinfo.time_window = req.body.time_window;
    operationinfo.error_rate = req.body.error_rate;
    operationinfo.retrain = req.body.retrain;
    operationinfo.auto_learn=req.body.auto_learn;
    operationinfo.doneread = req.body.doneread;
    operationinfo.donetrain = req.body.donetrain;
    operationinfo.memory_period = req.body.memory_period;
    operationinfo.prediction_same = req.body.prediction_same;

    var starttime = new Date();
    starttime.setFullYear(starttime.getFullYear() - 2);
    operationinfo.start_time = req.body.start_time || starttime;
    operationinfo.end_time = req.body.end_time || (new Date());
    operationinfo.description = req.body.description;
    $Operation.create(operationinfo).then(function (operation) {
        var result = tool.responseSuccess(operation);
        return res.json(result);
    }).catch(function (err) {
        var result = tool.responseFail('0', err);
        return res.json(result);
    });

    // $Operation.findOne({ systemid: systemid, type: 2 }).exec().then(function (doc) {
    //     if (doc) {
    //         doc.monitoringsignal = operationinfo.monitoringsignal;
    //         doc.save();
    //         var result = tool.responseSuccess(doc);
    //         return res.json(result);
    //     } else {
    //         $Operation.create(operationinfo);
    //     }
    // }).then(function (operation) {
    //     var result = tool.responseSuccess(operation);
    //     return res.json(result);
    // }).catch(function (err) {
    //     debug(err)
    //     var result = tool.responseFail('0', err);
    //     return res.json(result);
    // });
}

exports.getById = function (req, res, next, id) {
    $Operation.findOne({ _id: id }).exec().then(function (info) {
        if (info) {
            req._info = info;
            next();
        } else {
            var result = tool.responseFail('0', 'id无效');
            return res.json(result);
        }
    }).catch(function (err) {
        var result = tool.responseFail('0', '获取数据出错');
        return res.json(result);
    });
}

exports.evaluation = function (req, res, next) {
    var ids = req.params.ids;
    if (!ids) {
        var result = tool.responseFail('0', '参数错误');
        return res.json(result);
    }
    debug('ids:', ids);
    $Redis.publish('evaluation:operation', ids).then(function (info) {
        debug('publish:', info);
        var result = tool.responseSuccess(info);
        return res.json(result);
    }).catch(function (err) {
        var result = tool.responseFail('0', err);
        return res.json(result);
    });
}





