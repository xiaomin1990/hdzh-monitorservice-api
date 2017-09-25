
'use strict';

const debug = require('debug')('debug:job:setsysteminfoperformance');
var schedule = require("node-schedule");
var IJob = require('./ijob');

//https://www.npmjs.com/package/node-schedule

var setSysteminfoPerformance = module.exports = function () {
    this.cron = "*/10 * * * *";   //每10分钟执行一次
}

setSysteminfoPerformance.prototype = new IJob();

setSysteminfoPerformance.prototype.run = function () {
    debug("setSysteminfoPerformance run ...");
    schedule.scheduleJob(this.cron, function () {
        //get prev mouth  date
        var nowtime = new Date();
        var daystamp = parseInt(nowtime.getTime() / 1000 / 3600 / 24);
        debug('prevmouthtimestamp:', daystamp);
        $Operationdata.find({ time_stamp_day: daystamp }).exec().then(function (list) {
            //debug('list:', list);
            var systemp = {};
            list.map(info => {
                //if (info.vresult != -1) {
                var temp = info.systempath;
                temp.split(',').map(n => {
                    if (n) {
                        //systemp[n] = info.vresult;
                        if (!systemp[n]) {
                            systemp[n] = info.vresult;
                        } else {
                            if (systemp[n] < info.vresult) {
                                systemp[n] = info.vresult
                            }
                        }
                    }
                });
                //}
            });
            Object.keys(systemp).forEach(function (key) {
                $Systeminfo.update({ _id: key }, { performance: systemp[key] }, function (err, raw) {
                    //debug('The raw response from Mongo was ', raw);
                });
            })
        }).catch(function (err) {
            debug('setSysteminfoPerformance err ,', err);
        })
    });
}


