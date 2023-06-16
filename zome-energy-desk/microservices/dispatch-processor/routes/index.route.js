var express = require('zome-server').express;
var router = express.Router();
var dispatchProcessController = require('../controllers/dispatchProcess.controller');

router.post('/executeDispatch', dispatchProcessController.setPoint);

router.post('/testUpdateData', dispatchProcessController.testUpdateData);
router.get('/checkDispatchEvent', dispatchProcessController.checkDispatchEvent);

dispatchProcessController.checkAnyProcessOnGoing();

module.exports = router;


