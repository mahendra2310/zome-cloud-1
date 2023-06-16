var express = require('zome-server').express;
var router = express.Router();
var msConfig = require('zome-config').microservices;
const multer = require('multer')
const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'assets/')
    },
    filename: function (req, file, cb) {
        cb(null, "usersList.csv")
    }
})
const upload = multer({ storage: storage })

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'us-east-1'
});


var profileUpload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.PROFILE_PIC_BUCKET,
        acl: 'public-read',
        key: function (req, file, cb) {
            console.log(file);
            cb(null, `${req.user.userId}.${file.mimetype.split('/')[1]}`); //use Date.now() for unique file keys
        }
    })
});

var apiGatewayController = require('../controllers/api.gateway.controller.js');
var gatewayController = require('../controllers/gateway.controller.js');
var deviceController = require('../controllers/device.controller.js');
var propertyController = require('../controllers/property.controller.js');
var buildingController = require('../controllers/building.controller.js');
var userController = require('../controllers/user.controller.js');
var dispatchController = require('../controllers/dispatch.controller');
var commandTemplateController = require('../controllers/commandTemplate.controller');

//middleware
var auth = require('../middleware/auth');

//router.get('/get-device-info/:gatewayuuid', apiGatewayController.proxyRequest(msConfig.services.apiGateway.name));

router.post('/login', apiGatewayController.loginRequest);

router.post('/signup', apiGatewayController.signUpRequest);

router.get('/user', auth, apiGatewayController.getUser);

router.post('/manual-user', auth, upload.single('userlist'), apiGatewayController.addBulkUser);

router.post('/single-user', auth, apiGatewayController.addSingleUser);

router.put('/user', auth, apiGatewayController.updateUser);

router.put('/user/picture', auth, profileUpload.single('profile_pic'), apiGatewayController.updateUserPicture);

router.get('/check', apiGatewayController.isDeviceAvailable);

router.get('/device/:gatewayId', auth, deviceController.getAllDevice);

router.post('/device', auth, deviceController.addDevice);

router.post('/device-details', auth, deviceController.deviceDetails);

router.post('/switch-activity', auth, deviceController.smartSwitchControl);

router.get('/smartswitch/:gatewayId/:deviceId', auth, deviceController.smartSwitchStatus);

router.get('/deviceStatus/:gatewayId/:deviceId', auth, deviceController.deviceStatus);

router.post('/send-matrices-switch', auth, deviceController.sendMetricsSwitch);

router.post('/instant-temp', auth, deviceController.instantTemperature);

router.delete('/device', auth, deviceController.deleteDevice);

router.put('/device', auth, deviceController.editDevice);

router.put('/device-desc', auth, deviceController.editDeviceDescription);

router.get('/gateway', auth, gatewayController.getGateway);

router.post('/gateway', auth, gatewayController.addGateway);

router.post('/gateway-properties', auth, apiGatewayController.getGatewaysByMeterId);

router.post('/cpower-test-event', auth, apiGatewayController.addCpowerTestEvent);

router.post('/gateway-by-property', auth, apiGatewayController.getGatewaysByProperty);

router.post('/gateway-dashboard', auth, apiGatewayController.showGatewaysByMeterId);
// get gateway by user
router.get('/gateway-by-user', auth, apiGatewayController.getGatewaysByUser);

router.post('/temperature', auth, deviceController.editTemperature);

router.get('/search', auth, gatewayController.gatewaySearch);

router.get('/users', auth, apiGatewayController.getAllUser);
// get users by property
router.post('/propertyUsers', auth, apiGatewayController.getUsersByProperty);

router.post('/gateway/device', auth, deviceController.getDeviceByGateway);
router.post('/set-point', deviceController.setPoinThermostateDevices);

router.get('/reports', auth, apiGatewayController.getDispatchEventReport);

router.get('/test-api', apiGatewayController.testAPI);
router.get('/syslogs', apiGatewayController.sysLogsUpload);

// Set mode on thermostat devices
router.post('/set-mode', auth, deviceController.setMode);

// Get version of gateway and microservice
router.get('/version/:gateway_uuid', apiGatewayController.getVersion);

// Property Routes
router.get('/properties',auth, propertyController.getallPropertyForMap);

router.post('/property',auth, propertyController.createProperty);
router.get('/property',auth, propertyController.listProperty);
router.put('/property/:id',auth, propertyController.updateProperty);
router.delete('/property/:id',auth, propertyController.removeProperty);
router.get('/property/:id',auth, propertyController.getPropertyDetails);
//get all properties for filter dropdown user's list
router.get('/allproperties',auth, propertyController.getPropertyByUsers);

router.get('/propertiesByState/:selectedState', apiGatewayController.propertiesByState);

// Building Routes
router.post('/building',auth, buildingController.createBuilding);
router.get('/building',auth, buildingController.listBuilding);
router.put('/building/:id',auth, buildingController.updateBuilding);
router.delete('/building/:id',auth, buildingController.removeBuilding);
router.get('/building/:id',auth, buildingController.getBuildingDetails);

// User Onboarding Routes
router.post('/useronboard', userController.createUser);
router.get('/useronboard', userController.listUser);
router.put('/useronboard/:id', userController.updateUser);
router.delete('/useronboard/:id', userController.removeUser);
router.get('/useronboard/:id', userController.getUserDetails);

// reset-Password routes
router.post('/sendpasswordlink', userController.resetPassword);
// router.get('/forgotPassword/:id/:token', userController.forgotPassword);

router.get('/otpvalidate/:email/:otp', userController.otpValidate);
router.post('/updatePassword/:email', userController.updatePassword);

router.post('/sendFeedbackEmail', userController.sendFeedbackEmail);
//router.post('/sendFeedbackEmail', userController.sendFeedbackEmail);
//forgot-username routes
router.post('/forgotUsername', userController.forgotUsername);

//dispatch routes
router.post('/sendDispatchCommand', apiGatewayController.sendDispatchCommand);

// History logs routes
router.get('/history', auth, apiGatewayController.getHistoryLog);

// Feedback routes
router.post('/feedback', userController.feedbackDetails);

// Dispatch API start
router.post('/testcommand', dispatchController.testDeviceStatus);
router.post('/dispatchSetPoint', dispatchController.dispatchSetPoint);
router.post('/cpowerdispatchSetPointTest', dispatchController.cpowerdispatchSetPointTest);
// Dispatch API End


// Restart server
router.get('/restart', auth, apiGatewayController.restartServer);

// Set retry count value
router.post('/retry-count', auth, apiGatewayController.setRetryCount);
router.get('/retry-count', auth, apiGatewayController.getRetryCount);


// Bullmq endpoints
router.post('/bullmq', apiGatewayController.bullQueue);

// command template CRUD
router.post('/command-template', auth, commandTemplateController.addCommandTemplate);
router.get('/command-template', auth, commandTemplateController.getCommandTemplate);
router.put('/command-template/:id', auth, commandTemplateController.updateCommandTemplate);
router.delete('/command-template/:id', auth, commandTemplateController.deleteCommandTemplate);


//apartment
router.get('/apartments/:Apartment_name', apiGatewayController.getMeterIdByApartmentName);
router.get('/apartmentNames/:meter_id', apiGatewayController.getApartmentNameByMeterId);


//getESID
router.get('/getesid/:Apartment_name', apiGatewayController.getEsidByApartmentName);


//users
router.get('/Apartmentusers',auth,apiGatewayController.getTenantUsers);
router.delete('/deleteTenant/:id',auth, apiGatewayController.deleteTenantByAdmin);
router.get('/tenantToAdmin/:newTenantAdmin',auth, apiGatewayController.tenantToAdmin);

//vacancy Mode feature
router.get('/vacancyMode',auth,apiGatewayController.vacancyModeFeature);
router.get('/fetchAllProperty',auth,apiGatewayController.fetchAllPropertyDetails);
router.post('/fetchAllDevicesByPropertyId',auth,apiGatewayController.fetchAllDevicesByPropertyId);
router.post('/deleteVacantUnit',auth,apiGatewayController.deleteVacantUnit);
router.get('/deviceForVacantView/:deviceID',auth,apiGatewayController.getAllDeviceByDeviceID);

// dropDownPropertie for dashboard
router.get('/dropDownProperty/:property_name',auth,apiGatewayController.dropDownProperty);

// Dashboard selected Gateways devices
router.post('/selectedGatewaysDevices',auth,apiGatewayController.selectedGatewaysDevices);

// Get All buildings for properties
router.get('/buildingForProperties',auth,apiGatewayController.buildingForProperties);

// Create a new Apartment
router.post('/createApartment',auth, apiGatewayController.createApartment);

// Get All Apartment
router.get('/Apartment',auth,apiGatewayController.getAllApartment);

// Create Tenant User by Admin
router.post('/createTenantUserByAdmine',auth, apiGatewayController.createTenantUserByAdmine);

module.exports = router;
