
var debug = require('debug')('debug:controllers:systeminfo');
var tool = require('../utils/tool');
var sysconfigCtr = require('../controllers/sysconfig');

exports.list = function (req, res, next) {
    var query = req.$query || {};
    $Systeminfo.find(query).exec().then(function (docs) {
        var result = tool.responseSuccess(docs);
        return res.json(result);
    }).catch(function (err) {
        var result = tool.responseFail('0', err);
        return res.json(result);
    })
}

exports.update = function (req, res, next) {
    var name = req.body.name;
    var info = req._info;
    if (tool.NotNullAndUndefind(name)) info.name = name;
    try {
        info.save();
        var result = tool.responseSuccess(info);
        return res.json(result);
    } catch (err) {
        var result = tool.responseFail('0', err);
        return res.json(result);
    }
}

exports.delete = function (req, res, next) {
    var id = req._info._id;
    var promiselist = [];
    promiselist.push($Systeminfo.remove({ _id: id }));
    promiselist.push($Operation.remove({ systemid: id }));
    Promise.all(promiselist).then(function () {
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
    var name = req.body.name;
    var parent = req.body.parent;
    var path = req.body.path;
    var level = req.body.level; //[1,2,3,4,5...]
    debug('name:', name, ",parent:", parent, ",path:", path, ",level:", level);
    if (!tool.NotNullAndUndefind(name) || !tool.NotNullAndUndefind(parent) || !tool.NotNullAndUndefind(path) || !tool.NotNullAndUndefind(level)) {
        var result = tool.responseFail('0', '参数错误');
        return res.json(result);
    }
    var tempinfo = {};
    tempinfo.name = name;
    tempinfo.parent = parent;
    tempinfo.path = path;
    tempinfo.type = req.body.type || 1;
    tempinfo.level = level;
    // tempinfo.inlevel = req.body.inlevel;
    // tempinfo.time_interval = req.body.time_interval;
    // tempinfo.time_window = req.body.time_window;
    // tempinfo.error_rate = req.body.error_rate;
    // tempinfo.retrain = req.body.retrain;
    // tempinfo.doneread = req.body.doneread;
    // tempinfo.donetrain = req.body.donetrain;
    // tempinfo.start_time = req.body.start_time;
    // tempinfo.end_time = req.body.end_time;
    $Systeminfo.findOne({ name: name, parent: parent }).exec().then(function (info) {
        if (info) {
            var errormsg = [name, ",已经存在"].join('');
            var result = tool.responseFail('0', errormsg);
            return res.json(result);
        }
        //return $Systeminfo.create(tempinfo);
        return sysconfigCtr.getHashMachine(level);
    }).then(function (hashmachine) {
        tempinfo.hashmachine = hashmachine;
        return $Systeminfo.create(tempinfo);
    }).then(function (sysinfo) {
        var result = tool.responseSuccess(sysinfo);
        return res.json(result);
    }).catch(function (err) {
        var result = tool.responseFail('0', err);
        return res.json(result);
    });
}

exports.getById = function (req, res, next, id) {
    $Systeminfo.findOne({ _id: id }).exec().then(function (info) {
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

exports.getByParent = function (req, res, next) {
    var parentid = req.params.parentid
    $Systeminfo.find({ parent: parentid }).exec().then(function (list) {
        var result = tool.responseSuccess(list);
        return res.json(result);
    }).catch(function (err) {
        debug('/parent error ', err);
        var result = tool.responseFail('0', err);
        return res.json(result);
    })
}