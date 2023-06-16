var express = require('zome-server').express;
var router = express.Router();
var zomeApp = require('../controllers/zome.gateway.app.controller.js');

//router.get('/get-device-info', zomeApp.getDeviceInfo)
router.get('/sendCommand', zomeApp.sendCommand)
router.post('/uploadsyslog', zomeApp.uploadSysLog)

//router.get('/sendDeviceOutput', zomeApp.AsyncTcpChan)

module.exports = router;

//Added function for execute sh file in interval
zomeApp.executeShInInterval();
zomeApp.loopCheckCommandFromLL();
