var express = require('express');
var router = express.Router();
const operationpointCtr = require('../controllers/operationpoint');

//获取整个系统月平均值 --按天计算平均值  首页性能带状图
router.get("/performance/sysmonthlist/:systemid", operationpointCtr.performance.sysmonthlist);
//获取系统下所有的指标一年的数据 --按天计算平均值
router.get("/performance/sysyearlist/:systemid", operationpointCtr.performance.sysyearlist);
//获取单个指标一年的数据
router.get("/performance/yearlist/:operationid", operationpointCtr.performance.yearlist);
//获取单个指标一年的原始信号数据
router.get("/performance/yearsignerlist/:operationid", operationpointCtr.performance.yearsignerlist);
router.post("/performance/", operationpointCtr.performance.create);
router.delete("/performance/:operationid", operationpointCtr.performance.delete);


//获取异常数据 默认获取10分钟内数据
router.get("/abnormal/list/:systemid", operationpointCtr.abnormal.list);
//首页的异常报警小时数据
router.get("/abnormal/day/:systemid", operationpointCtr.abnormal.day);
router.post("/abnormal/", operationpointCtr.abnormal.create);

module.exports = router;
