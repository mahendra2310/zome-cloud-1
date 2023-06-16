var log = require('zome-server').logger.log;
var responseLib = require('zome-server').resp;
const crypto = require('crypto');
const si = require('systeminformation');
var irc = require('irc-framework');
var bot = new irc.Client();
var ircServerConfig = require('zome-config').irc.ircServer;
const fs = require('fs');
var msConfig = require('zome-config').microservices;
var protocol = process.env.PROTOCOL || 'http';
var serviceHost = process.env.SERVICE_HOST || 'localhost';
var baseUrl = '/zomecloud/api/v1';
var rest = require('zome-server').rest;
const zomeUtils = require('zome-utils');
const { MS_VERSION } = require('../../core/utils');

const initializeBot = function() {};

//Every Agent will learn this through gateway.ini file...
//var gatewayUuid = '472c6b7c-8a2c-49de-877d-52a83d1fad72';
var gatewayUuid = null;
var gatewayAgentNick = null;
var gatewayIrc_server = null;
var ms_gateway_version = null;

const gatewayIniStr = fs.readFileSync('../gateway.ini', {encoding:'utf8', flag:'r'}); // this needs to used eventually as mentioned below

//Get the agent nick and gatewayUUID
var gatewayStrArr = gatewayIniStr.split('\n');
for (var iter in gatewayStrArr) {
    var tempVar = {};
    if (gatewayStrArr[iter]) {
        var asso = gatewayStrArr[iter].split('=');
        tempVar[asso[0].trim()] = asso[1].trim();
        if(asso[0].trim() == "gateway-uuid"){
            gatewayUuid = asso[1].trim();
        } else if(asso[0].trim() == "gateway-agent-nick"){
            gatewayAgentNick = asso[1].trim();
        } else if(asso[0].trim() == "IRC-Server"){
            gatewayIrc_server = asso[1].trim();
        }else if(asso[0].trim() == "ms-gateway-version"){
            ms_gateway_version = asso[1].trim();
        }
    }
}

bot.connect({
    host: gatewayIrc_server,
    port: ircServerConfig.port,
    nick: gatewayAgentNick + "_" + Math.floor(Math.random() * (1000)),
    auto_reconnect_max_wait: ircServerConfig.max_wait,
    auto_reconnect_max_retries: ircServerConfig.max_retries,
    ping_interval: ircServerConfig.ping_int,
    ping_timeout: ircServerConfig.ping_time,
    auto_reconnect: ircServerConfig.auto_recon
});

var channel = null;
var channel2 = null;
var buffers = [];
var buffers2 = [];
bot.on('registered', function() {
    channel = bot.channel('#zome-broadcast-feed');
    buffers.push(channel);

    channel.join();
    channel.say('Zome Gateway Agent Connected to broadcast feed ...');

    channel2 = bot.channel('#zome-datafeed-' + gatewayUuid);
    buffers2.push(channel2);

    channel2.join();
    channel2.say('Zome Gateway Agent Connected to gateway channel ...'+gatewayUuid);
});

bot.matchMessage(/commandType/, function(event) {

    var flagSendRest = 1;
    var inputIrcMessageJson = JSON.parse(event.message);
    log.info(inputIrcMessageJson);
    var options;
    var commandtype = inputIrcMessageJson.commandType;

    if(commandtype == zomeUtils.ADD_DEVICE) {
        options = {
            commandType: commandtype,
            desc:inputIrcMessageJson.desc,
            reqID:inputIrcMessageJson.reqId
        }
    } 
    else if(commandtype == zomeUtils.REMOVE_DEVICE || commandtype == zomeUtils.GET_DEVICE_LIST || commandtype == zomeUtils.IMAGE_VERSION)
    {
        options = {
            commandType: commandtype,
            reqID:inputIrcMessageJson.reqId
        }
    }
    else if(commandtype == zomeUtils.ADD_DEVICE_DSK)
    {
        options = {
            commandType: commandtype,
            param1: inputIrcMessageJson.param1,
            desc:inputIrcMessageJson.desc,
            reqID:inputIrcMessageJson.reqId
        }
    } 
    else if(commandtype == zomeUtils.SET_PARAMS)
    {
        var command = inputIrcMessageJson.command;
        switch(command)
        {
            case zomeUtils.SET_TEMPERATURE :
                options = {
                    commandType: commandtype,
                    reqID:inputIrcMessageJson.reqId,
                    deviceID: inputIrcMessageJson.deviceID,
                    command: inputIrcMessageJson.command,
                    type: inputIrcMessageJson.type,
                    unit: inputIrcMessageJson.unit,
                    value: inputIrcMessageJson.value
                }
                break;
            case zomeUtils.SET_DIFFERENTIAL_TEMP_MODE:
            case zomeUtils.SET_TEMP_REPORT_FILTER :
                options = {
                    commandType: commandtype,
                    reqID:inputIrcMessageJson.reqId,
                    deviceID: inputIrcMessageJson.deviceID,
                    command: inputIrcMessageJson.command,
                    param1: inputIrcMessageJson.param1,
                    param2: inputIrcMessageJson.param2
                }
                break;
                
            default :
                options = {
                    commandType: commandtype,
                    reqID:inputIrcMessageJson.reqId,
                    deviceID: inputIrcMessageJson.deviceID,
                    command: inputIrcMessageJson.command,
                    param1: inputIrcMessageJson.param1
                }                
                break;
        }
    }
    else if (commandtype == zomeUtils.GET_PARAMS) 
    {
        var command = inputIrcMessageJson.command;
        switch(command)
        {
            case zomeUtils.GET_SET_POINT_TEMP_VAL :
            case zomeUtils.GET_LIVE_TEMP :
                options = {
                    commandType: commandtype,
                    reqID:inputIrcMessageJson.reqId,
                    deviceID: inputIrcMessageJson.deviceID,
                    command: inputIrcMessageJson.command,
                    param1: inputIrcMessageJson.param1
                }
                break;

            default:
                options = {
                    commandType: commandtype,
                    reqID:inputIrcMessageJson.reqId,
                    deviceID: inputIrcMessageJson.deviceID,
                    command: inputIrcMessageJson.command
                }
                break;
        }
    }
    else if (commandtype == zomeUtils.GET_ALL_PARAMS_TSTAT || commandtype == zomeUtils.GET_ALL_PARAMS_SWITCH || commandtype == zomeUtils.REMOVE_NODE) {
        options = {
            commandType: commandtype,
            reqID:inputIrcMessageJson.reqId,
            deviceID: inputIrcMessageJson.deviceID
        }
    }
    else if (commandtype == zomeUtils.END_DEVICE_UPDATE || commandtype == zomeUtils.ADD_TO_GROUP || commandtype ==  zomeUtils.CONTROL_GROUP || commandtype == zomeUtils.REMOVE_FROM_GROUP) 
    {
        options = {
            commandType: commandtype,
            reqID:inputIrcMessageJson.reqId,
            deviceID: inputIrcMessageJson.deviceID,
            command: inputIrcMessageJson.command,
            param1: inputIrcMessageJson.param1,
            param2: inputIrcMessageJson.param2
        }        
    } else if (commandtype == zomeUtils.MS_VERSION){
        flagSendRest = 0; // for Microservice  version, we dont need anything from the devices, so dont send it to the cli-app
    } else {
        options = {
            commandType: commandtype,
            reqID:inputIrcMessageJson.reqId,
            command: inputIrcMessageJson.command,
            param1: inputIrcMessageJson.param1
        }
    }

    if(flagSendRest) {

        var callOptions = {
            url: protocol + '://' + serviceHost + ':' + msConfig.services.zomeGatewayApp.port + baseUrl + '/sendCommand',
            body: options,
            method: 'get'
        }
        log.info(callOptions);
        rest.call(
            null,
            callOptions,
            function (err, response, body) {

                var jsonbody = null;
                if(body != null)
                   jsonbody = JSON.parse(body);

                log.debug("REST call returned from " + msConfig.services.zomeGatewayApp.name + " service");

                var messageJSON = JSON.parse(event.message);
                var response = {
                    'command': 'command-response',
                    'GatewayUUID': gatewayUuid,
                    'deviceInfo' : null,
                    'error': null,
                    'nbDevice' : null,
                    'RequestID' : messageJSON.reqId
                }
                if (err) {
                    log.error(err);
                    var errorJsn = err.toString();
                    if(!(errorJsn.includes("socket hang up") || errorJsn.includes("ESOCKETTIMEDOUT"))){
                        response.error = err;
                        //event.reply(JSON.stringify(response));
                        breakupMessageFunc(response, messageJSON.reqId, 2);
                    }
                } else if(body == null)  // case if gateway app is not running
                {
                    response.nbDevice = 0;
                    response.error = "Gateway App not running";
                    //event.reply(JSON.stringify(response));
                    breakupMessageFunc(response, messageJSON.reqId, 2);
                } else if(jsonbody.data[0].error != null) //case for cwrapper not working
                {
                    response.nbDevice = jsonbody.data.length;;
                    response.error = jsonbody.data[0].error;
                    //event.reply(JSON.stringify(response));
                    breakupMessageFunc(response, messageJSON.reqId, 2);
                } else {
                    for (var iter in jsonbody.data) {
                        jsonbody.data[iter].reqId = messageJSON.reqId;
                    }
                    response.deviceInfo = jsonbody.data;
                    response.nbDevice = jsonbody.data.length;
                    //event.reply(JSON.stringify(response));
                    breakupMessageFunc(response, messageJSON.reqId, 2);
                }
            }
        );
    } else {
        var messageJSON = JSON.parse(event.message);
        if (commandtype == zomeUtils.MS_VERSION){
            var response = {
                'command':'command-response',
                'GatewayUUID': gatewayUuid,
                'deviceInfo' : [{"Response-type" : "MS-VERSION" , "version" : ms_gateway_version , "RequestID" : inputIrcMessageJson.reqId}],
                'nbDevice' : null,
                'RequestID' : messageJSON.reqId
            }
        }
        //event.reply(JSON.stringify(response));
        breakupMessageFunc(response, messageJSON.reqId, 2);
    }

});

async function asyncDeviceOutput (req, res, next) {

    log.info('request at the async device output to the agent controller');
    log.info(req.body);

    var response = {
        'command': 'device-async-output',
        'GatewayUUID': gatewayUuid,
        'deviceInfo' : req.body,
        'error' : null,
        'nbDevice' : req.body.length
    }
    //channel2.say(JSON.stringify(response));
    //channel.say(JSON.stringify(response));

    var msgReqID         = "ASYNC-" + generateBrdcstIRCRequestId();

    breakupMessageFunc(response, msgReqID, 1);
}

const generateBrdcstIRCRequestId = () => {
    const randomString = crypto
      .createHash("sha256")
      .update(new Date().getTime().toString())
      .digest("hex");
    const finalHash = randomString.substr(10, 16);
    return finalHash;
  };

async function syncDeviceOutput (req, res, next) {

    log.info('request at the sync device output to the agent controller');
    log.info(req.body);

    var jsonbody = req.body;

    var response = {
        'command': 'command-response',
        'GatewayUUID': gatewayUuid,
        'deviceInfo' : null,
        'error': null,
        'nbDevice' : null
    }

    var isErr = 0;
    if (req.err) {
        log.error(req.err);
        response.error = req.err;
        isErr = 1;
    } else {
        //for (var iter in jsonbody.data) {
        //    jsonbody.data[iter].reqId = messageJSON.reqId;
        //}
        response.deviceInfo = jsonbody;
        response.nbDevice = jsonbody.length;
        log.info(response);
    }

    breakupMessageFunc(response, req.body[0].RequestID, 2);
}

function SendToIRC(sendSTR, chan)
{
    if(chan == 1){
        channel.say(JSON.stringify(sendSTR));
    }
    else
        channel2.say(JSON.stringify(sendSTR));
}

// Function for breaking message in to smaller chunks of 100 characters and sending
// Required items to be kept in mind
// Response -> The item to be sent ( need to stringify )
// Request  -> RequestID to keep track of the request from the webapp

function breakupMessageFunc(strToSend, ReqIdToSend, channelNumber)
{
    var JsonStr = JSON.stringify(strToSend);
    var brokenMsgArr      = JsonStr.match(/.{1,100}/g);
    var NbMessages        = brokenMsgArr.length;

    for(var i = 0; i<NbMessages; i++)
    {
        var toBeSent = {
             'NbMsg' :  (i+1) + "/" + NbMessages,
             'body'  :  brokenMsgArr[i],
             'ReqID' :  ReqIdToSend
        }
        setTimeout(SendToIRC, 300, toBeSent,channelNumber) ;
    }
}

module.exports = {
    asyncDeviceOutput,
    initializeBot,
    syncDeviceOutput
};

function ResetConnections() {
    log.info(`Reset Connection..`);

    bot.connect({
        host: gatewayIrc_server,
        port: ircServerConfig.port,
        nick: gatewayAgentNick + "_" + Math.floor(Math.random() * (1000)),
        // auto_reconnect_max_wait: ircServerConfig.max_wait,
        // auto_reconnect_max_retries: ircServerConfig.max_retries,
        // ping_interval: ircServerConfig.ping_int,
        // ping_timeout: ircServerConfig.ping_time,
        // auto_reconnect: ircServerConfig.auto_recon
    });

}
bot.startPeriodicPing();

bot.on('close', function(){
    setTimeout(ResetConnections, 5000);
});