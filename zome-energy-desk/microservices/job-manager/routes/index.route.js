var express = require('zome-server').express;
var router = express.Router();

let jobManagerController = require('../controllers/job.manager.controller');

router.post('/add-job', jobManagerController.addJob);

// router.post('/process-job', jobManagerController.processJob);
module.exports = router;