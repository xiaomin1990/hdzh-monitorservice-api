'use strict';
const config = require('config');
const _ = require('lodash');

/**
  * 获取 ip 地址
  */
exports.getIP = function (req) {
  var ip =
    req.headers['x-real-ip'] ||
    req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    (req.connection.socket && req.connection.socket.remoteAddress);

  /* istanbul ignore else */
  if (ip && ip.indexOf('::ffff:') === 0) {
    ip = ip.replace('::ffff:', '');
  }
  return ip;
};

/**
  * ip 检测
  */
var ipWhiteList = config.ipWhiteList || [];
exports.checkIP = function (req, res, next) {
  var ip = exports.getIP(req);
  //logger.info('ip: %s', ip);
  if (ipWhiteList.indexOf(ip) === -1) {
    next({
      errcode: -2,
      errmsg: 'No permission',
      status: 401,
      info: 'IP 地址不合法'
    });
  } else {
    next();
  }
};


/**
 * 对错误信息的处理
 */
exports.errorWrapper = function (err) {
  /* istanbul ignore if */
  if (!err) {
    return err;
  }

  // 把 Error 的 message 字段赋值给 errmsg, 能够在 JSON.stringify 时打印出错误信息
  /* istanbul ignore if */
  if (_.isError(err.info) && err.info.message && !err.info.errmsg) {
    err.info.errmsg = err.info.message;
  }

  if (_.isError(err) && err.errcode && err.errmsg) {
    return err;
  }

  if (!err.errcode || !err.errmsg) {
    var str;
    /* istanbul ignore if */
    if (_.isError(err)) {
      str = err.toString();
    } else if (!_.isString(err)) {
      str = JSON.stringify(err);
    } else {
      str = err;
    }
    err = {
      errcode: -1,
      errmsg: 'System error',
      info: str
    };
  }

  var error = new Error();
  error.name = 'SERVICE-API';
  error.errcode = err.errcode;
  error.errmsg = err.errmsg;
  if (err.info) {
    error.info = err.info;
  }
  return error;
};

exports.responseSuccess = function (data) {
  var res = {
    isSuccess: 1,
    code: 10000,
    data: data
  }
  return res;
}
exports.responseFail = function (errcode, errmsg) {
  var res = {
    isSuccess: 0,
    code: errcode,
    data: null,
    err: errmsg
  }
  return res;
}

// 对Date的扩展，将 Date 转化为指定格式的String   
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，   
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)   
// 例子：   
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423   
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18   
exports.dateFormat = function (fmt) { //author: meizz   
  var o = {
    "M+": this.getMonth() + 1,                 //月份   
    "d+": this.getDate(),                    //日   
    "h+": this.getHours(),                   //小时   
    "m+": this.getMinutes(),                 //分   
    "s+": this.getSeconds(),                 //秒   
    "q+": Math.floor((this.getMonth() + 3) / 3), //季度   
    "S": this.getMilliseconds()             //毫秒   
  };
  if (/(y+)/.test(fmt))
    fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt))
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
}


exports.mergeObject = function (obj1, obj2) {
  Object.keys(obj2).forEach(function (key) {
    obj1[key] = obj2[key];
  });
};

exports.JSONParse = function (str) {
  if (!str) {
    return {};
  }
  if (typeof (str) == "object") {
    return str;
  }
  try {
    return JSON.parse(str);
  }
  catch (err) {
    return {};
  }
}

exports.NotNullAndUndefind = function (str) {
  if (str) {
    return true;
  }
  else if (str != undefined && str != null) {
    return true;
  } else {
    return false;
  }
}

exports.getkksid = function (output, input) {
  //var symbol = ["+", "-", "*", "/", "(", ")"];
  var newoutput = output && output.replace('+', ',').replace('-', ',').replace('*', ',').replace('/', ',').replace('(', ',').replace(')', ',') || "";
  var newinput = input && input.replace('+', ',').replace('-', ',').replace('*', ',').replace('/', ',').replace('(', ',').replace(')', ',') || "";
  var kkslist = [];
  var outputlist = newoutput.split(',');
  var inputlist = newinput.split(',');
  outputlist.map(info => {
    if (info) {
      if (kkslist.indexOf(info) < 0) {
        kkslist.push(info);
      }
    }
  });
  inputlist.map(info => {
    if (info) {
      if (kkslist.indexOf(info) < 0) {
        kkslist.push(info);
      }
    }
  });
  return kkslist.join(',');
}

exports.ArraySum = function (array) {
  if (!Array.isArray(array)) return -1;
  var result = 0;
  for (var i = 0; i < array.length; i++) {
    result += array[i];
  }
  return result;
}

exports.ArrayMax = function (array) {
  if (!Array.isArray(array)) return undefined;
  var result = 0;
  for (var i = 0; i < array.length; i++) {
    if (result < array[i]) {
      result = array[i];
    }
  }
  return result;
}

exports.ArrayMin = function (array) {
  if (!Array.isArray(array)) return undefined;
  var result = 0;
  for (var i = 0; i < array.length; i++) {
    if (result > array[i]) {
      result = array[i];
    }
  }
  return result;
}


var randomString = exports.randomString = function (length, space) {
  var text = '';
  for (var i = 0; i < length; ++i) {
    text += space.charAt(Math.floor(Math.random() * space.length));
  }
  return text;
};

randomString.LETTER_NUMBER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
randomString.HEX = '1234567890ABC';


