
var config = require("config");
var debug = require('debug')('debug:servers:websocketserver');
var tool = require('../utils/tool');
var catchnotifyCtr = require("../controllers/catchnotify");
var abnormalsCtr = require("../controllers/abnormals");

exports.Init = function (app) {
    var server = require('http').Server(app);
    var WebSocket = require('ws');
    var wss = new WebSocket.Server({ port: 8181 });

    var wslist = {};

    wss.on('connection', function (ws) {
        debug('client connected');
        ws.on('message', function (message) {

        });
        debug('ws.readyState:', ws.readyState);
    });
    // Broadcast to all.
    wss.broadcast = function broadcast(data) {
        try {
            wss.clients.forEach(function each(client) {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(data);
                }
            });
        }
        catch (e) {
            debug('websocketserver broadcast err:', e);
        }
    };

    wss.on('close', function (ws) {
        debug('client closed:', ws);
    });

    try {
        var key = ["kafka", "produce"].join(":");
        // setInterval(function () {
        //     $Redis.lpop(key).then(function (data) {
        //         if (data) {
        //             // debug('lpop:', data);
        //             if (typeof (data) != "objetc") {
        //                 data = tool.JSONParse(data);
        //             }
        //             var consumerMessage = data;
        //             if (data && data.key == "check") {
        //                 var obj = data.data && tool.JSONParse(data.data);
        //                 mathErrorRate(obj);
        //                 //处理check数据格式
        //                 var temp = checkdatahandler(obj);
        //                 consumerMessage = { key: "check", data: temp };
        //             }
        //             //debug('consumerMessage:', JSON.stringify(consumerMessage));
        //             consumerHandler(wss, consumerMessage);
        //         }
        //     });
        // }, 50);
    }
    catch (err) {
    }
}

function consumerHandler(wss, data) {
    if (typeof (data) == "object") {
        data = JSON.stringify(data);
    }
    //var result = JSON.stringify(data);
    //debug('result:', result);
    wss.broadcast(data);
}

//计算错误率 
function mathErrorRate(obj) {
    if (typeof (obj) != "objetc") {
        obj = tool.JSONParse(obj);
    }
    $Operation.findOne({ _id: obj.id }, ["time_window", "error_rate", "time_interval", "systemname", "monitoringsignal"]).exec().then(function (doc) {
        if (doc) {
            //debug('doc:', doc);
            //var nowtime = new Date().getTime();
            var daytimestamp = parseInt(obj.time_stamp / 1000 / 3600 / 24);
            var systemid = obj.systemid;
            var operationid = obj.id;
            var time_window = doc.time_window || 12;
            var error_rate = doc.error_rate || 0.9;
            var time_interval = doc.time_interval || 30;
            var systemname = doc.systemname;
            var real_values = obj.real_value || [];;
            var upper_values = obj.upper_value || [];;
            var lower_values = obj.lower_value || [];
            var kkses = obj.kks || [];
            var kks_names = obj.kks_name || [];
            var w_condition = obj.w_condition && parseInt(obj.w_condition);
            real_values.forEach((value, i) => {
                var rvalue = 0;
                //(lower_values[i] == 0 || upper_values[i] == 0 || w_condition == 1) ? 0 : -1;
                //((lower_values[i] != 0 && upper_values[i] != 0 && w_condition != 1) && (value < lower_values[i] || value > upper_values[i])) ? 1 : 0;
                var kksid = kkses[i];
                var monitoringsignals = doc.monitoringsignal || [];
                var level = 100;
                var dangerous_lower, dangerous_upper, warning_lower, warning_upper, kpi; //报警值,跳闸保护值
                var catchtype = 1; //默认为预测异常
                var catchnotifyobj = { systemid: systemid, systemname: systemname, operationid: operationid, kksid: kksid, w_condition: w_condition };
                catchnotifyobj.status = w_condition == 0 ? 0 : 1;
                monitoringsignals.map(signal => {
                    if (signal.kksid == kksid) {
                        time_window = signal.time_window || time_window;
                        error_rate = signal.error_rate || error_rate;
                        level = signal.level || 100;
                        dangerous_lower = signal.dangerous_lower || 0;
                        dangerous_upper = signal.dangerous_upper || 0;
                        warning_lower = signal.warning_lower || 0;
                        warning_upper = signal.warning_upper || 0;
                        alarm_upper = signal.alarm_upper ;
                        alarm_lower = signal.alarm_lower ;
                        if (warning_lower != 0 && value < warning_lower) {
                            catchtype = 2;
                            catchnotifyobj.status = 1;
                        }
                        if (warning_upper != 0 && value > warning_upper) {
                            catchtype = 2;
                            catchnotifyobj.status = 1;
                        }
                        if (dangerous_lower != 0 && value < dangerous_lower) {
                            catchtype = 3;
                            catchnotifyobj.status = 1;
                        }
                        if (dangerous_upper != 0 && value > dangerous_upper) {
                            catchtype = 3;
                            catchnotifyobj.status = 1;
                        }
                        kpi = signal.kpi;
                        if (lower_values[i] == 0 || upper_values[i] == 0 || w_condition == 1) {  //如果非kpi或者停机 则不处理异常
                            rvalue = 0;
                        } else {
                            if (alarm_upper && value > upper_values[i]) {
                                rvalue = 1;
                            }
                            if (alarm_lower && value < lower_values[i]) {
                                rvalue = 1;
                            }
                        }
                    }
                })
                var time_window_num = parseInt(time_window / time_interval);  //time_window 多长时间
                var key = ["errorrate", daytimestamp, systemid, operationid, kksid].join(":");
                var kksname = kks_names[i];
                catchnotifyobj.kksname = kksname;
                catchnotifyobj.time_stamp = obj.time_stamp;
                catchnotifyobj.error_rate = error_rate;
                catchnotifyobj.time_window = time_window;
                catchnotifyobj.time_interval = time_interval;
                catchnotifyobj.real_value = value;
                catchnotifyobj.upper_value = upper_values[i];
                catchnotifyobj.lower_value = lower_values[i];
                catchnotifyobj.level = level;
                catchnotifyobj.dangerous_lower = dangerous_lower;
                catchnotifyobj.dangerous_upper = dangerous_upper;
                catchnotifyobj.warning_lower = warning_lower;
                catchnotifyobj.warning_upper = warning_upper;
                catchnotifyobj.kpi = kpi;
                catchnotifyobj.type = catchtype;
                handmethod(key, rvalue, daytimestamp, obj, kksid, time_window_num, error_rate, catchnotifyobj);
            });
        }
    });
}

function handmethod(key, rvalue, daytimestamp, obj, kksid, time_window_num, error_rate, catchnotifyobj) {
    $Redis.exists(key, function (err, result) {
        if (result == 0) {
            $Redis.expire(key, 60 * 60 * 24 * 2)//设置2天后过期
        }
        //$Redis.rpush(key,rvalue);
        $Redis.pipeline().rpush(key, rvalue).lrange(key, [-time_window_num, -1]).exec(function (err, results) {
            var err = results[1][0];
            if (err) return false;
            var list = results[1][1];
            var errnum = 0;
            list.map(num => {
                if (num == 1) {
                    errnum++;
                }
            });
            // debug('(errnum/time_window_num)>=error_rate', errnum, list.length, errnum / list.length, error_rate);
            if ((errnum / list.length) >= error_rate) {
                catchnotifyobj.status = 1;
                var _time = new Date(obj.time_stamp);
                var _localtime = new Date(_time.toLocaleString());
                var hh = _localtime.getHours();
                debug('_localtime:', _time, _localtime, hh, _time.getHours());
                var dayratekey = ["dayratekey", daytimestamp, obj.systemid].join(":");
                $Redis.rpush(dayratekey, hh);
                //插入数据库Mailbox集合
                // var _time=new Date(obj.time_stamp*1000);
                /*
                var body = {};
                body.content = kksid;
                body.time_stamp_day = parseInt(obj.time_stamp / 3600 / 24);
                body.systemid = obj.system_id;
                var mailinfo = {};
                mailinfo.topic = ["系统异常", kksid, _time.toLocaleString()].join(':');
                mailinfo.body = body;
                $Mailbox.findOne({ "body.time_stamp_day": body.time_stamp_day, "body.systemid": body.systemid }).exec().then(function (info) {
                    if (!info) {
                        $Mailbox.create(mailinfo);
                    }
                })
                */

            }
            if (catchnotifyobj.status == 1 && catchnotifyobj.w_condition == 0) {
                abnormalsCtr.save(catchnotifyobj); //保存异常信息
            }
            //debug('catchnotifyobj:',catchnotifyobj)
            catchnotifyCtr.save(catchnotifyobj);


        });

    });
}

function checkdatahandler(obj) {
    var operationid = obj && obj.id;
    var kkslist = obj && obj.kks || [];
    var real_values = obj && obj.real_value || [];
    var upper_values = obj && obj.upper_value || [];
    var lower_values = obj && obj.lower_value || [];
    var mean_values = obj && obj.mean_value || [];
    var temp = { operationid: operationid };
    kkslist.forEach((kksid, i) => {
        var ret = {}
        ret.time_stamp = obj.time_stamp;
        ret.real_value = real_values[i];
        ret.upper_value = upper_values[i];
        ret.lower_value = lower_values[i];
        ret.mean_value = mean_values[i];
        if ((ret.lower_value != 0 && ret.upper_value != 0) && (ret.real_value < ret.lower_value || ret.real_value > ret.upper_value)) {
            ret.redpoint = obj;
        }
        if (temp[kksid]) {
            temp[kksid].push(ret);
        } else {
            temp[kksid] = [ret];
        }
    });
    temp.kkses = kkslist;
    return temp;
}


// {"data":"{\"id\": \"5980482788e5963acdd5902a\", \"hval\": 74.9214400025,
//  \"time_window\": 12, \"error_rate\": 0.9, \"kks\": \"TJBJSIS.DCS1PUSH.10HFC10CT311A-SEL\",
//   \"lval\": 74.7102239615, \"tval\": 74.83714, \"system_id\": \"59817db049f6827e390df765\", 
//   \"time_stamp\": 1502435795}","key":"check"}