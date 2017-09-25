
'use strict';

const debug = require('debug')('debug:job:catchnotify');
var schedule = require("node-schedule");
var IJob = require('./ijob');


//https://www.npmjs.com/package/node-schedule

var catchNotify = module.exports = function () {
    this.cron = "*/1 * * * *";   //每1分钟执行一次
}

catchNotify.prototype = new IJob();

catchNotify.prototype.run = function () {
    debug("catchNotify run ...");
    // schedule.scheduleJob(this.cron, function () {
    //     //get prev mouth  date
    //     var nowtime = new Date();
    //     var daystamp = parseInt(nowtime.getTime() / 1000 / 3600 / 24);
    //     debug('prevmouthtimestamp:', daystamp);
    //     //first get All catch(异常) systemid type=2 是异常检测
    //     $Operation.find({ type: 2 },["systemid"]).exec().then(function (docs) {
    //         docs.map(doc => {
                
    //         })
    //     });
    // });
}

//获取最近一分钟的系统异常信息
function getcatch(systemid) {
    var nowtime = new Date();
    var endmonttimestamp = nowtime.getTime();
    var beginmonthtimestamp = nowtime.setMinutes(nowtime.getMinutes() - 10);
    var _startrow = ["catch", systemid, beginmonthtimestamp].join("_");
    var _endrow = ["catch", systemid, endmonttimestamp].join("_");
    var _column = "op:catch";
    $HbaseClient.table("operationpoint_abnormal").scan({
        startRow: _startrow,
        endRow: _endrow,
        maxVersions: 1,
        column: [_column]
    }, (err, rows) => { 
        
    });

}


