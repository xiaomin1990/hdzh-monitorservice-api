var express = require('express');
var debug = require('debug')('debug:routes:abnormals');
var tool = require('../utils/tool');
var router = express.Router();

const abnormalsCtr = require('../controllers/abnormals')

//获取系统异常总时长
router.get("/getAbnormalPeriod/:operationid/:time_stamp", abnormalsCtr.getAbnormalPeriod);

//获取报警系统
router.get("/getListGroupBySystem/:parentsystemid", abnormalsCtr.getListGroupBySystem);

//获取异常色带值。按天统计
router.get("/getListGroupByDay/:systemid", abnormalsCtr.getListGroupByDay);

//获取报警详细情况s
router.get("/list/:systemid", abnormalsCtr.list);

module.exports = router;
