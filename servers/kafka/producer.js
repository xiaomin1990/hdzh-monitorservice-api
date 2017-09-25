var Kafka = require('node-rdkafka');
var debug=require('debug')('debug:kafka:producer');

function ProducerServer(option) {
    this.host = option.host || "127.0.0.1:9092";
    this.partition = option.partition || 0;
    this.topicName = option.topicName || "test";
    that = this;
}
ProducerServer.prototype.Init = function () {
    this.producer = new Kafka.Producer({
        //'debug' : 'all',
        'metadata.broker.list': this.host,
        'dr_cb': true  //delivery report callback
    });
    //logging debug messages, if debug is enabled
    this.producer.on('event.log', function (log) {
        debug('event.log:',log);
    });
    this.producer.on('event.error', function (err) {
        debug('Error from producer:', err);
    });
    this.producer.on('delivery-report', function (err, report) {
        debug('delivery-report: ', report);
    });
    //Wait for the ready event before producing
    this.producer.on('ready', function (arg) {
        debug('producer ready.', arg);
        //Create a Topic object with any options our Producer
        //should use when producing to that topic.
        that.topic = that.producer.Topic(that.topicName, {
            // Make the Kafka broker acknowledge our message (optional)
            'request.required.acks': 1
        });
        setInterval(function () {
            that.producer.poll();
        }, 100);

    });
    this.producer.on('disconnected', function (arg) {
        debug('producer disconnected. ', arg);
    });
    this.producer.connect();
}

ProducerServer.prototype.SendMsg = function (msg) {
    var value = new Buffer(msg);
    this.producer.produce(that.topic, that.partition, value, null);
}

ProducerServer.prototype.Close=function(){
    this.producer.disconnect();
}


/**
 * 事例
 * 
*       var option={
            host:"47.94.45.163:9099",
            topicName:"finished"
        }
        var pp=new ProducerServer(option);
        pp.Init();
        setInterval(function(){
        pp.SendMsg("1111");
        },3000);
 */

exports.ProducerServer=ProducerServer;

//  var option={
//             host:"47.94.45.163:9092",
//             topicName:"finished"
//         }
//         var pp=new ProducerServer(option);
//         pp.Init();
//         setInterval(function(){
//         pp.SendMsg("1111");
//         },3000);

