
var debug = require('debug')('debug:controllers:sysconfig');
var tool = require('../utils/tool');

exports.get = function (req, res, next) {
    var result = tool.responseSuccess(req._info);
    return res.json(result);
}

exports.getByKey = function (req, res, next, key) {
    $Sysconfig.findOne({ key: key }).exec().then(function (info) {
        if (info) {
            req.$_info = info;
            next();
        } else {
            var result = tool.responseFail('0', 'key无效');
            return res.json(result);
        }
    }).catch(function (err) {
        var result = tool.responseFail('0', '获取数据出错');
        return res.json(result);
    });
}


//计算获取hashmachine 值
exports.getHashMachine = function (level) {  //level 系统级别
    return new Promise(function (resove, reject) {
        if (level < 3) {
            resove(0)
        } else {
            $Sysconfig.findOne({ key: "hashmachine" }).then(function (doc) {
                if (doc) {
                    var _value = doc.value && parseInt(doc.value);
                    var _othervalue = doc.othervalue && doc.othervalue.split(',') || [];
                    if (_value > _othervalue.length) {
                        _othervalue.push(1);
                        doc.othervalue = _othervalue.join(',');
                        doc.save();
                        resove(_othervalue.length);
                    } else {
                        var _min = 1000000;
                        var _index = 0;
                        _othervalue.map(function (v, i) {
                            v = parseInt(v);
                            if (_min > v) {
                                _min = v;
                                _index = i;
                            }
                        })
                        var result = _min + 1;
                        _othervalue[_index] = result;
                        doc.othervalue = _othervalue.join(',');
                        doc.save();
                        resove(_index+1);
                    }
                } else {
                    reject('no doc');
                }
            })
        }
    })
}

