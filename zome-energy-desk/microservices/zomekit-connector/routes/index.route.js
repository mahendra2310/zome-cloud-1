const express = require('zome-server').express;
const router = express.Router();
const zomeConn = require('../controllers/zomekit.connector.controller');

router.post('/command-to-gateway/:gatewayuuid/:commandType', zomeConn.commandToGateway);

module.exports = router;


