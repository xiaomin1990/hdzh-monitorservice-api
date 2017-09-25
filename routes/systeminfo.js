var express = require('express');
var router = express.Router();
const systemidCtr = require('../controllers/systeminfo')

router.route('/:id')
    .all(function (req, res, next) {
        if (req.method == "OPTIONS") res.send();/*让options请求快速返回*/
        else {
            next();
        }
    })
    .get(systemidCtr.get)
    .put(systemidCtr.update)
    .delete(systemidCtr.delete)

router.route("/")
    .post(systemidCtr.create)

router.get("/level/:level", function (req, res, next) {
    var level = req.params.level;
    var hashmachine = req.query.hashmachine;
    req.$query = { level: level };
    if (hashmachine) {
        req.$query.hashmachine = hashmachine;
    }
    systemidCtr.list(req, res, next);
})

router.get("/parent/:parentid", systemidCtr.getByParent)

router.param('id', systemidCtr.getById)

/** 数据接口特殊接口 按照级别获取数据列表 */
// router.get("/level/:level", function (req, res, next) {
//     var level = req.params.level || 4;  //默认获取level=4的数据
//     $Systeminfo.find({ level: level }).exec().then(function (list) {
//         //debug('list:', list);
//         var result = tool.responseSuccess(list);
//         res.json(result);
//     }).catch(function (err) {
//         var result = tool.responseFail('0', err);
//         res.json(result);
//     })
// });

module.exports = router;
