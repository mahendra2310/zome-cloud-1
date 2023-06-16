const { exec } = require("child_process");
var log = require("zome-server").logger.log;
const zomeserver = require('zome-server');
const path = require('path');
var log = require('zome-server').logger.log;
var rest = require('zome-server').rest;
var errLib = require('zome-server').error;
var responseLib = require('zome-server').resp;
var protocol = process.env.PROTOCOL || 'http';
var serviceHost = process.env.SERVICE_HOST || 'localhost';
var msConfig = require('zome-config').microservices;
var mongoose = require('zome-server').mongoose;
const zomeUtils = require("zome-utils");
const crypto = require("crypto");

const DispatchEventDetail = require("mongo-dbmanager").dispatchEventDetailModel;
const Device = require('mongo-dbmanager').devicemodel;
const AsyncAuditObj = require('mongo-dbmanager').asyncauditmodel;
const Queue = require('mongo-dbmanager').queuemodel;
const schedule = require("node-schedule");
const cpowerMockModel = require("mongo-dbmanager").cpowerMockModel;

//while get temp type can be 1 for heat & 1 for cool
//while set temp type can be 0 for heat & 1 for cool
// Ferinhit -- 35 . 95  Celcious - 2 to 34 

const unitResolver = {
    'Celsius': 0,
    'Fahrenheit': 1
}

const setTempModeResolver = {
    Heat: 0,
    Cool: 1,
    Auto: 1,
    Off: 1,
}

const getTempModeResolver = {
    Heat: 1,
    Cool: 2,
    Auto: 2,
    Off: 2,
}

const ASYNC_TYPE_TSAT_MODE = "asyncMsg.deviceInfo.Thermostat mode";
const ASYNC_TYPE_TSAT_TEMP = "asyncMsg.deviceInfo.Thermostat setpoint temp";
const thermostateDeviceType = "259"; // thermostate
const hssDeviceType = "256"; //Hss
// Developmet Flow
// ===============
// 1. We have to find devices of the gateways from db!
// 2. need to find the devices which are thermostate (based on the type) 259
// 3. need to a loop for all devices and fire command as follows
// 	1. need to get mode of the device if success then go the step else move to next device assign this to exclude!! 
// 			commandtype = GET_PARAMS , command = default , device id & gatwayid
// 	2. get current temperature of the device in that mode  
// 		commandtype = GET_PARAMS & command will be GET_SET_POINT_TEMP_VAL & mode = need find from db &  param1 = 0 ,1 ,2
// 	3. set temperature in that mode  (if heat mode then minus and if cool mode then it is plus)(SET_TEMPERATURE)
// 			ex : if heat mode will with devices like geezer , heater etc : if temp need to set then in this case need to decrease it!
// 			ex : if cool mode will with devices like freeze , ac etc .. if temp need to set then in this case need to increase it!
// 			ex : if auto then default it will be cool

// 	Time needs to consider based on per gateway!!


// 	Reverse Process

// 	1. get current temperature of the device in that mode
// 	   if this temperature and mode are equal to which we have during dispatch process then 
// 	 		2. Need to reset temperature that to the previous temperature
// 	    else
// 	    	nothing 	 

// 	No Retry commands during dispatch process

// 4. Db operations of Dispatch Process

// /reports

// get mode line no : 766 code
// const modereolver = {
//     Heat: 1,
//     Cool: 2,
//     Auto: 1, //TODO: Need to figure from the op state
//     Off: 3,
// };
// MongoDB
// ====================
// STAGE:- MONGO_URL=mongodb://dipak:dipak123@23.23.159.124:27017/stage_zome_power
// DEV:- MONGO_URL=mongodb://dipak:dipak123@23.23.159.124:27017/develop_zome_power?retryWrites=true&w=majority
// PROD:- MONGO_URL=mongodb://dipak:dipak123@23.23.159.124:27017/dev_zome_power?retryWrites=true&w=majority

// IRC Servers
// ====================
// Staging server    -- ec2-3-93-220-200.compute-1.amazonaws.com
// Dev server  -- ec2-3-235-183-188.compute-1.amazonaws.com
// prod server -- ec2-34-232-162-181.compute-1.amazonaws.com

//Test scheduler  added
// const job = schedule.scheduleJob('42 * * * * *', function () {
//     console.log('The answer to life, the universe, and everything!');
// });
// console.log("job::", job)
// const date = new Date();
// console.log("date::", date)
// const job1 = schedule.scheduleJob(date, function () {
//     console.log('on specific time execute cron.');
// })
// console.log("job1::", job1)
/**
 * @description : This function is going to call from api gateway for now manual dispatch
 * its steps are as follows : 
 * 1. Make loop of All Gateways
 * 2. For every gateway find current disaptch process if exists then exit that loop for that gateway else move to next step
 * 3. insert disaptch event for that gateway
 * 4. Need to execute dispatch event for the gateway
 * @param {*} req 
 * @param {*} res 
 */
let setPoint = async (req,res)=>{
    try{
        console.log("setPoint called::");
        let excludeDeviceIds = JSON.parse(req.body.excludeDeviceId);
        excludeDeviceIdsJSON = excludeDeviceIds;
        log.debug("excludeDeviceIdsJSON : ",excludeDeviceIdsJSON);
        excludeDeviceIds = excludeDeviceIds.map((eachDevice)=>parseInt(eachDevice));
        const gatewayIds = JSON.parse(req.body.gatewayIds);
        let { temprature, minutes, dispatch_type } = req.body;
        minutes = parseInt(minutes);
        const eventName = "Event_" + Date.now();
        // logic is if minute is less than 5 then set it to 5
        if(minutes < 5 ){
            minutes = 5;
        }
        zomeserver.Connection("devZomePower");
        
        //Find All Devices of all gateways for reduce db queries
        // console.log("query:", JSON.stringify({ gateway_id: { $in: gatewayIds }, "device_info.DeviceType": thermostateDeviceType }))
        //let allDevices = await Device.find({gateway_id : 
        //    {$in : gatewayIds},"device_info.DeviceType":thermostateDeviceType});
        
        let onlySelectDevices = await Device.find( {
            $and:[
              {gateway_id : {$in : gatewayIds}}, 
              {"device_id" : {$nin: excludeDeviceIdsJSON}}, 
              {
                $or: [
                  {"device_info.DeviceType": thermostateDeviceType},
                  {"device_info.DeviceType": hssDeviceType}
                ]
              },
              {"is_deleted" : false}
            ]});
            log.debug("++++++++++++++++++++++++++++");
            log.debug("------Dispatch for gateway: ", gatewayIds);
            log.debug("------onlySelectDevices length: ", onlySelectDevices.length);
            log.debug(" onlySelectDevices: ", onlySelectDevices);
            log.debug("++++++++++++++++++++++++++++");

            
        // let allDevices = Device.find({gateway_id : {$in : ["c83e36-41ab5a-a8d6-4f04NaN2a243b30"]},"device_info.DeviceType":"259"})
        // allDevices = allDevices.filter((eachDevice) => !(excludeDeviceIds).includes(parseInt(eachDevice.device_id)))
        
        if(!onlySelectDevices.length){
            return res.status(200).json({ status:true,message:"success" });
        }
        // execute dispatch for each gateway in parrallel
        gatewayIds.forEach(async function(gatewayId){
            let ircRequestId = generateIRCRequestId();
            //let gatewayDevices = allDevices.filter((eachDevice) => eachDevice.gateway_id === gatewayId);
            let gatewayDevices = onlySelectDevices.filter((eachDevice) => eachDevice.gateway_id === gatewayId);
            
            //check current gateway dispatch ongoing
            const filter = { gateway_uuid: gatewayId, is_deleted: false };
            const isDataExists = await DispatchEventDetail.findOne(filter);
            log.debug("isDataExists");
            log.debug(isDataExists);

            if (gatewayDevices.length && !isDataExists) {
                let reqParamsOfDispatch = {
                    eventName: eventName,
                    gatewayId: gatewayId,
                    zcReqId: ircRequestId,
                    setPoint: true,
                    commandForDispatch: true,
                    excludeDeviceIds: excludeDeviceIds,
                    minutes: minutes,
                    temprature: temprature,
                    dispatch_type: dispatch_type || "cpower", // If dispatch call from api gateway it will share dispatch_type as manual otherwise default will be cpower
                    gatewayDevices: gatewayDevices
                }
                let createdispatch = await createDispatchEvent(reqParamsOfDispatch);
                reqParamsOfDispatch['dispatchevent_id'] = createdispatch._id;
                console.log("createdispatch::", createdispatch._id);

                startDispatchProcess(reqParamsOfDispatch);
                /*if (minutes == 22){
                    checkForSpecificAsyncMsg("1648851258692", "d52c80-d9fade-0090-9272NaN69ebfaf3", 
                        "2022-05-23T01:36:33.943Z", ASYNC_TYPE_TSAT_MODE);
                    return;
                }
                console.log(" dont show this ");*/

                // beginDispatchProcess(reqParamsOfDispatch);

                //Call Reset function on minutes
                let timeoutTime = parseInt(minutes) * 60000;
                console.log("timeoutTime:::", timeoutTime)
                setTimeout(async () => {
                    console.log("reset process start")
                    let dispatchDetails = await DispatchEventDetail.findOne({ _id: reqParamsOfDispatch.dispatchevent_id })
                    resetDispatchProcess(dispatchDetails);
                }, timeoutTime);
            }            
        });       
        // mongoose.connection.close();
        res.status(200).json({ status:true,message:"success" });
    }catch(error){
        console.log("error::",error)
        let msg = 'error';
        res.status(200).json({ msg }); 
    }
}
////////////////////////// NEW DISPATCH IMPL /////////////////
//Function to check if an async msg was recevd for a spefific device after the time specified - it should be in asynAudit DB
const checkForSpecificAsyncMsg = async (_devId, _gId, timeToCheckAfter, findThisSpecificVal) => {
    var a = 0;
    var msgFound = false;
    console.log("_gId:: ", _gId);
    console.log("_devId:: ", _devId);
    console.log("Timestamp of Mode cmd 1:: ", timeToCheckAfter);
    //console.log("Timestamp of Mode cmd 2:: String ", timeToCheckAfter.toString());
    //timeToCheckAfter = new Date (timeToCheckAfter.toString());
    //let date = timeToCheckAfter.toISOString();
    let isoDate = new Date(timeToCheckAfter);
    //console.log("Timestamp of Mode cmd 3:: isoDate ", isoDate);
    console.log("Response for Mode cmd :: ", findThisSpecificVal);
    var dynObjLookup = {
        [findThisSpecificVal]: { $exists: true }
    };
    while( a < 3 ){
        log.debug("+++++++++++++++check Async Msg +++++++++++++ try : ", a+1 +"  >>>> FOR "+findThisSpecificVal);
        await delayTime(10000);
        let asyncMsg = await AsyncAuditObj.find( {
            $and:[
              {gateway_id : {$in : _gId}}, 
              {device_id : {$in: _devId}}, 
              {"createdAt": {$gte : isoDate}},
              dynObjLookup
            ]});
        if(asyncMsg && asyncMsg.length !== 0) {
            log.debug("+++++++++++++++Found Async Msg for :: ", findThisSpecificVal);
            log.debug("+++++++++++++++Found Async Msg +++++++++++++", asyncMsg);
            msgFound = true;
            return msgFound;
        }
        a++;
    }
    return msgFound;
}

const beginDispatchProcess = async (params) =>{
    try{
        console.log("Begin Dispatch::",params.gatewayId)
        log.debug("Gateway Devices: ",params.gatewayDevices);
        for (const deviceInfo of params.gatewayDevices) {

            log.debug("Begin Dispatch::for Device::",deviceInfo.device_id);
            console.log("Begin Dispatch::for Device::",deviceInfo.device_id);
            //REPORTS :: SET Previous temp Info of Device
            await setPreviousDeviceInfo(params.zcReqId,deviceInfo.device_info);
            
            //GET MODE COMMAND
            let modeReqTS = new Date(Date.now());
            let lookingFor = ASYNC_TYPE_TSAT_MODE;
            let getModeResult = await executeCommandToGateway(params,deviceInfo,zomeUtils.GET_PARAMS,zomeUtils.GET_TSTAT_MODE);
            console.log("Device:: %d :: getModeResult:: %d",deviceInfo.device_id);
            console.log("getModeResult:: ", getModeResult);
            
            
            if (getModeResult.status && await checkForSpecificAsyncMsg(deviceInfo.device_id, params.gatewayId, modeReqTS, lookingFor)){
                //GET CURRENT TEMPERATURE
                // Now here we neeteo make a db query for this device to get current mode!!
                let deviceModeDetails = await getDeviceInfo(deviceInfo.device_id);
                //REPORTS :: Set current Temperature in Dispatch Report
                // getModeResult.deviceInfo[0].RequestID
                // await setCurrentDeviceInfo(params.zcReqId,deviceModeDetails.device_info);
                console.log("Thermostat mode:::",deviceModeDetails.device_info['Thermostat mode'])
                if(deviceModeDetails.device_info['Thermostat mode'] && deviceModeDetails.device_info['Thermostat mode'] !== "Off"){
                    let gettempMode = {
                        param1 : getTempModeResolver[deviceModeDetails.device_info['Thermostat mode']]
                    }
                    console.log("getTempModeResolver::",getTempModeResolver);
                    console.log("deviceModeDetails.device_info['Thermostat mode']::",deviceModeDetails.device_info['Thermostat mode'])
                    console.log("gettempMode::",gettempMode);
                    let getTempReqTS = new Date(Date.now());
                    lookingFor = ASYNC_TYPE_TSAT_TEMP;
                    //Thermostat setpoint type                
                    let getCurrentTempResult = await executeCommandToGateway(params, deviceInfo, zomeUtils.GET_PARAMS, zomeUtils.GET_SET_POINT_TEMP_VAL, gettempMode); //for now send 2 static param1
                    console.log("getCurrentTempResult::::",getCurrentTempResult)
                    let setTempratureValue = parseInt(params.temprature);
                    
                    if (getCurrentTempResult.status &&
                        await checkForSpecificAsyncMsg(deviceInfo.device_id, params.gatewayId, getTempReqTS, lookingFor)){
                        // Need to find Temp from DB for updated temp Thermostat setpoint temp Thermostat temp
                        let deviceTempDetails = await getDeviceInfo(deviceInfo.device_id);
                        await setCurrentDeviceInfo(params.zcReqId,deviceTempDetails.device_info);
                        //SET TEMP
                        if (deviceTempDetails['device_info']['Thermostat setpoint type'] === "Heating") {
                            //Need to reduce temp
                            setTempratureValue = parseInt(deviceTempDetails['device_info']['Thermostat setpoint temp']) - parseInt(params.temprature);
                            
                        } else if ((deviceTempDetails['device_info']['Thermostat setpoint type'] === "Cooling" || deviceTempDetails['device_info']['Thermostat setpoint type'] === "Auto")) {
                            //Need to increase temp
                            setTempratureValue = parseInt(deviceTempDetails['device_info']['Thermostat setpoint temp']) + parseInt(params.temprature);                        
                        }else{
                            //As per discussion default will be assume as cooling
                            setTempratureValue = parseInt(deviceTempDetails['device_info']['Thermostat setpoint temp']) + parseInt(params.temprature);                        
                        }  
                        console.log("Thermostat setpoint temp::",parseInt(deviceTempDetails['device_info']['Thermostat setpoint temp']))
                        console.log("params.setTempratureValue::: ",setTempratureValue)  
                        console.log("deviceModeDetails.device_info['Thermostat mode']]::: ",deviceModeDetails.device_info['Thermostat mode'])  
                        console.log("deviceModeDetails.device_info['Thermostat setpoint unit']]::: ",deviceModeDetails.device_info['Thermostat setpoint unit'])  
                        let validValues = [0,1];
                        if(validValues.includes(setTempModeResolver[deviceModeDetails.device_info['Thermostat mode']]) && validValues.includes(unitResolver[deviceModeDetails.device_info['Thermostat setpoint unit']])){    
                            // condition Ferinhit -- 35 . 95  Celcious - 2 to 34 
                            if((unitResolver[deviceModeDetails.device_info['Thermostat setpoint unit']] == 1 && setTempratureValue >= 35 && setTempratureValue <= 95) || (unitResolver[deviceModeDetails.device_info['Thermostat setpoint unit']] == 0 && setTempratureValue >= 2 && setTempratureValue <= 34)){
                                let setTempParams = {
                                    type :setTempModeResolver[deviceModeDetails.device_info['Thermostat mode']],
                                    unit: unitResolver[deviceModeDetails.device_info['Thermostat setpoint unit']],
                                    value:setTempratureValue
                                }
                                lookingFor = ASYNC_TYPE_TSAT_TEMP;
                                let setTempReqTS = new Date(Date.now());
                                let setTempResult = await executeCommandToGateway(params, deviceInfo, zomeUtils.SET_PARAMS, zomeUtils.SET_TEMPERATURE,setTempParams);      
                                console.log("setTempResult Result ::",JSON.stringify(setTempResult));
                                if(setTempResult.status &&
                                     await checkForSpecificAsyncMsg(deviceInfo.device_id, params.gatewayId, setTempReqTS, lookingFor)){
                                    //Set Final Device Info after setting up temp in gateway
                                    //await delayTime(1000);
                                    let deviceFinalTempDetails = await getDeviceInfo(deviceInfo.device_id);
                                    await setFinalDeviceInfo(params.zcReqId,deviceFinalTempDetails.device_info);     
                                    // console.log("setTempResult::::",setTempResult)
                                }else{
                                    //Set Temp Failure
                                    await setErrorDeviceInfo(params.zcReqId,deviceInfo.device_info,"Device Set Temperature Request failed!");
                                }
                            }else{
                                await setErrorDeviceInfo(params.zcReqId,deviceInfo.device_info,"Temperature is not in range!");
                            }          
                            
                        }else{
                            //errorf not getting mode or setpoint unit
                            await setErrorDeviceInfo(params.zcReqId,deviceInfo.device_info,"Not received Mode or setpoint unit valid from device!");
                        }
                                            
                    }else{
                        //Get Temp Failure
                        await setErrorDeviceInfo(params.zcReqId,deviceInfo.device_info,"Device Get Temperature Request failed!");
                        continue;
                    }
                }else{
                    //Devicee MOde is Off
                    await setErrorDeviceInfo(params.zcReqId,deviceInfo.device_info,"Device Mode is Off!");
                    continue;
                }
            }else{
                //Get Mode Failure
                await setErrorDeviceInfo(params.zcReqId,deviceInfo.device_info,"Device Get Mode Request failed!");
                //await completeDispatchProcess(params.zcReqId);
                continue;
            }
        } 
        console.log("end ");
        console.log(" Dispatch :: SET :: DONE ",params.gatewayId);
        // await completeDispatchProcess(params.zcReqId); // or gatewayid
    }catch(error){
        console.log("startDispatchProcess error::",error)
    }   
}



//////////////////////////////////////////////////////////////
const getDeviceInfo = async (deviceId) =>{
    return await Device.findOne({device_id:deviceId});
}
/**
 * NOTE : Async inside async is not working so there can be an issue of any of core module
 * because of it code is become complex to read 
 * async loop : ref : https://lavrton.com/javascript-loops-how-to-handle-async-await-6252dd3c795/
 * @description : This Function will execute dispatch for the gateway in sync way for all devices which are thermostats */
const startDispatchProcess = async (params) =>{
    try{
        console.log("start Dispatch::",params.gatewayId)
        for (const deviceInfo of params.gatewayDevices) {
            log.debug("start Dispatch::for Device::",deviceInfo.device_id);
            console.log("start Dispatch::for Device::",deviceInfo.device_id);
            //REPORTS :: SET Previous temp Info of Device
            await setPreviousDeviceInfo(params.zcReqId,deviceInfo.device_info);
            // await restartZomekitConnector();
            //GET MODE COMMAND
            let getModeResult = await executeCommandToGateway(params,deviceInfo,zomeUtils.GET_PARAMS,zomeUtils.GET_TSTAT_MODE);
            console.log("getModeResult::::",getModeResult)
            if (getModeResult.status){
                //GET CURRENT TEMPERATURE
                // Now here we neeteo make a db query for this device to get current mode!!
                let deviceModeDetails = await getDeviceInfo(deviceInfo.device_id);
                //REPORTS :: Set current Temperature in Dispatch Report
                // getModeResult.deviceInfo[0].RequestID
                // await setCurrentDeviceInfo(params.zcReqId,deviceModeDetails.device_info);
                console.log("Thermostat mode:::",deviceModeDetails.device_info['Thermostat mode'])
                if(deviceModeDetails.device_info['Thermostat mode'] && deviceModeDetails.device_info['Thermostat mode'] !== "Off"){
                    let gettempMode = {
                        param1 : getTempModeResolver[deviceModeDetails.device_info['Thermostat mode']]
                    }
                    console.log("getTempModeResolver::",getTempModeResolver);
                    console.log("deviceModeDetails.device_info['Thermostat mode']::",deviceModeDetails.device_info['Thermostat mode'])
                    console.log("gettempMode::",gettempMode);
                    //Thermostat setpoint type                
                    let getCurrentTempResult = await executeCommandToGateway(params, deviceInfo, zomeUtils.GET_PARAMS, zomeUtils.GET_SET_POINT_TEMP_VAL, gettempMode); //for now send 2 static param1
                    console.log("getCurrentTempResult::::",getCurrentTempResult)
                    let setTempratureValue = parseInt(params.temprature);
                    if (getCurrentTempResult.status){
                        // Need to find Temp from DB for updated temp Thermostat setpoint temp Thermostat temp
                        let deviceTempDetails = await getDeviceInfo(deviceInfo.device_id);
                        await setCurrentDeviceInfo(params.zcReqId,deviceTempDetails.device_info);
                        //SET TEMP
                        if (deviceTempDetails['device_info']['Thermostat setpoint type'] === "Heating") {
                            //Need to reduce temp
                            setTempratureValue = parseInt(deviceTempDetails['device_info']['Thermostat setpoint temp']) - parseInt(params.temprature);
                            
                        } else if ((deviceTempDetails['device_info']['Thermostat setpoint type'] === "Cooling" || deviceTempDetails['device_info']['Thermostat setpoint type'] === "Auto")) {
                            //Need to increase temp
                            setTempratureValue = parseInt(deviceTempDetails['device_info']['Thermostat setpoint temp']) + parseInt(params.temprature);                        
                        }else{
                            //As per discussion default will be assume as cooling
                            setTempratureValue = parseInt(deviceTempDetails['device_info']['Thermostat setpoint temp']) + parseInt(params.temprature);                        
                        }  
                        console.log("Thermostat setpoint temp::",parseInt(deviceTempDetails['device_info']['Thermostat setpoint temp']))
                        console.log("params.setTempratureValue::: ",setTempratureValue)  
                        console.log("deviceModeDetails.device_info['Thermostat mode']]::: ",deviceModeDetails.device_info['Thermostat mode'])  
                        console.log("deviceModeDetails.device_info['Thermostat setpoint unit']]::: ",deviceModeDetails.device_info['Thermostat setpoint unit'])  
                        let validValues = [0,1];
                        if(validValues.includes(setTempModeResolver[deviceModeDetails.device_info['Thermostat mode']]) && validValues.includes(unitResolver[deviceModeDetails.device_info['Thermostat setpoint unit']])){    
                            // condition Ferinhit -- 35 . 95  Celcious - 2 to 34 
                            if((unitResolver[deviceModeDetails.device_info['Thermostat setpoint unit']] == 1 && setTempratureValue >= 35 && setTempratureValue <= 95) || (unitResolver[deviceModeDetails.device_info['Thermostat setpoint unit']] == 0 && setTempratureValue >= 2 && setTempratureValue <= 34)){
                                let setTempParams = {
                                    type :setTempModeResolver[deviceModeDetails.device_info['Thermostat mode']],
                                    unit: unitResolver[deviceModeDetails.device_info['Thermostat setpoint unit']],
                                    value:setTempratureValue
                                }
                                let setTempResult = await executeCommandToGateway(params, deviceInfo, zomeUtils.SET_PARAMS, zomeUtils.SET_TEMPERATURE,setTempParams);      
                                console.log("setTempResult Result ::",JSON.stringify(setTempResult));
                                if(setTempResult.status){
                                    //Set Final Device Info after setting up temp in gateway
                                    await delayTime(1000);
                                    let deviceFinalTempDetails = await getDeviceInfo(deviceInfo.device_id);
                                    await setFinalDeviceInfo(params.zcReqId,deviceFinalTempDetails.device_info);     
                                    // console.log("setTempResult::::",setTempResult)
                                }else{
                                    //Set Temp Failure
                                    await setErrorDeviceInfo(params.zcReqId,deviceInfo.device_info,"Device Set Temperature Request failed!");
                                }
                            }else{
                                await setErrorDeviceInfo(params.zcReqId,deviceInfo.device_info,"Temperature is not in range!");
                            }          
                            
                        }else{
                            //errorf not getting mode or setpoint unit
                            await setErrorDeviceInfo(params.zcReqId,deviceInfo.device_info,"Not received Mode or setpoint unit valid from device!");
                        }
                                            
                    }else{
                        //Get Temp Failure
                        await setErrorDeviceInfo(params.zcReqId,deviceInfo.device_info,"Device Get Temperature Request failed!");
                    }
                }else{
                    //Devicee MOde is Off
                    await setErrorDeviceInfo(params.zcReqId,deviceInfo.device_info,"Device Mode is Off!");
                }
                                
            }else{
                //Get Mode Failure
                await setErrorDeviceInfo(params.zcReqId,deviceInfo.device_info,"Device Get Mode Request failed!");
            }
        } 
        console.log("end ")
        // await completeDispatchProcess(params.zcReqId); // or gatewayid
    }catch(error){
        console.log("startDispatchProcess error::",error)
    }   
}
/**@description : This function make reset call to API gateway and from their it call to gateway */
const executeCommandToGateway = async (params,deviceInfo,commandType,command,extraParams={}) => {    
    return new Promise( (resolve,reject)=>{        
        try{
            console.log("executeCommandToGateway::",deviceInfo.device_id)
            let message = {
                commandType: commandType,
                gatewayUuid: params.gatewayId,
                // reqId: params.zcReqId,
                deviceID: deviceInfo.device_id,
                command:command
            };
            const jobId = mongoose.Types.ObjectId();
            message['jobId'] = jobId;
            message['params'] = {};
            message['params']['gatewayuuid'] = message.gatewayUuid;
            message['params']['commandType'] = message.commandType;
            message['query'] = {};
            message['query']['command'] = message.command;
            message['query']['deviceID'] = message.deviceID;
            if(Object.keys(extraParams).length > 0){
                for(let key in extraParams){
                    message['query'][key] = extraParams[key]; 
                }
            }
            // if(param1){
            //     message['query']['param1'] = param1;

            // }
            // if(command === zomeUtils.SET_TEMPERATURE){
            //     message['query']['type'] = deviceInfo['device_info']['Thermostat setpoint type'];
            //     message['query']['unit'] = deviceInfo['device_info']['Thermostat setpoint unit'];
            //     message['query']['value'] = params.temprature;
            // }
            // dispatch-command-to-gateway
            // command-to-gateway/:gatewayuuid/:commandType
            // let url = `http://localhost:30008/zomecloud/api/v1/dispatch-command-to-gateway`;
            let url = `http://localhost:30008/zomecloud/api/v1/command-to-gateway/${message.gatewayUuid}/${message.commandType}?deviceID=${message.deviceID}&command=${message.command}`;
            if(Object.keys(extraParams).length > 0){
                let extraParamsArr = Object.keys(extraParams);
                var objectParmas = "";
                for (var key in extraParams) {
                    if (objectParmas != "" ||  key === extraParamsArr[0]) {
                        objectParmas += "&";
                    }
                    objectParmas += key + "=" + extraParams[key];
                }
                url = url + objectParmas;
            }            
            console.log("url::",url);
            var callOptions = {
                url: url, // `${zomeKitConnectorUrl}/${setpointEndPoint}`,
                method: 'POST',
                body: message
            }

            let reqId = generateIRCRequestId();
            var jobCallOptions = {
                url: `http://localhost:30004/queues/add-job`,
                method: 'POST',
                body: { 
                    queueId: message.gatewayUuid + "-sender", 
                    jobName: "test-zomekit-sender", 
                    jobPayload:{
                        type: "api",
                        jobId,
                        reqId: reqId,
                        value: callOptions
                    } 
                }
            };

            rest.call(null, jobCallOptions, async (err, response, body) => {
              if (err) {
                console.log("error::::", err);
                resolve({ status: false });
              } else {
                const queueObj = {
                  jobId: jobId,
                  request: {
                    ...callOptions.body,
                    createdAt: new Date(),
                  },
                };
                log.debug("setting up the queue object to the db");
                log.debug("queueObj at dispatch", queueObj);
                const queue = new Queue(queueObj);
                await queue.save();

                const chkResponse = async () => {
                  log.debug("calling to check response from the zkc every 2 sec");
                  const queueObj = await Queue.findOne({ jobId: jobId });
                  log.debug("queueObj");
                  log.debug(queueObj.response);
                  if (queueObj?.response?.datafeed != undefined) {
                    // if(response && response.body){
                    // let result = JSON.parse(response.body);
                    // log.debug("result from the ZKC", result);
                    // console.log("result::",result)
                    if (queueObj?.response?.datafeed.deviceInfo.length) {
                      // console.log("queueObj?.response?.datafeed.deviceInfo::::00",queueObj?.response?.datafeed.deviceInfo[0])
                      // console.log("message.commandType::",message.commandType,result.status)
                      if (queueObj?.response?.datafeed.deviceInfo[0].Status === "SUCCESS" || queueObj?.response?.datafeed.deviceInfo[0].status === "SUCCESS") {
                        log.debug("Job succeed! ", jobId);
                        resolve({ status: true, data: queueObj?.response?.datafeed });
                      } else {
                        resolve({ status: false });
                      }
                    } else {
                      resolve({ status: false });
                    }
                    // }else{
                    //     resolve({status:false})
                    // }
                    clearInterval(jobObserver);
                  } else {
                    log.debug(`Waiting for the response to complete for the jobid = ${jobId}`);
                     const isResponseTimeout = await isResponseTimeoutCheck(jobId);
                     if(isResponseTimeout) {
                        clearInterval(jobObserver);
                        resolve({ status: false });
                     } else {
                        log.debug(`still waiting for the response to be arrive for the jobid = ${jobId}`);
                     }
                  }
                };
                const jobObserver = await setInterval(chkResponse, 2000);
              }
            });
            // resolve(true)
        }catch(error){
            console.log("error::",error)
            reject({status:false})
        }
    });
}

const isResponseTimeoutCheck = async (jobId) => {
    const queueObj = await Queue.findOne({ jobId: jobId });
    log.debug("queue object at this point", queueObj);
    const requestedAt = (new Date(queueObj?.request?.createdAt).getTime());
    const currentDate = (new Date()).getTime();
    log.debug(`requestedAt = ${requestedAt}`);
    log.debug(`currentDate = ${currentDate}`);
    const timediff = Math.abs((currentDate - requestedAt)/1000);
    log.debug(`timeDifference between requested time and current time= ${timediff}`);
    if (timediff > 120) {
        await Queue.findOneAndUpdate({ jobId: jobId }, {
            $set: {
              response: { status: "failed" }, 
            },
        });
        return true; 
    } else {
        return false;
    }
}

const completeDispatchProcess = async (ircRequestId) => {
    return await DispatchEventDetail.updateOne({ irc_request_id: ircRequestId, is_deleted: false }, { $set: { is_deleted: true, reset_done: true } });
    // mongoose.connection.close();
}

const sampleTryCatch = async (params) =>{
    return new Promise( (resolve,reject)=>{
        try{
            console.log("sampleTryCatch::",params)           
            resolve(true)
        }catch(error){
            console.log("sampleTryCatch error::",error)
            reject({status:false})
        }
    })
}
/**
 * @description : This function it will insert in db of dispatch
 */
const createDispatchEvent = async (params) =>{
    console.log(" createDispatchEvent params::",params)
    const mlseconds = parseInt(params.minutes) * 60000;
    let current_date = new Date(Date.now());
    console.log("mlseconds::", mlseconds)
    const invocationDate = new Date(Date.now() + mlseconds);

    //TODO: Based on the device type change the params
    const createParams = {
        event_name: params.eventName,
        irc_request_id: params.zcReqId,
        minutes: params.minutes,
        temprature_value: params.temprature,
        schedular_date: invocationDate,
        reset_done: false,
        gateway_uuid: params.gatewayId,
        excluded_device: params.excludeDeviceIds,
        gateway_devices: params.gatewayDevices,
        dispatch_type: params.dispatch_type,
        created_by: "ZoomKitConnector-dispatch",
        updated_by: "ZoomKitConnector-dispatch",
        reset_date_at: invocationDate,
        created_at: current_date,
        updated_at: current_date,
    };
    // zomeserver.Connection("devZomePower");

    return await DispatchEventDetail.create(createParams);
}

/**
 * NOTE : this is going to call when dispatch starts
 * @description : This function will update the prvious device info to the device in disaptch process
 * @param {*} gatewayId : id of gatway
 * @param {*} device : object of device which needs to update in dispatch
 * @returns : return promise object
 */
const setPreviousDeviceInfo = async (ircRequestId,device)=>{
    // set_temprature
    const typeofUnit = device["Thermostat setpoint unit"] === "Fahrenheit" ? "1" : "0";
    const temratureValue = device["Thermostat setpoint temp"];
    const temratureType = device["Thermostat setpoint type"];
    // console.log("setPreviousDeviceInfo:::",ircRequestId);
    return await DispatchEventDetail.updateOne(
        {
            irc_request_id: ircRequestId,
            // gateway_uuid: gatewayId,
            is_deleted: false,
            gateway_devices: {
                $elemMatch: {
                    device_id: device["device id"]
                },
            },
        },
        {
            $set: {
                "gateway_devices.$.get_mode": true,
                "gateway_devices.$.previouse_temprature_info.set_point_unit": typeofUnit,
                "gateway_devices.$.previouse_temprature_info.set_point_type": temratureType,
                "gateway_devices.$.previouse_temprature_info.set_point_temp": temratureValue,
            },
        },
        {
            returnNewDocument: true,
        }
    )
}
/**
 * NOTE : this is going to call when dispatch executes and get success
 * @description : This function will update the current device info to the device in disaptch process
 * @param {*} gatewayId : id of gatway
 * @param {*} device : object of device which needs to update in dispatch
 * @returns : return promise object
 */
const setCurrentDeviceInfo = async (ircRequestId,device)=>{
    // set_temprature
    const typeofUnit = device["Thermostat setpoint unit"] === "Fahrenheit" ? "1" : "0";
    const temratureValue = device["Thermostat setpoint temp"];
    const temratureType = device["Thermostat setpoint type"];
    // console.log("setCurrentDeviceInfo:::",ircRequestId);
    return await DispatchEventDetail.updateOne(
        {
            irc_request_id: ircRequestId,
            // gateway_uuid: gatewayId,
            is_deleted: false,
            gateway_devices: {
                $elemMatch: {
                    device_id: device["device id"],
                },
            },
        },
        {
            $set: {
                "gateway_devices.$.get_mode": true,
                "gateway_devices.$.currunt_mode_temprature_info.set_point_unit": typeofUnit,
                "gateway_devices.$.currunt_mode_temprature_info.set_point_type": temratureType,
                "gateway_devices.$.currunt_mode_temprature_info.set_point_temp": temratureValue,
            },
        },
        {
            returnNewDocument: true,
        }
    )
}
/**
 * NOTE : this is going to call when dispatch ends
 * @description : This function will update the final device info to the device in disaptch process
 * @param {*} gatewayId : id of gatway
 * @param {*} device : object of device which needs to update in dispatch
 * @returns : return promise object
 */
const setFinalDeviceInfo = async (ircRequestId,device)=>{
    // set_temprature
    const typeofUnit = device["Thermostat setpoint unit"] === "Fahrenheit" ? "1" : "0";
    const temratureValue = device["Thermostat setpoint temp"];
    const temratureType = device["Thermostat setpoint type"];
    // console.log("setFinalDeviceInfo:::",ircRequestId);
    return await DispatchEventDetail.updateOne(
        {
            irc_request_id: ircRequestId,
            // gateway_uuid: gatewayId,
            is_deleted: false,
            gateway_devices: {
                $elemMatch: {
                    device_id: device["device id"],
                },
            },
        },
        {
            $set: {
                "gateway_devices.$.dispatch_done": true,
                "gateway_devices.$.dispatch_start_time": new Date(Date.now()),
                "gateway_devices.$.get_mode": true,
                "gateway_devices.$.final_temprature_info.set_point_unit": typeofUnit,
                "gateway_devices.$.final_temprature_info.set_point_type": temratureType,
                "gateway_devices.$.final_temprature_info.set_point_temp": temratureValue,
            },
        },
        {
            returnNewDocument: true,
        }
    )
}
// This function will called when reset process of device is done
const resetDeviceInfo = async (ircRequestId,device)=>{
    
    return await DispatchEventDetail.updateOne(
        {
            irc_request_id: ircRequestId,
            gateway_devices: {
                $elemMatch: {
                    device_id: device["device id"],
                },
            },
        },
        {
            $set: {
                "gateway_devices.$.reset_dispatch_done": true,                
                "gateway_devices.$.dispatch_end_time": new Date(Date.now())                
            },
        },
        {
            returnNewDocument: true,
        }
    )
}
//This Function will call when any error comes during start or reset dispatch process time
const setErrorDeviceInfo = async (ircRequestId,device,errormessage='')=>{
    console.log("setErrorDeviceInfo::",errormessage,device["device id"])
    let filter = {
        irc_request_id: ircRequestId,
        gateway_devices: {
            $elemMatch: {
                device_id: device["device id"],
            },
        },
    };
    let updateInfo = {
        $set: {
            "gateway_devices.$.failed_reason": errormessage,
            "gateway_devices.$.dispatch_end_time": new Date(Date.now())                            
        },
    };
    return await DispatchEventDetail.updateOne(filter,updateInfo,{returnNewDocument: true});
}
/**
 * @description ; This function will reset Temperature of Devices to previous one . it will call on restart as well on the timeout when dispatch ends!
 * @param {*} dispatchProcess : object of the dispatch Process
 */
const resetDispatchProcess = async (dispatchProcess) =>{
    try{
        console.log("resetDispatchProcess::");
        // findall Devices which are in process        
        let dispatchDeviceIds = (dispatchProcess.gateway_devices).map((eachDevice) => eachDevice.device_id);  
        let devices = await Device.find({ device_id: { $in: dispatchDeviceIds } });
        
        for(let eachDevice of dispatchProcess.gateway_devices) {
            // console.log("eachDevice::", eachDevice)
            // Thermostat temp
            //Thermostat setpoint temp
            if(!eachDevice.failed_reason){
                let idx = (devices).findIndex((dbDevice) => dbDevice.device_id === eachDevice.device_id);
                // console.log("idx::", idx, eachDevice.device_id)
                if (idx > -1 && eachDevice['final_temprature_info']['set_point_temp'] === devices[idx]['device_info']['Thermostat setpoint temp']){
                    // Need to execute commands                
                    let reqParamsOfResetDispatch = {
                        // zcReqId: dispatchProcess.irc_request_id,
                        temprature: devices[idx]['device_info']['Thermostat setpoint temp'],
                        gatewayId: dispatchProcess.gateway_uuid
                    }
                    reqParamsOfResetDispatch.temprature = eachDevice['previouse_temprature_info']['set_point_temp'];
                    let validValues = [0,1];
                    if(validValues.includes(setTempModeResolver[devices[idx].device_info['Thermostat mode']]) && validValues.includes(unitResolver[devices[idx].device_info['Thermostat setpoint unit']])){
                        // console.log("reset into valid ");

                        if(devices[idx].device_info['Thermostat mode'] && devices[idx].device_info['Thermostat mode'] !== "Off"){
                            let setTempParams = {
                                type :setTempModeResolver[devices[idx].device_info['Thermostat mode']],
                                unit: unitResolver[devices[idx].device_info['Thermostat setpoint unit']],
                                value:reqParamsOfResetDispatch.temprature
                            }

                            let lookingForAsync = ASYNC_TYPE_TSAT_TEMP;
                            let resetTempReqTS = new Date(Date.now());
                            console.log("reset cmd start time ::",resetTempReqTS) ;
                            let resetResponse = await executeCommandToGateway(reqParamsOfResetDispatch, devices[idx], zomeUtils.SET_PARAMS, zomeUtils.SET_TEMPERATURE,setTempParams); 
                            console.log("resetResponse::",resetResponse);
                            console.log("reset cmd end time ::",new Date(Date.now())) ;
                            if(resetResponse.status) {
                                    await resetDeviceInfo(dispatchProcess.irc_request_id,devices[idx].device_info);
                                // await setErrorDeviceInfo(dispatchProcess.irc_request_id,devices[idx].device_info,"Test message!");
                            }else{
                                await setErrorDeviceInfo(dispatchProcess.irc_request_id,devices[idx].device_info,"Reset Dispatch Failed : Reset Temperature of Device Failed!");
                            }
                        }else{
                            await setErrorDeviceInfo(dispatchProcess.irc_request_id,devices[idx].device_info,"Reset Dispatch Failed : Device Thermostat Mode is Off!");
                        }                       
                    }else{
                        await setErrorDeviceInfo(dispatchProcess.irc_request_id,devices[idx].device_info,"Reset Dispatch Failed : Not received Mode or setpoint unit valid from device!");
                    }
                                
                }else{
                    if(idx > -1){
                        await setErrorDeviceInfo(dispatchProcess.irc_request_id,devices[idx].device_info,"Reset Dispatch Failed : Temperature Has been Updated in between!");
                    }
                }
            }else{
                console.log("This Device has error at time of start dispatch::",eachDevice.device_id);
            }
            
        }
        await completeDispatchProcess(dispatchProcess.irc_request_id);
        console.log("reset process done")
    }catch(error){
        console.log("cathc err::",error)
    }
    //check if current temp is equal to previous 
    
}

/**Description : This function will genearate IRC Request ID for start dispatch request to gateway */
const generateIRCRequestId = () => {
    const randomString = crypto
      .createHash("sha256")
      .update(new Date().getTime().toString())
      .digest("hex");
    const finalHash = randomString.substr(0, 32);
    return finalHash;
};

const delayTime = (time) =>{    
    return new Promise((resolve)=>{
        setTimeout(function(){
            console.log("in timeount print")
            resolve(true);
        },time)
    })
}

const testdelayfunction = () =>{
    
    return new Promise((resolve)=>{
        console.log("funtion started")
        setTimeout(function(){
            console.log("in timeount print")
            resolve(true);
        },5000)
    })
}
/**
 * @description : This function will going to start when app starts
 * This function will find the on going Dispatch and if it's time is over then it will start execute reset automatic
 */
const checkAnyProcessOnGoing = async ()=>{
    console.log("checkAnyProcessOnGoing")
    // res.json({status:true})
    try{
        zomeserver.Connection("devZomePower");
        let onGoingProcess = await DispatchEventDetail.find({ is_deleted: false, reset_done: false });
        let currentTime = (new Date()).getTime();        
        if (!onGoingProcess.length){
            return false;
        }
        onGoingProcess.forEach(async function(eachProcess){
            let resetTime = (new Date(eachProcess.reset_date_at)).getTime()
            // console.log("eachPRocess::", eachProcess.reset_date_at, resetTime, eachProcess._id)
            if (currentTime >= resetTime){
                console.log("in if")
                resetDispatchProcess(eachProcess);
            }else{
                let timeforstartReset = resetTime-currentTime;
                // console.log("timeforstartReset::",timeforstartReset)
                setTimeout(function(){
                    // console.log("in setTime")
                    resetDispatchProcess(eachProcess);
                },timeforstartReset)   
            }
        })        
    }catch(error){
        console.log("cathc error::",error)
    }
}

const testUpdateData = async (req,res)=>{
    console.log("testUpdateData 1634090866094")
    zomeserver.Connection("devZomePower");
    let dispatchDetails = await DispatchEventDetail.findOne({irc_request_id:"9b3f5618548f376fca36d3339262eb60"});
    deviceModeDetails = await getDeviceInfo("1634090866094");
    await setErrorDeviceInfo(dispatchDetails.irc_request_id,deviceModeDetails.device_info,"Temp Has been Updated in between!");
    res.json({status:true,message:"testupdatedata",data:dispatchDetails})
}

const checkDispatchEvent = async (req,res)=>{
    /-- Here we find current date --/
    const currentTimeNow = new Date();

    /-- search cpower DB for cpower event with startDate is less than currentDate and endDate is greater than current date --/
    const findToRunning = await cpowerMockModel.find({
        startDate: {$lte: currentTimeNow}, endDate : {$gte: currentTimeNow},
    });

    /-- Here we find cpower DB where startDate & endDate is less than current date --/
    const findToDone = await cpowerMockModel.find({
        startDate: {$lte: currentTimeNow}, endDate : {$lte: currentTimeNow},
    });


    /-- Here we update status to running --/
    if(findToRunning.length > 0){
        for (let i = 0; i < findToRunning.length; i++) {
            
            /--If status is pending then we update status to running because normal flow is pending to running to done--/
            if(findToRunning[i].status=="pending"){
                await cpowerMockModel.findByIdAndUpdate({_id : findToRunning[i]._id},{status : "running"})
            }
        }
    }
    
    /-- Here we update status to done --/
    if(findToDone.length > 0){
        for (let i = 0; i < findToDone.length; i++) {
            
            if(findToDone[i].status=="running"){
                await cpowerMockModel.findByIdAndUpdate({_id : findToDone[i]._id},{status : "done"})
            }
        }
    }

}

const restartZomekitConnector = async () => {
    log.debug("restarting ZKC");
    exec("cd /Users/chirag/workspace/pro/zome/zome-energy-desk/microservices/zomekit-connector/");
    exec("sudo pm2 -f start start.server.js --name='zomekit'");
    log.debug("restart completed ZKC");
    await delayTime(2000);
}

module.exports = {
    setPoint,
    checkAnyProcessOnGoing,
    testUpdateData,
    checkDispatchEvent,
    resetDispatchProcess
}
// Ref
// if (curruntValue > 35 && curruntValue < 95) {
//     let res = {};
//     let req = {
//       zcReqId: generateIRCRequestId(),
//       tags: "dispatchSetpointDevice",
//       params: {
//         commandType: commandtype,
//         gatewayuuid: gatewayId,
//         commandForDispatch: true,
//       },
//       query: {
//         deviceID: deviceId,
//         command: command,
//         param1: "1",
//         type: modeOfChane > 2 ? 1 : 0,
//         unit: typeofUnit,
//         value: curruntValue,
//       },
//     };