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
const DispatchEventDetail = require('mongo-dbmanager').dispatchEventDetailModel;
/**
 * @description : This is test function for testing the device status 
 * need to test for once with single command once for one device atleast
 * then needs to test same command atleast 10 times and need to check report
 * then need to same process with mupliple device
 * gateway id of test bed dev : d52c80-d9fade-0090-9272NaN69ebfaf3
 * Ex device ids of Test Bed Dev gateway : "1628813484281","1628745272776","1628743846037","1628799534077","1628744971346","1628742864842","1628742074321","1628799004177","1628800317465","1628798701118","1628798059342","1628799963313","1628810668089","1628811784467","1628818726268","1628833955073"
 * W
 * @param {*} req : gatewayId: id of the device
 * @param {*} req : deviceId: id of the device
 * @param {*} req : commandType: type of action
 * @param {*} req : command: sub type of action
 * @param {*} req : param1: for now consider 1 as a fix
 * NOTE : for now we are testing for the setmod temp of device
 * so commandType will be 5004 and command will be 71005 
 * @param {*} res : json
 * {
        "gatewayId":"d52c80-d9fade-0090-9272NaN69ebfaf3",
        "deviceId":"1628813484281",
        "commandType":"5004",
        "command":"71005",
        "param1":"1"
    }
 */
let testDeviceStatus =  async(req,res) => {
    console.log("test device status::",process.env.MONGO_URL);
    // res.json({status:true})
    try {
        const { gatewayId,deviceId,commandType,command,param1 } = req.body;
        // console.log("req.body::",req.body)
        let url =`http://localhost:30008/zomecloud/api/v1/command-to-gateway/${gatewayId}/${commandType}?deviceID=${deviceId}&command=${command}&param1=${param1}`;
        console.log("url::",url)
        var callOptions = {
            url: url,
            method: 'POST',
            body: req.body
        }

        rest.call(
            null,
            callOptions,
            async (err, response, body) => {
                // console.log("err::",err)
                // console.log("response::",response.body)
                // log.debug("=================================================");
                // log.debug("Error", body);
                // log.debug("Error", response);
                // log.debug("Error", err);
                // log.debug("=================================================");
        });

        let msg = 'tmeparature updated';
        // log.info("existingGateways==>", existingGateways);
        res.status(200).json({ msg });
    } catch (error) {
        return res.status(400).json(error.message);
    }   
}

let dispatchSetPoint = async (req,res)=>{
    try{
        let gatewayIds = JSON.parse(req.body.gatewayIds);        
        zomeserver.Connection('devZomePower');
        /**step 1 : Check is selected ongoing dispatch events */
        const allExistingIdsGateways = await DispatchEventDetail.find({ gateway_uuid: gatewayIds, reset_done: false });        
        if(allExistingIdsGateways.length){
            allExistingIdsGatewaysIds = allExistingIdsGateways.map((eachGateway)=>eachGateway.gateway_uuid);
            gatewayIds = gatewayIds.filter((eachId)=> !allExistingIdsGatewaysIds.includes(eachId));
        }
        if(!gatewayIds.length){
            return res.status(200).json({ status:true,message:"Selected gateway(s) have ongoing dispatch process." });
        }       

        /**step 2 :Call Dispatch controller and handle all next steps there */
        let reqparams = {
            gatewayIds:JSON.stringify(gatewayIds),
            excludeDeviceId:req.body.excludeDeviceId,
            temprature:req.body.temprature,
            minutes:req.body.minutes,
            dispatch_type: "manual",
            test:"1"
        }

        var callOptions = {
            url: "http://localhost:30012/zomecloud/api/v1/executeDispatch", // `${zomeKitConnectorUrl}/${setpointEndPoint}`,
            method: 'POST',
            body: reqparams
        }
        rest.call(null,callOptions, async (err, response, body) => {
            console.log("Respose body::",response.body)
        })

        mongoose.connection.close();
        res.status(200).json({ status:true,message:"Dispatch Process Started" });
    }catch(error){
        console.log("error::",error)
        let msg = 'error';
        mongoose.connection.close();
        res.status(200).json({ msg }); 
    }
}

let cpowerdispatchSetPointTest = async (req,res)=>{
    try{
        console.log("cpowerdispatchSetPointTest::")
        var callOptions = {
            url: "http://localhost:30005/zomecloud/api/v1/check-dispatch-event/", // `${zomeKitConnectorUrl}/${setpointEndPoint}`,
            method: 'GET',
            body: {}
        }
        rest.call(null,callOptions, async (err, response, body) => {
            console.log("Respose body::",response.body)
        })

        mongoose.connection.close();
        res.status(200).json({ status:true,message:"cpowerdispatchSetPointTest Process Started" });
    }catch(error){
        console.log("error::",error)
        let msg = 'error';
        mongoose.connection.close();
        res.status(200).json({ msg }); 
    }
}

module.exports = {
    testDeviceStatus,
    dispatchSetPoint,
    cpowerdispatchSetPointTest
}