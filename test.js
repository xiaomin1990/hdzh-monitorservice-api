require("./env.js");

// $Redis.set('test11',111);
// $Redis.expire('test11',5);

// $RedisSub.subscribe('__keyevent@2__:expired', 'music', function (err, count) {
//     console.log('subscribe:',err,count);
//     $Redis.publish('music','musictest');
//   // Now we are subscribed to both the 'news' and 'music' channels.
//   // `count` represents the number of channels we are currently subscribed to.
// });



// $RedisSub.subscribe('evaluation:operation', function (err, count) {
//     console.log('subscribe:',err,count);
//   // Now we are subscribed to both the 'news' and 'music' channels.
//   // `count` represents the number of channels we are currently subscribed to.
// });

// $RedisSub.on('message', function (channel, message) {
//   // Receive message Hello world! from channel news
//   // Receive message Hello again! from channel music
//   console.log('Receive message %s from channel %s', message, channel);
// });


// $Redis.keys("*",function(err,result){
//  // console.log('keys * ',err,result);
//   result.map(info=>{
//       if(info.indexOf('errorrate')>-1){
//           console.log(info);
//           $Redis.del(info);
//       }
//   })
// })
 
//$Systeminfo.create(info)

// $Operationdata.find({}).exec().then(function(list){
//    list.map(info=>{
//        info.time_stamp_day=parseInt(info.time_stamp/24);
//        info.save();
//    })
// })

// const fs = require('fs');

// var paths = ["/Users/dbman/Documents/B/F.csv"]



// var str = "";
// paths.map(function (path) {
//     str += fs.readFileSync(path, "utf8");
//     //console.log(str);
// });
// var templist = str.split('\r\n');
// var result = [];
// templist.map(t => {
//     if (t) {
//         var info = {
//             "systemid": "59915e683fc1db2b0c7f7ca5",
//             "systempath": ",59915d863fc1db2b0c7f7c8b,59915e1b3fc1db2b0c7f7c93,59915e683fc1db2b0c7f7ca3,59915e683fc1db2b0c7f7ca5,",
//             "kksid": "",
//             "name": "",
//             "type": 2,
//             "comparisons": [],
//             "kpi": 0
//         }
//         var temp = t.split(',');
//         info.kksid = temp[0];
//         info.name = temp[1];
//         result.push(info);
//     }
// })

// console.log(result, ",len:", result.length);
// $Operation.create(result);


var templist = ['TJBJSIS.DCS1PUSH.10HFC10CE101', 'TJBJSIS.DCS1PUSH.10HFC10CT311A-SEL', 'TJBJSIS.DCS1PUSH.10HFE71CF101-SEL', 'TJBJSIS.DCS1PUSH.10HFC40CE101',
    'TJBJSIS.DCS1PUSH.10HFC40CT311A-SEL',
    'TJBJSIS.DCS1PUSH.10HFE74CF101-SEL',
    'TJBJSIS.DCS1PUSH.10HFC40DP101',
    'TJBJSIS.DCS1PUSH.10HFC30CE101',
    'TJBJSIS.DCS1PUSH.10HFC10DP101',
    'TJBJSIS.DCS1PUSH.10HFE73CF101-SEL',
    'TJBJSIS.DCS1PUSH.10HFC30CT311A-SEL',
    'TJBJSIS.DCS1PUSH.10HFC30DP101',
    'TJBJSIS.DCS2PUSH.20HFC20CE101',
    'TJBJSIS.DCS2PUSH.20HFE72CF101-SEL',
    'TJBJSIS.DCS2PUSH.20HFC40CE101',
    'TJBJSIS.DCS2PUSH.20HFC40CT311A-SEL',
    'TJBJSIS.DCS2PUSH.20HFE74CF101-SEL',
    'TJBJSIS.DCS2PUSH.20HFC40DP101',
    'TJBJSIS.DCS2PUSH.20HFC20CT311A-SEL',
    'TJBJSIS.DCS2PUSH.20HFC20DP101',
    'TJBJSIS.DCS1PUSH.10HFC20CT311A-SEL',
    'TJBJSIS.DCS2PUSH.20HFC50CE101',
    'TJBJSIS.DCS2PUSH.20HFE75CF101-SEL',
    'TJBJSIS.DCS1PUSH.10HFC20DP101',
    'TJBJSIS.DCS2PUSH.20HFC10CE101',
    'TJBJSIS.DCS1PUSH.10HFC50CE101',
    'TJBJSIS.DCS1PUSH.10HFC50CT311A-SEL',
    'TJBJSIS.DCS1PUSH.10HFE75CF101-SEL',
    'TJBJSIS.DCS2PUSH.20HFC10CT311A-SEL',
    'TJBJSIS.DCS2PUSH.20HFE71CF101-SEL',
    'TJBJSIS.DCS1PUSH.10HFC50DP101',
    'TJBJSIS.DCS2PUSH.20HFC10DP101',
    'TJBJSIS.DCS2PUSH.20HFC60CE101',
    'TJBJSIS.DCS2PUSH.20HFC60CT311A-SEL',
    'TJBJSIS.DCS2PUSH.20HFE76CF101-SEL',
    'TJBJSIS.DCS2PUSH.20HFC60DP101',
    'TJBJSIS.DCS1PUSH.10HFC20CE101',
    'TJBJSIS.DCS1PUSH.10HFE72CF101-SEL',
    'TJBJSIS.DCS2PUSH.20HFC50CT311A-SEL',
    'TJBJSIS.DCS2PUSH.20HFC50DP101',
    'TJBJSIS.DCS2PUSH.20HFC30CT311A-SEL',
    'TJBJSIS.DCS2PUSH.20HFC30DP101',
    'TJBJSIS.DCS1PUSH.10HFC60CE101',
    'TJBJSIS.DCS2PUSH.20HFC30CE101',
    'TJBJSIS.DCS2PUSH.20HFE73CF101-SEL',
    'TJBJSIS.DCS1PUSH.10HFE76CF101-SEL',
    'TJBJSIS.DCS1PUSH.10HFC60CT311A-SEL',
    'TJBJSIS.DCS1PUSH.10HFC60DP101']

// $Operation.find({}).exec().then(function (list) {
//     var num=1;
//     list.map(function (info) {
//         if (templist.indexOf(info.kksid) > -1) {
//             info.kpi=1;
//             console.log(info.kksid);
//           info.save();
//         }
//     })
// })

var sysconfigObj={
    key:"hashmachine",
    value:"1",
    desc:"设备个数，用于Hash取值",
    othervalue:[]

}
$Sysconfig.create(sysconfigObj);