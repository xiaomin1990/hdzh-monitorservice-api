
var debug = require('debug')('debug:kafka:producer');
var kafka = require('kafka-node');

function ProducerServer(option) {
    this.host = option.host || "127.0.0.1:2181";
    this.partition = option.partition || 0;
    this.attributes = option.attributes || 0;
    that = this;
}

ProducerServer.prototype.Init = function () {
    var HighLevelProducer = kafka.HighLevelProducer;
    var client = new kafka.Client(this.host);
    this.producer = new HighLevelProducer(client);
    this.producer.on('ready', function (err, data) {
        debug('kafka read status', err, data);
    });
}
ProducerServer.prototype.SendMsg = function (topic,key, msg) {
    var payloads = [
        { topic: topic, key: key, messages: msg, partition: this.partition, attributes: this.attributes }
    ];
    return new Promise(function (resove, reject) {
        that.producer.send(payloads, function (err, data) {
            if (err) {
                reject(err);
            } else {
                resove(data);
            }
        });
    });
}

ProducerServer.prototype.createTopics = function (topics) {
    return new Promise(function (resove, reject) {
        if (!topics || !Array.isArray(topics)) {
            reject("参数错误");
        }
        that.producer.createTopics(topics, function (err, data) {
            if (err) {
                reject(err);
            } else {
                resove(data);
            }
        });
    });
}

//exports.ProducerServer = ProducerServer;

var option = {
    host: "47.94.45.163:2181",
}
var p = new ProducerServer(option);
p.Init();
p.SendMsg('operation','check', 'value').then(function (data) {
    console.log(data);
}).catch(function (err) {
    console.log('err:', err);
})

