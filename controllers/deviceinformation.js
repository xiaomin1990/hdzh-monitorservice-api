
var debug = require('debug')('debug:controllers:deviceinformation');
var tool = require('../utils/tool');


exports.working = {
    save: function (deviceinfo) {
        return new Promise(function (resove, reject) {
            $Deviceinformation.findOne({ ip_address: deviceinfo.ip_address }).exec().then(function (doc) {
                if (doc) {
                    doc.disk_usage = deviceinfo.disk_usage;
                    doc.cpu_usage = deviceinfo.cpu_usage;
                    doc.ram_usage = deviceinfo.ram_usage;
                    doc.cpu_current_temp = deviceinfo.cpu_current_temp;
                    doc.cpu_high_temp = deviceinfo.cpu_high_temp;
                    doc.cpu_critical_temp = deviceinfo.cpu_critical_temp;
                    doc.updatetime = new Date();
                    doc.save();
                    resove(doc);
                }
                else {
                    return $Deviceinformation.create(deviceinfo);
                }
            }).then(function (doc) {
                resove(doc);
            }).catch(function (err) {
                reject(err);
            });
        });
    },
    find: function (query) {
        if (!query || typeof (query) != "object") {
            query = {}
        }
        return new Promise(function (resove, reject) {
            $Deviceinformation.find(query).exec().then(function (docs) {
                resove(docs);
            }).catch(function (err) {
                reject(err);
            });
        });
    },
    findOne: function (query) {
        if (!query || typeof (query) != "object") {
            query = {}
        }
        return new Promise(function (resove, reject) {
            $Deviceinformation.findOne(query).exec().then(function (doc) {
                resove(doc);
            }).catch(function (err) {
                reject(err);
            });
        });
    }
}

