var debug = require('debug')('debug:kafka:consumer');
var kafka = require('kafka-node');

function ConsumerServer(option) {
    this.host = option.host || "127.0.0.1:2181";
    this.partition = option.partition || 0;
    this.attributes = option.attributes || 0;
    this.topic = option.topic || "test";
    this.groupId = option.groupId || "kafka-node-group";
    that = this;
}

ConsumerServer.prototype.Init = function () {
    var HighLevelConsumer = kafka.HighLevelConsumer;
    var client = new kafka.Client(this.host);
    var defaults = {
        groupId: this.groupId,
        autoCommit: true,
        autoCommitMsgCount: 100,
        autoCommitIntervalMs: 5000,
        encoding: 'utf8',
        fetchMaxWaitMs: 100,
        fetchMinBytes: 1,
        fetchMaxBytes: 1024 * 1024,
        fromOffset: false
    };
    this.consumer = new HighLevelConsumer(client, [{ topic: that.topic }], defaults);
}

ConsumerServer.prototype.OnData = function () {
    this.consumer.on('message', function (message) {
        return new Promise(function (resove, reject) {
            resove(message);
        })
    });
}
exports.ConsumerServer = ConsumerServer;

// var option = {
//     host: "47.94.45.163:2181",
//     topic: "chart",
//     groupId: "test1111"
// }
// var c = new ConsumerServer(option).Init();
// c.OnData().then(function (message) {
//     console.log(message);
// }).catch(function (err) {
//     console.log('err:', err);
// })
