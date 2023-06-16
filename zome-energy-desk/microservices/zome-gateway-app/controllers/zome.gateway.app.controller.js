var log = require('zome-server').logger.log;
var responseLib = require('zome-server').resp;
const crypto = require('crypto');
const fs = require('fs');
const net = require('net');
var rest = require('zome-server').rest;
var mongoose = require('zome-server').mongoose;
var msConfig = require('zome-config').microservices;
var protocol = process.env.PROTOCOL || 'http';
var serviceHost = process.env.SERVICE_HOST || 'localhost';
var baseUrl = '/zomecloud/api/v1';
const zomeserver = require("zome-server");

var timeToWait=4*60*60000;
var maxNode = 40;
var commandExecutionFlag = false;
var dBExecutionFlag      = false;

const MAX_TIMEOUT_ASYNC_DB = 5*60;

//import zome-utils service for list of constant
const zomeUtils = require('zome-utils');

const gatewayIniStr = fs.readFileSync('../gateway.ini', {encoding:'utf8', flag:'r'}); // this needs to used eventually as mentioned below

var gatewayStrArr = gatewayIniStr.split('\n');
var gatewayIniConfig = {};
for (var iter in gatewayStrArr) {
    if (gatewayStrArr[iter]) {
        var asso = gatewayStrArr[iter].split('=');
        gatewayIniConfig[asso[0].trim()] = asso[1].trim();
    }
}

//This creates a basic node which can store COMMANDS in a queue
class Node {
    constructor(element, res)
    {
        this.info = element;
        this.res = res;
        this.next = null
    }
}

//This creates the linked list on the
class LinkedList {
    constructor()
    {
        this.head = null;
        this.size = 0;
    }

    push(element, res)
    {
        // creates a new node
        if(this.size < maxNode)
        {
            var node = new Node(element, res);
            // to store current node
            var current;

            // if list is Empty add the
            // element and make it head
            if (this.head == null)
                this.head = node;
            else {
                current = this.head;
                // iterate to the end of the
                // list
                while (current.next) {
                    current = current.next;
                }
                // add node
                current.next = node;
            }
            log.info("new command pushed");
            this.size++;
            log.info(this.size);
            return 1;
        }
        else
            return 0;
    }
    pop(){

        if(this.size >=1 )
        {  
            var current = this.head;
            var tempVariable = current.next;
            this.head = tempVariable;
            this.size--;
            commandExecutionFlag = true;
            var tempRes = current.res

            //send the current value to cli app.
            var client = net.connect({port: 9090}, function() {
                log.info('connected to server!');
                client.write(current.info);
             });
            client.on('error', function() {
                var deviceInfoStr = "error : Could not connect to Wrapper - ECONNREFUSED\n";
                log.info(deviceInfoStr);
                var deviceInfo = convertStrToJson(deviceInfoStr);
                responseLib.handleSuccess(deviceInfo, tempRes);
                commandExecutionFlag = false;
            });

            client.on('data', function(data) {
                var deviceInfoStr = data.toString();
                if(deviceInfoStr == "Command Received")
                    client.end();
                else
                    client.end();
            });

            //mark flag = true
            log.info("New command popped!")
            log.info(this.size);
            return;
        }

        log.info("Nothing to execute")
    }

}


//Need to move all this in separate linked list implementation into separate files.
//Below is the linked list to create the table to keep track of the requestIDs

class dBNode {
    constructor( dbCommandType,requestID)
    {
        this.comtype = dbCommandType;
        this.rID = requestID;
        this.createdAt = Math.floor(+new Date() / 1000);
        this.next = null;
    }
}


//This creates the linked list on the
class DbList {
    constructor()
    {
        this.head = null;
    }

    push(dbCommandType,requestID)
    {
        //Check if flag is true which means the list is under use, dont mess now!
        if(dBExecutionFlag){
            return 0;
        }
        // creates a new node
        dBExecutionFlag = true;
        var node = new dBNode(dbCommandType,requestID);
        console.log("---------------------- " + node.rID );
        // to store current node
        var current;
        // if list is Empty add the
        // element and make it head
        if (this.head == null)
            this.head = node;
         else {
            current = this.head;

            // iterate to the end of the
            // list
            while (current.next) {
                current = current.next;
            }
            // add node
            current.next = node;
        }
        log.info("new RequestID pushed");
        dBExecutionFlag = false;
        return 1;
    }
    pop(dbCmdType){

        //Check if flag is true which means the list is under use, dont mess now!
        if(dBExecutionFlag){
            return "In-Use";
        }
        dBExecutionFlag = true;
        if(this.head != null )
        { 
            //Since the nodes are added in the order of the commands coming through, we will check in iterative order
            //starting with the head. earlier means this is the oldest existing entry for the commandtype
            if(this.head.comtype == dbCmdType){
                    var current = this.head;
                    var tempVariable = current.next;
                    this.head = tempVariable;
                    log.info("requestID popped!");
                    dBExecutionFlag = false;
                    console.log("---- returning " + current.rID );
                    return current.rID;

            } else {
                var current = this.head;
                while(current.next){
                    var prev = current;//store current into a variable to reference in case of nodes getting removed in the middle of the list
                    current = current.next;
                    if(current.comtype == dbCmdType){
                        log.info("requestID popped!");
                        prev.next = current.next
                        dBExecutionFlag = false;
                        console.log("---- returning " + current.rID );
                        return current.rID;
                    }
                }
                dBExecutionFlag = false;
                return "No Entry"
            }

        } else {
            dBExecutionFlag = false;
            return "No Entry";
        }

    }
    clear(){
        dBExecutionFlag = true;
        if(this.head != null )
        {
            //Since the nodes are added in the order of the commands coming through, we will check in iterative order
            //starting with the head. earlier means this is the oldest existing entry for the commandtype

            var current = this.head;
            var flag = 0;
            //Takes care of head node cases..
            var timediff = 0;
            while(flag == 0){
                timediff = Math.floor(+new Date() / 1000) - current.createdAt;
                console.log(timediff);
                if(timediff > MAX_TIMEOUT_ASYNC_DB){
                    this.head = current.next;
                    current = this.head;
                    log.info("Head entry deleted!");
                    if(current == null){
                        log.info("Single and only entry deleted!");
                        dBExecutionFlag = false;
                        return;
                    }
                } else {
                    flag = 1;
                }
            }

            //Head: there are no more cases.
            if(current.next == null){
                dBExecutionFlag = false;
                return;
            }
            var prev = current;
            current = current.next; 
            while(current.next != null){
                timediff = Math.floor(+new Date() / 1000) - current.createdAt;
                if(timediff > MAX_TIMEOUT_ASYNC_DB){
                    prev.next = current.next;
                    current = null;
                    current = current.next;
                } else {
                    current = current.next;
                }
            }
        }
        log.info("No more old entries!");
        dBExecutionFlag = false;
    }
}


var listForCommand = new LinkedList();
var listForRequestID = new DbList();

function executeCommandLL()
{
    //check if flag is false
    if(!commandExecutionFlag)
    {
        listForCommand.pop();
    }
}
function executeDbLL()
{
    //check if flag is false
    if(!dBExecutionFlag)
    {
        listForRequestID.clear();
    }
}

let loopCheckCommandFromLL = async ()=>{
    setInterval(()=>{
        executeCommandLL();
    },5*1000);

    setInterval(()=>{
        executeDbLL();
    },5*1000*60);
}


async function getDeviceInfoFromClient(req, res, next) {
    //return new Promise( async (resolve, reject) => {
        var ccReqId = crypto.createHash('sha256').update(new Date().getTime().toString()).digest('hex');
        req.ccReqId = ccReqId.substr(0, 32);
        log.info({req: req}, "Request received to retrieve Z-wave devices info for this Gateway with reqId: " + req.ccReqId);
        //const deviceInfoStr = fs.readFileSync('./device-info.txt', {encoding:'utf8', flag:'r'});
        var dbCommandType = "GENERAL";

        var commandtype = req.body.commandType

        var constructedMessage = "";

        if(commandtype == zomeUtils.ADD_DEVICE ) {
            constructedMessage = commandtype + " " + req.body.reqID + " " + req.body.desc;
    
        }
        else if(commandtype == zomeUtils.REMOVE_DEVICE || commandtype == zomeUtils.GET_DEVICE_LIST || commandtype == zomeUtils.IMAGE_VERSION)
        {
            constructedMessage = commandtype + " " + req.body.reqID;
        }
        else if(commandtype == zomeUtils.ADD_DEVICE_DSK)
        {
            constructedMessage = commandtype + " " + req.body.reqID + " " + req.body.param1 + " " + req.body.desc;
        } 
        else if(commandtype == zomeUtils.SET_PARAMS)
        {
            var command = req.body.command;
            switch(command)
            {
                case zomeUtils.SET_TEMPERATURE :
                    constructedMessage = commandtype + " " + req.body.reqID + " " + req.body.command  + " " + req.body.type + " " + req.body.unit + " " + req.body.value + " " + req.body.deviceID;
                    dbCommandType = "TEMPERATURE_UPDATE";
                    break;
                case zomeUtils.SET_DIFFERENTIAL_TEMP_MODE:
                case zomeUtils.SET_TEMP_REPORT_FILTER :
                    constructedMessage = commandtype + " " + req.body.reqID + " " + req.body.command  + " " + req.body.param1 + " " + req.body.param2 + " " + req.body.deviceID;
                    break;
                case zomeUtils.SET_TSTAT_MODE :
                    constructedMessage = commandtype + " " + req.body.reqID + " " + req.body.command + " " + req.body.param1 + " " + req.body.deviceID;
                    dbCommandType = "TSTAT_MODE";
                    break;
                default :
                constructedMessage = commandtype + " " + req.body.reqID + " " + req.body.command + " " + req.body.param1 + " " + req.body.deviceID;
                break;
            }
        }
        else if (commandtype == zomeUtils.GET_PARAMS) 
        {
            log.info(req.body);
            var command = req.body.command;
            switch(command)
            {
                case zomeUtils.GET_SET_POINT_TEMP_VAL :
                    dbCommandType = "TEMPERATURE_UPDATE";
                    constructedMessage = commandtype + " " + req.body.reqID + " " + req.body.command + " " + req.body.param1 + " " + req.body.deviceID;
                    break;
                case zomeUtils.GET_LIVE_TEMP :
                    constructedMessage = commandtype + " " + req.body.reqID + " " + req.body.command + " " + req.body.param1 + " " + req.body.deviceID;
                    dbCommandType = "LIVE_TEMPERATURE_UPDATE";
                    break;
                case zomeUtils.GET_DISPLAY_UNIT :
                    constructedMessage = commandtype + " " + req.body.reqID + " " + req.body.command + " " + req.body.deviceID;
                    dbCommandType = "DISPLAY_UNIT";
                    break;
                case zomeUtils.GET_TSTAT_MODE :
                    constructedMessage = commandtype + " " + req.body.reqID + " " + req.body.command + " " + req.body.deviceID;
                    dbCommandType = "TSTAT_MODE";
                    break;
                default:
                    constructedMessage = commandtype + " " + req.body.reqID + " " + req.body.command + " " + req.body.deviceID;
                    break;
            }
        }
        else if(commandtype == zomeUtils.GET_ALL_PARAMS_TSTAT || commandtype == zomeUtils.GET_ALL_PARAMS_SWITCH || commandtype == zomeUtils.REMOVE_NODE)
        {
            constructedMessage = commandtype + " " + req.body.reqID + " " + req.body.deviceID;
        }
        else if (commandtype == zomeUtils.END_DEVICE_UPDATE || commandtype == zomeUtils.ADD_TO_GROUP || commandtype == zomeUtils.REMOVE_FROM_GROUP) 
        {
            constructedMessage = commandtype + " " + req.body.reqID + " " + req.body.command + " " + req.body.param1 + " " + req.body.deviceID;
        } else {
            constructedMessage = commandtype + " " + req.body.reqID + " " + req.body.command +  " " + req.body.param1;
        }

        log.info(constructedMessage);

        var toQueue = listForCommand.push(constructedMessage, res);
        var isDbPushDone = 0;
        while(isDbPushDone == 0){
            isDbPushDone = listForRequestID.push(dbCommandType, req.body.reqID);
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
        if(!toQueue)
        {
            responseLib.handleSuccess("Too many requests", res);
        }
        //return;

        //var client = net.connect({port: 9090}, function() {
        //    log.info('connected to server!');
         //   client.write(constructedMessage);
         //});
         //client.on('error', function() {
        //    deviceInfoStr = "error : Could not connect to Wrapper - ECONNREFUSED\n";
        //    log.info(deviceInfoStr);
         //   resolve(deviceInfoStr);
         //});
         //client.end();

         //client.on('data', function(data) {
         //   deviceInfoStr = data.toString();
         //   if(deviceInfoStr == "Command Received")
         //       client.end();
         //   else
          //      client.end();
         //   resolve(deviceInfoStr);
         //});

         //TODO: handle error cases from client
    //});
}


async function sendCommand(req, res, next) {
    let deviceInfoStr = await getDeviceInfoFromClient(req, res, next);

    //var deviceInfo = convertStrToJson(deviceInfoStr);
    //responseLib.handleSuccess(deviceInfo, res);
}

function AsyncTcpChan() {
    let server = net.createServer( connection => {
        // run all of this when a client connects
        log.info("new connection"); 
        connection.on("data", async data => {
            var appData = data.toString();
            log.info(appData);
            var appOutput = convertStrToJson(appData);
            var requestIdFromDb = "In-Use";
            var count = 0;
            while(requestIdFromDb == "In-Use"){
                requestIdFromDb = listForRequestID.pop(appOutput[0].MSG_TYPE);
                console.log(requestIdFromDb);
                await new Promise(resolve => setTimeout(resolve, 1000));
                if(count == 10){
                    requestIdFromDb = "timeout occured";
                    break;
                }
                count++;//will check for 10 seconds. Else it will time out
            }
            appOutput[0]["requestIdFrmDB"] = requestIdFromDb;
            log.info("appOutput");
            log.info(appOutput);
            var callOptions = {
                url: protocol + '://' + serviceHost + ':' + msConfig.services.zomeGatewayAgent.port + baseUrl + '/sendDeviceOutput',
                method: 'POST',
                body : appOutput
            }

        rest.call(
            null,
            callOptions,
            function (err, response, body) {
                log.debug("REST call returned from " + msConfig.services.zomeGatewayAgent.name + " service");
                log.error(err);
                log.info(body);
            });
        }); 

    });
    server.listen(9091, () => {
         log.info("Waiting for a connection!");
    });
}

function SyncTcpChan() {
    let server = net.createServer(connection => {
        // run all of this when a client connects
        log.info("new connection");
        connection.on("data", data => {
            var appData = data.toString();
            log.info(appData);
            var appSyncOutput = convertStrToJson(appData);
            log.info("SyncOutput");
            log.info(appSyncOutput);
            var callOptions = {
                url: protocol + '://' + serviceHost + ':' + msConfig.services.zomeGatewayAgent.port + baseUrl + '/sendSyncDeviceOutput',
                method: 'POST',
                body : appSyncOutput,
                timeout: 5000
            }

        rest.call(
            null,
            callOptions,
            function (err, response, body) {
                log.debug("REST call returned from " + msConfig.services.zomeGatewayAgent.name + " service");
                log.error(err);
                log.info(body);
                commandExecutionFlag = false;
            });
        });
    });
    server.listen(9092, () => {
         log.info("Waiting for a sync connection!");
    });
}


function convertStrToJson(inputString) {
    var deviceInfoArr = inputString.split('\n');
    var deviceInfo = [];
    var deviceinfoJSON = {};
    console.log(inputString);
    for (var iter in deviceInfoArr) {
        if (deviceInfoArr[iter] && deviceInfoArr[iter] === '*******************************') {
            continue;
        } else if (deviceInfoArr[iter]) {
            var asso = deviceInfoArr[iter].split(':');
            deviceinfoJSON[asso[0].trim()] = asso[1].trim();
        } else if (deviceInfoArr[iter] === '') {
            Object.keys(deviceinfoJSON).length !== 0 && deviceInfo.push(deviceinfoJSON);
            deviceinfoJSON = {};
        }
    }
    return deviceInfo;
}

/**
 * @description : This function execute sh file of upload sys log to s3 manually!
 * /uploadsyslog 
 */
let uploadSysLog = async (req,res)=>{
    try{
        console.log("sucess::")
        shellScriptFunction();
        res.json({status:true,message:"System log uploaded manually succesfully!"})
        
    }catch(error){
        console.log("cathc error::",error)
        res.json({status:false})
    }
}


/**
 * @description : THis function is going to call while app invoke
 * it will excecute function of uplaod file to s3 on invoke and ininterval of 60 mins 
 * NOTE : for now we have kept this itnerval but in future needs to manage it through channels
 */
let executeShInInterval = async ()=>{
    shellScriptFunction();

    var gatewayIniStrTmp = fs.readFileSync('../gateway.ini', {encoding:'utf8', flag:'r'});
    var wantLogging = 1;
    var gatewayStrArr = gatewayIniStrTmp.split('\n');
    for (var iter in gatewayStrArr) {
        var tempVar = {};
        if (gatewayStrArr[iter]) {
            var asso = gatewayStrArr[iter].split('=');
            tempVar[asso[0].trim()] = asso[1].trim();
            if(asso[0].trim() == "logging"){
                wantLogging = asso[1].trim();
            }
        }
    }
    if(wantLogging == 1){
        setInterval(()=>{
            //console.log("in interval of 60 seconds")
            shellScriptFunction();
        },timeToWait)
    }
}

/**
 * @description : This function is execute sh file
 * it takes log of zome cli , gateway app and gateway agent
 * then it makes tar of all those logs and uplaod it to s3
 */
let shellScriptFunction = ()=>{

    const exec = require('child_process').exec;
    const myShellScript = exec(`./../zome-gateway-log.sh ${gatewayIniConfig.s3Key} ${gatewayIniConfig.s3Secret} ${gatewayIniConfig.bucket}`);
}


module.exports = {
    sendCommand,
    AsyncTcpChan,
    SyncTcpChan,
    uploadSysLog,
    executeShInInterval,
    loopCheckCommandFromLL
};
