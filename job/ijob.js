
'use strict';

/**
 * 注意:所有Job最好继承IJob，然后从写IJob的方法
 */

var IJob=module.exports=function(){

}

IJob.prototype.run = function () {
    console.log("IJob run..");
}

IJob.prototype.close = function(){
     console.log("IJob close..");
}

IJob.prototype.restart = function(){
    console.log("IJob restart ...");
}