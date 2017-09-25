var assert = require('assert');
var hbase = require('hbase');

var client = hbase({ host: '192.188.108.151', port: 8080 });

// hbase({ host: '192.188.108.3', port: 8080 })
// .table('my_table')
// .create('my_column_family', function(err, success){
//   this
//   .row('my_row')
//   .put('my_column_family:my_column', 'my value', function(err, success){
//     this.get('my_column_family', function(err, cells){
//         console.log('cells:',err,cells);
//       this.exists(function(err, exists){
//          console.log('exists:',exists);
//       });
//     });
//   });
// });

// client.table('operationpoint_abnormal').create('op',function(err,success){
//     console.log('trainmodel create:', err, success);
// })
client
    .table('operationpoint_abnormal')
    .row('catch_59ba5064e774e43837c64477_1505756769000', function (err, data) {
        this.get('op:catch', function (err, cells) {
            console.log('cells:', err, cells);
        })
    })

// var _put1 = [{
//   key: 'z1',
//   column: 'cf:1',
//   '$': '{"kks":["TJBJSIS.DCS1PUSH.10HNC10CE101","TJBJSIS.DCS1PUSH.10HNC10AS101GT","TJBJSIS.DCS1PUSH.10HNC10CP101","TJBJSIS.DCS1PUSH.10HNC10DP101"],"kks_name":["1#引风机电动机电流","1#引风机动叶位置反馈","1#引风机入口风压","1#引风机风量"],"upper_value":[380.4447937011719,71.54505920410156,0,0],"lower_value":[237.19236755371094,38.071083068847656,0,0],"real_value":[375.561515,65.309143,-4.424286,2221.911113],"w_condition":0,"time_stamp":1501576920000,"id":"59a68e0d251d0135dbd5d728","alarm":0}'
// },
// {
//   key: 'z2',
//   column: 'cf:1',
//   '$': '{"kks":["TJBJSIS.DCS1PUSH.10HNC10CE101","TJBJSIS.DCS1PUSH.10HNC10AS101GT","TJBJSIS.DCS1PUSH.10HNC10CP101","TJBJSIS.DCS1PUSH.10HNC10DP101"],"kks_name":["1#引风机电动机电流","1#引风机动叶位置反馈","1#引风机入口风压","1#引风机风量"],"upper_value":[380.2394104003906,71.54932403564453,0,0],"lower_value":[237.1750946044922,38.069271087646484,0,0],"real_value":[375.726315,65.309143,-4.42627,2221.400513],"w_condition":0,"time_stamp":1501576950000,"id":"59a68e0d251d0135dbd5d728","alarm":0}'
// }]
// client.table('test').row(null).put(_put1, function (err, success) {
//   console.log('put:', err, success);
// })

// client.table('test').row('z1').delete(function(){})
// client.table('test').row('z2').delete(function(){})





// client
// .table('operationpoint_abnormal')
// .scan({
//     startRow: 'catch_59ba5064e774e43837c64477_1505756769000',
//     endRow: 'catch_59ba5064e774e43837c64477_1505756769001',
//     maxVersions: 1,
//     column: ['op']
// },(err,rows)=>{
//     console.log('scan:',err,rows);
// });






var info = {
    "_id": "111111111",
    "performanceid": "598fe80f3fc1db2b0c7f37e4",
    "systemid": "598fe7ed3fc1db2b0c7f37e2",
    "systemname": "1号机磨煤机E性能监测",
    "systempath": ",598fe24b3fc1db2b0c7f37d7,598fe2533fc1db2b0c7f37d8,598fe7ed3fc1db2b0c7f37e1,598fe7ed3fc1db2b0c7f37e2,",
    "time_stamp": 399893,
    "time_stamp_day": 16662,
    "vresult": 0.518400322243,
    "type": 2,
    "createdTime": "2017-08-16T04:50:49.446Z",
    "__v": 0
}


// setInterval(function () {
//     for (let i = 0; i < 10; i++) {
//         var my_column_family = 'cf';
//         var my_row = ["row", i].join('');

//         for (let j = 0; j < 100; j++) {
//             var _timestamp = new Date().getTime() + Math.ceil(Math.random() * 1000);
//             var my_column = [my_column_family, _timestamp].join(":");
//             console.log('my_column:', my_column);
//             client.table('test')
//                 .row(my_row)
//                 .put(my_column, JSON.stringify(info), function (err, success) {

//                     if (err) {
//                         console.log('create:', err, success);
//                     }

//                 })
//         }
//     }
// }, 10)




// var id = "599fbb8091b213868336bf4e";
// var time_stamp = "1472457600000";
// var data = '{"id": "599fbb8091b213868336bf4e", "time_stamp": 1472457600000, "vresult": 0.6467574487302212, "systemname": "\\u5355\\u8017\\u6c34\\u5e73", "systempath": ",599f857ccd8a5f65b2ab39fa,599f8587cd8a5f65b2ab39fc,599f8598cd8a5f65b2ab39fe,", "vself": 1.0463282447733946, "vcompar": 1.016188678597908, "kkses": ["TJBJSIS.DCS1PUSH.10HFB10AF001GT", "TJBJSIS.DCS1PUSH.10HFC10CE101"], "vals": [70.443571, 73.707098]}' 
// console.log("performance create:", id, time_stamp, data);
// var _dataobj = JSON.parse(data);
// console.log(_dataobj.systemname);
// if (!_dataobj || Object.keys(_dataobj).length <= 0) {
//     var result = tool.responseFail('0', '数据格式不对');
//     return res.json(result);
// }
// var _row = [id, time_stamp].join("_");
// var columns = [
//     { column: 'performance:all', $: data },
//     { column: 'performance:time_stamp', $: String(time_stamp) },
//     { column: 'performance:vresult', $: String(_dataobj.vresult) },
//     { column: 'performance:systemname', $: _dataobj.systemname },
//     { column: 'performance:systempath', $: _dataobj.systempath },
//     { column: 'performance:vself', $: String(_dataobj.vself) },
//     { column: 'performance:vcompar', $: String(_dataobj.vcompar) },
//     { column: 'performance:kkses', $: String(_dataobj.kkses) },
//     { column: 'performance:vals', $: String(_dataobj.vals) }
// ]
// client.table("operationpoint").row(_row).put(columns, function (err, success) {
//    console.log(err,success);
// });




// function getPerformancesByDay(startrow, endrow, columns) {  //按天获取性能数据
//     return new Promise(function (resove, reject) {
//         client.table("operationpoint_performance").scan({
//             startRow: startrow,
//             endRow: endrow,
//             maxVersions: 1,
//             column: columns
//         }, (err, rows) => {

//             if (err) reject(err);
//             var resultobj = {};
//             if (rows) {
//                 var daylist = {};
//                 rows.map(info => {
//                     var val = info.$ && JSON.parse(info.$);
//                     if (val) {
//                         var daytimestamp = parseInt(val.time_stamp / 1000 / 3600 / 24) * 24 * 3600 * 1000;
//                         if (daylist[daytimestamp]) {
//                             daylist[daytimestamp].push(val.vresult);
//                         } else {
//                             daylist[daytimestamp] = [val.vresult];
//                         }
//                     }
//                 });
//                 Object.keys(daylist).sort().forEach(info => {
//                     var vals = daylist[info];
//                     var len = 0;
//                     var nulllen = 0;
//                     var sum = 0;
//                     vals.map(val => {
//                         //业务需求,info=-1 不计算平均值，如果vals 全部为-1 则返回-1.
//                         if (val != -1) {
//                             sum += val;
//                             len++;
//                         } else {
//                             nulllen++;
//                         }
//                     });
//                     if (nulllen == vals.length) {
//                         resultobj[info] = -1;
//                     } else {
//                         resultobj[info] = sum / len;
//                     }
//                 })
//             }
//             resove(resultobj);
//         });
//     });
// }

// var operationid = "59a0d38df752b394f5d51105";
// var pageindex = 0;
// var nowtime = new Date();
// var endtimestamp = nowtime.setFullYear(nowtime.getFullYear() - pageindex);
// var beginimestamp = nowtime.setFullYear(nowtime.getFullYear() - 1);
// console.log(beginimestamp, endtimestamp);
// var _column = ["op", operationid].join(":");
// getPerformancesByDay(String(beginimestamp), String(endtimestamp), [_column]).then(function (docs) {
//     console.log(docs);
// }).catch(function (err) {
//     console.log('err:', err);
// })


//var Buffer = require('buffer').Buffer;
//var zlib = require('zlib');



//var input = new Buffer('abc');
// zlib.gzip(input, function (err, decoded) {
//     //data = decoded.toString();
//     var data = zlib.gunzipSync(decoded)
//     console.log(data.toString());
// });
// var compressed = zlib.deflateSync(input);
// console.log(compressed);
// var output = zlib.inflateSync("\x9cK\x04\x00\x00b\x00b");
// console.log(output.toString());
//console.log(input);

//var ungzip=require("./python/ungzip.py");

// var exec = require('child_process').exec;

// var path=__dirname+"/python/ungzip.py";

// var arg = 'x%9CSJLJNQ%02%00%06R%01%CF';
// var shell=['python3',path,arg].join(' ');
// console.log(shell);
// exec(shell,function(error,stdout,stderr){
// if(stdout.length >1){
//         console.log('you offer args:',stdout);
//     } else {
//         console.log('you don\'t offer args');
//     }
//     if(error) {
//         console.info('stderr : '+stderr);
//     }
// })

