
var debug = require('debug')('debug:controllers:catchnotify');
var tool = require('../utils/tool');

/*
    obj = {
        systemid: "",
        systemname: "",
        operationid: "",
        kksid: "",
        kksname: "",
        status: "",
        w_condition: "",
}
*/
exports.save = function (catchnotifyobj) {
    return new Promise(function (resove, reject) {
        $Catchnotify.findOne({ operationid: catchnotifyobj.operationid, kksid: catchnotifyobj.kksid }).exec().then(function (doc) {
            if (doc) {
                doc.status = catchnotifyobj.status;
                doc.w_condition = catchnotifyobj.w_condition;
                doc.real_value = catchnotifyobj.real_value;
                doc.upper_value = catchnotifyobj.upper_value;
                doc.lower_value = catchnotifyobj.lower_value;
                doc.level = catchnotifyobj.level;
                doc.dangerous_lower = catchnotifyobj.dangerous_lower;
                doc.dangerous_upper = catchnotifyobj.dangerous_upper;
                doc.warning_lower = catchnotifyobj.warning_lower;
                doc.warning_upper = catchnotifyobj.warning_upper;
                doc.type = catchnotifyobj.type;
                doc.updatetime = new Date();
                doc.save();
            }
            else {
                $Catchnotify.create(catchnotifyobj);
            }
            resove();
        }).catch(function (err) {
            reject(err);
        });
    });
}

exports.find = function (query) {
    if (!query) {
        query = { status: 1, w_condition: 0 }
    }
    return $Catchnotify.find(query).exec();
}

