var express = require('zome-server').express;
var router = express.Router();

var zomeAgent = require('../controllers/zome.gateway.agent.controller.js');
zomeAgent.initializeBot();

router.post('/sendDeviceOutput', zomeAgent.asyncDeviceOutput)
router.post('/sendSyncDeviceOutput', zomeAgent.syncDeviceOutput)

module.exports = router;