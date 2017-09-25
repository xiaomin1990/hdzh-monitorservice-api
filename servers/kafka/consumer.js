
var Kafka = require('node-rdkafka');
var debug = require('debug')('debug:kafka:consumer');

function ConsumerServer(option) {
    this.hosts = option.hosts || "127.0.0.1:9092";
    this.groupid = option.groupid || "kafkagroupid";
    this.topics = option.topics || ["test"];
    that = this;
}
ConsumerServer.prototype.Init = function () {
    this.consumer = new Kafka.KafkaConsumer({
        //'debug': 'all',
        'metadata.broker.list': this.hosts,
        'group.id': this.groupid,
        'enable.auto.commit': false
    });
    //logging debug messages, if debug is enabled
    this.consumer.on('event.log', function (log) {
        debug('event.log', log);
    });
    //logging all errors
    this.consumer.on('event.error', function (err) {
        debug('Error from consumer', err);
    });
       this.consumer.on('ready', function (arg) {
        console.log('consumer ready.' + JSON.stringify(arg));
        console.log('that topics', that.topics);
        that.consumer.subscribe(that.topics);
        //start consuming messages
        that.consumer.consume();
    });
    this.consumer.on('disconnected', function (arg) {
        debug('consumer disconnected. ' + JSON.stringify(arg));
    });
    this.consumer.connect();
}
var counter = 0;
ConsumerServer.prototype.OnData = function (callback) {
    this.consumer.on('data', function (m) {
        counter++;
        if (counter % 20 == 0) {
            that.consumer.commit(m);
            counter = 0;
        };
        debug(m.offset, m.key);
        callback(m.value.toString(), m.key);
    });
}
ConsumerServer.prototype.Close = function () {
    this.consumer.disconnect();
}

/**
 * 事例
 * 
 * 
 *   var option={
            hosts:"47.94.45.163:9099",
            groupid:undefined,
            topics:["finisher"]
        }

        var cc=new ConsumerServer(option);
        cc.Init();
        cc.OnData(function(m){
            console.log(m);
        })

 */

exports.ConsumerServer = ConsumerServer;

