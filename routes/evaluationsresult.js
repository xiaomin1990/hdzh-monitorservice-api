var express = require('express');
var router = express.Router();
const evaluationsresultCtr = require('../controllers/evaluationsresult')


router.route("/")
    .post(evaluationsresultCtr.create)
 

router.get("/list/:operationid", evaluationsresultCtr.list)

router.post("/trainingresults",evaluationsresultCtr.trainingresults.create);
router.post("/trainingresults/alarmCreate",evaluationsresultCtr.trainingresults.alarmCreate)
router.get("/trainingresults/:systemid",evaluationsresultCtr.trainingresults.list);
router.get("/trainingresults/alarmlist/:systemid",evaluationsresultCtr.trainingresults.alarmlist);
router.delete("/trainingresults/:systemid",evaluationsresultCtr.trainingresults.delete);

module.exports = router;
