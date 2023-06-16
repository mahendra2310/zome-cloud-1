const express = require("zome-server").express;
const router = express.Router();
const cpowerContoller = require("../controllers/cpower.connector.controller.js");
cpowerContoller.initializeSchedule();
router.get("/check-dispatch-event", cpowerContoller.getDispatchEventDetail);

router.get("/cpower-connector", cpowerContoller.getCpowerConnector);

router.get("/cpower-api", cpowerContoller.getCpowerEvent);

router.get("/cpower-mock-data", cpowerContoller.mockCpowerCall);

router.post("/cpower-mock", cpowerContoller.postCpowerMockServer);

router.post("/acknowledgement-Cpower", cpowerContoller.acknowledgementToCpower);

module.exports = router;
