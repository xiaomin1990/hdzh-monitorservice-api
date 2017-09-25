var express = require('express');
var router = express.Router();

const operationCtr = require('../controllers/operation')

router.route("/:id")
    .all(function (req, res, next) {
        if (req.method == "OPTIONS") res.send();/*让options请求快速返回*/
        else {
            next();
        }
    })
    .get(operationCtr.get)
    .put(operationCtr.update)
    .delete(operationCtr.delete)

router.put("/setconfigure/:operationid/:kksid",operationCtr.setconfigure)

router.route("/")
    .get(operationCtr.list)
    .post(operationCtr.create)


router.get("/syslist/:systemid/:type", function (req, res, next) {
    var type = req.params.type;
    var systemid = req.params.systemid;
    var query={type:type,systemid:systemid}
    req.$query=query;
    operationCtr.list(req, res, next);
});


router.post("/evaluation/:ids",operationCtr.evaluation)

router.param('id', operationCtr.getById)

module.exports = router;
