var express = require('express');
var debug = require('debug')('debug:routes:test');
var tool = require('../utils/tool');
var router = express.Router();


var zlib = require('zlib');
var fs = require('fs');


router.post("/gzip", function (req, res, next) {
    var gunzipStream = zlib.createGunzip();
    var path=[__dirname,'qq.html'].join("/");
    var toWrite = fs.createWriteStream(path);
   // debug('req:',req);
    debug('req.body:',req.body.data)
    req.body.data.pipe(gunzipStream).pipe(toWrite);
});

module.exports = router;
