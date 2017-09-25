var express = require('express');
var router = express.Router();
const sysconfigCtr = require('../controllers/sysconfig')

router.route('/:key')
    .all(function (req, res, next) {
        if (req.method == "OPTIONS") res.send();/*让options请求快速返回*/
        else {
            next();
        }
    })
    .get(sysconfigCtr.get)

router.param('key', sysconfigCtr.getByKey)

module.exports = router;
