const crypto = require("crypto");
const log = require("zome-server").logger.log;
const zomeserver = require("zome-server");
const zomeUtils = require("zome-utils");
const mongoose = require('zome-server').mongoose;
const responseLib = require("zome-server").resp;
const Audit = require("mongo-dbmanager").auditmodel;
//const AsyncAuditRef = require("mongo-dbmanager").asyncauditmodel;
const Config = require("mongo-dbmanager").configmodel;
const Queue = require("mongo-dbmanager").queuemodel;
const zomekitConstants = require("../../../utils/constant");
const { storeDeviceToMongoDb, saveIRCFeedMessages, retrieveIRCFeedMessages } = require("../store/device.to.db.function");
const { estIrcBotConnection } = require('../connection/irc.bot.connection.function');
let rTC = process.env.RETRYCOUNT || zomekitConstants.TOTAL_RETRY_OF_COMMANDS;
const retryCommands = ['71000','71001','71002','71003','71004','71005','71006','71007','71008','71009','71010','71011','71012','71013','71014','81000','81001','81002','81003','81004','81005','81006','81007','81008','81009','81010','81011','81012','81013','81014','81015','81016','81017','81018','81019']
var commbinedStr = "";
var isRetryCompleted = true;
var isResponseSent = false;
let delayfunc;
// const init = () =>{
//   isRetryCompleted = true;
//   isResponseSent = false;
// }
const generateIRCRequestId = () => {
  const randomString = crypto
    .createHash("sha256")
    .update(new Date().getTime().toString())
    .digest("hex");
  const finalHash = randomString.substr(0, 32);
  return finalHash;
};
function generateIRCMessageReq(commandType, requestPayload, gatewayUuid) {
  const commonMessage = {
    commandType: requestPayload.params.commandType,
    gatewayUuid: gatewayUuid,
    reqId: requestPayload.zcReqId,
  };
  const subCommand = {
    [zomeUtils.SET_TEMPERATURE]: {
      deviceID: requestPayload.query.deviceID,
      command: requestPayload.query.command,
      type: requestPayload.query.type,
      unit: requestPayload.query.unit,
      value: requestPayload.query.value,
    },
    [zomeUtils.SET_DIFFERENTIAL_TEMP_MODE]: {
      param2: requestPayload.query.param2,
    },
    [zomeUtils.GET_SET_POINT_TEMP_VAL]: {
      param1: requestPayload.query.param1,
    },
    [zomeUtils.GET_LIVE_TEMP]: {
      param1: requestPayload.query.param1,
    },
  };
  const command = {
    [zomeUtils.ADD_DEVICE]: {
      ...commonMessage,
      desc: requestPayload.query.desc,
    },
    [zomeUtils.REMOVE_DEVICE]: {
      ...commonMessage,
    },
    [zomeUtils.GET_DEVICE_LIST]: {
      ...commonMessage,
    },
    [zomeUtils.IMAGE_VERSION]: {
      ...commonMessage,
    },
    [zomeUtils.MS_VERSION]: {
      ...commonMessage,
    },
    [zomeUtils.ADD_DEVICE_DSK]: {
      ...commonMessage,
      param1: requestPayload.query.param1,
      desc: requestPayload.query.desc,
    },
    [zomeUtils.SET_PARAMS]: {
      ...commonMessage,
      deviceID: requestPayload.query.deviceID,
      command: requestPayload.query.command,
      param1: requestPayload.query.param1,
      ...subCommand[requestPayload.query.command],
    },
    [zomeUtils.GET_PARAMS]: {
      ...commonMessage,
      deviceID: requestPayload.query.deviceID,
      command: requestPayload.query.command,
      ...subCommand[requestPayload.query.command],
    },
    [zomeUtils.GET_ALL_PARAMS_TSTAT]: {
      ...commonMessage,
      deviceID: requestPayload.query.deviceID,
    },
    [zomeUtils.GET_ALL_PARAMS_SWITCH]: {
      ...commonMessage,
      deviceID: requestPayload.query.deviceID,
    },
    [zomeUtils.REMOVE_NODE]: {
      ...commonMessage,
      deviceID: requestPayload.query.deviceID,
    },
    [zomeUtils.END_DEVICE_UPDATE]: {
      ...commonMessage,
      deviceID: requestPayload.query.deviceID,
      param1: requestPayload.query.param1,
      param2: requestPayload.query.param2,
    },
    [zomeUtils.ADD_TO_GROUP]: {
      ...commonMessage,
      deviceID: requestPayload.query.deviceID,
      param1: requestPayload.query.param1,
      param2: requestPayload.query.param2,
    },
    [zomeUtils.CONTROL_GROUP]: {
      ...commonMessage,
      deviceID: requestPayload.query.deviceID,
      param1: requestPayload.query.param1,
      param2: requestPayload.query.param2,
    },
    [zomeUtils.REMOVE_FROM_GROUP]: {
      ...commonMessage,
      deviceID: requestPayload.query.deviceID,
      param1: requestPayload.query.param1,
      param2: requestPayload.query.param2,
    },
    default: {
      ...commonMessage,
      param1: requestPayload.query.param1,
    },
  };
  const finalCommand = command[commandType ? commandType : "default"];
  return finalCommand;
};

const prepareMessage = async (req) => {
  log.info("Reached at async sendIRC");
  isResponseSent = false;
  combinedStr = "";
  isRetryCompleted = true;
  try {
    if (!req.zcReqId) {
      req.zcReqId = generateIRCRequestId();
    }
    const gatewayUuid = req.params.gatewayuuid;
    //log.info("Request received to retrieve Z-wave devices info for a Gateway with reqId: " + req.zcReqId);
    log.debug("Request received to retrieve Z-wave devices info for a Gateway with reqId: " + req.zcReqId +" and with request: " + gatewayUuid);
    log.debug(req.query);
    //Find which command type are we sending
    const commandType = req.params.commandType;
    log.info(commandType);
    const message = await generateIRCMessageReq(commandType, req, gatewayUuid);
    //log.info(JSON.stringify(message));
    log.info("This is final command", JSON.stringify(message));
    zomeserver.Connection();
    const auditObj = {
      command: message,
      request_id: message.reqId,
      command_type: message.commandType,
      retry_count: 0,
    };
    
    try {
      log.info("reqId while creating the audit data : ",message.reqId);
      //log.info(message.reqId);
      await new Audit(auditObj).save();
    } catch (e) {
      log.info("error while adding the audit object", e);
    }
    return message;
  } catch (error) {
    log.error(error);
    throw error;
  }
}

async function aggregateIrcString(str, bot) {
  commbinedStr = commbinedStr + str;
  log.info("commbinedStr: " + commbinedStr);
  if (str.includes("error")) {
    // should be nbdevice
    let output = JSON.parse(commbinedStr);
    log.info(output);
    commbinedStr = "";
    return output;
  }
}

async function messageRecombine(messageChunk) {
  log.info("Received message : " + messageChunk);
  if(messageChunk.includes("NbMsg")){
    var jsonStr = JSON.parse(messageChunk);
    var messageNum = jsonStr.NbMsg;
    console.log("messageNum: " + messageNum);
    var msgBody    = jsonStr.body;
    var ReqID      = jsonStr.ReqID;
    commbinedStr = commbinedStr + msgBody;
    console.log(commbinedStr);
    var numdelimit = messageNum.split("/");

    await saveIRCFeedMessages({
      messageChunk: parseInt(numdelimit[0]),
      requestId: ReqID,
      feed: msgBody,
      isBroadcast: false,
    });

    if(numdelimit[0] == numdelimit[1]) {
      let output = JSON.parse(commbinedStr);
      log.info(output);
      commbinedStr = "";
      const messagesRetrievedFromDB = await retrieveIRCFeedMessages(jsonStr.ReqID);
      const ircResponseMessage = await aggregateMessages(messagesRetrievedFromDB);
      log.debug("ircResponseMessage after combination: ");
      log.debug(ircResponseMessage);
      if (ircResponseMessage === undefined) {
        return "error";
      }
      return ircResponseMessage;
    }
  }
}

async function aggregateMessages(messages) {
  const ircAggregatedMessageStr = messages.reduce((result, message) => {
    return result + message.feed;
  }, '');
  log.debug('ircAggregatedMessageStr ', ircAggregatedMessageStr);
  return JSON.parse(ircAggregatedMessageStr);
}


async function processIRCResponse(ircResponse, gatewayUUID,  bot, req, res) {
  log.debug("received ircResponse to process ", ircResponse);
  if (ircResponse && ircResponse.deviceInfo !== null) {
    log.debug("received the full ircResponse ", ircResponse);
    const finalIrcResponse = ircResponse;
    log.debug("finalIrcResponse", finalIrcResponse);
    const deviceInfo = finalIrcResponse.deviceInfo[0];
    if ((deviceInfo["Status"] !== undefined && deviceInfo["Status"] !== "SUCCESS") || (deviceInfo["status"] !== undefined && deviceInfo["status"] !== "SUCCESS")) {
      log.info('device info after failure', deviceInfo);
      isRetryCompleted = false;
      // await retryExecution(deviceInfo, res);
      log.debug('reaching here');
    } else {
      isRetryCompleted = true;
    }
    await notifyQueue(finalIrcResponse, req);
    await storeDeviceToMongoDb(finalIrcResponse, gatewayUUID);
    commbinedStr = "";
    ircResponse = {};
    await quiteBot(bot);
    isResponseSent = true;
    return responseLib.handleSuccess(finalIrcResponse, res);
    // log.debug("isResponseSent", isResponseSent);
    // log.debug("isRetryCompleted", isRetryCompleted);
    // if (isRetryCompleted == true && isResponseSent == false) {
    //   log.debug("isResponseSent = TRUE && isRetryCompleted = TRUE");
    //   isResponseSent = true;
    //   await quiteBot(bot);
    // } else {
    //   log.debug("retry is not completed");
    //   return;
    // }
  } else {
    if (ircResponse.error !== undefined) {
      await quiteBot(bot);
      isResponseSent = true;
      return responseLib.handleSuccess(ircResponse, res);
    }
    log.debug("received the failure response from irc");
    return;
  }
}

const registerBot = async (bot, gatewayUUID, message) => {
  bot.on("registered", (event) => {
    log.debug("event after register", event);
    let channel;
    channel = bot.channel(`#zome-datafeed-${gatewayUUID}`);
    channel.join();
    // channel.say("hello! from the bot");
    channel.say(JSON.stringify(message));
  });
}

const receiveMessage = async (bot, gatewayUUID, req, res) => {
  let ircResponse = {};
  bot.on("message", async (event) => {
    log.info("event : " + JSON.stringify(event));
    log.info("message : " + event.message);
    if (event.type == "privmsg") {
      if (event.message === null || event.message === undefined) {
        await quiteBot(bot);
      }
      ircResponse = await messageRecombine(event.message);
      if (ircResponse !== undefined) {
        await processIRCResponse(ircResponse, gatewayUUID, bot, req, res);
      } 
    } else {
      log.debug('IRC has produced the notice msg');
      return;
    }
  });
}

const quiteBot = async (bot) => {
  commbinedStr = "";
  log.debug("quit this bot name : ",bot.user.nick);
  bot.quit("command execution completed");
  return;
}

const notifyQueue = async (deviceRes, req) => {
  const { jobId } = req.body;
  let jobObjId = mongoose.Types.ObjectId(jobId);
  log.debug("setting up the queue response object for ", jobObjId, typeof(jobObjId));
  log.debug("setting up the queue response to this ", deviceRes);
  const datafeedObj = {
    datafeed: deviceRes
  };
  try {
    await Queue.findOneAndUpdate({ jobId: jobObjId }, {
      $set: {
        response: datafeedObj
      },
    });
    return;
  } catch (error) {
    log.error("error in setup the queue job response ", error);
    return;
  }
}


const retryExecution = async(deviceInfo, res) => {
  zomeserver.Connection();
  const auditObj = await Audit.findOne({request_id: deviceInfo.RequestID}).lean()
  log.info("auditObj from the audit table for retry");
  log.info(auditObj);
  const retryConfig = await Config.findOne({type: "retry_count"}).lean();
  log.debug("retryConfig from DB", retryConfig);
  if (retryConfig !== null && retryConfig !== undefined && retryConfig.value !== null && retryConfig.value !== undefined) {
    rTC = retryConfig.value || rTC;
  } else {
    rTC = rTC;
  }
  log.debug("retryConfig.status = ", retryConfig.status);
  //log.debug(retryConfig.status);
  if(retryConfig.status){
    if (retryCommands.includes(auditObj.command.command) && auditObj.retry_count < rTC && isResponseSent == false) {
      await Audit.findOneAndUpdate(
        { request_id: auditObj.request_id },
        {
          $inc: { retry_count: 1 },
        },
        {
          lean: true,
          new: true,
        },
        function (error, result) {
          log.info("onEventFailure update thing ===>", result);
          log.info("onEventFailure update thing ===>", error);
      });
      await sendMessageToIRC(auditObj.command, auditObj.command.gatewayUuid, req, res);
      } else {
        isRetryCompleted = true;
        log.info("retry count exceed");
        return;
      }
  } else {
    log.debug("retry status is False. retryConfig.status : ", retryConfig.status);
    log.debug("making recompleted as true - since retry is not to be done ");
    isRetryCompleted = true;
  }
}
const delayTime = async (time) => {
  setTimeout(()=>{
    log.debug('waiting for the timeout to reconnect the bot');
  }, time)
}

const delayTimeForBot = async (time, bot, res) => { 
  log.debug("Invoke the delay function");
  // return new Promise((resolve, reject) => { 
    delayfunc = setTimeout(async ()=> {
      log.debug('waiting for the bot to quite the IRC');
      log.debug('isResponseSent at timeout function', isResponseSent);
      if(isResponseSent == false){
        try {
          isResponseSent = true;
          isRetryCompleted = true;
          await quiteBot(bot);
          log.debug('bot has quit the IRC');
          return responseLib.handleSuccess({}, res);  
        } catch (error) {
          log.error(error);          
        } 
      } else {
        isResponseSent = false;
        log.debug('bot has already responded and request is completed');
        return;
      }
    }, time);
  // });
  return delayfunc;
}

const sendMessageToIRC = async (message, gatewayUUID, req, res) => {
  // console.log("bot at message" , bot);
  try {
    if (message.commandType == zomeUtils.ADD_DEVICE_DSK || message.commandType == zomeUtils.ADD_DEVICE || message.commandType == zomeUtils.REMOVE_DEVICE) {
      log.debug("time out increase to 2 mins");
      const bot = await estIrcBotConnection();
      log.debug("bot to send message to gateway ");
      await registerBot(bot, gatewayUUID, message);
      log.debug("bot join the datafeed channel name:", bot.user.nick);
      Promise.all([receiveMessage(bot, gatewayUUID, req, res), delayTimeForBot(120000, bot, res)]).then(async () => {
        if (bot !== undefined) {
          await quiteBot(bot);
        } else {
          log.debug("response fulfilled");
        }
      });
      // await receiveMessage(bot, gatewayUUID, req, res);
      log.debug("bot receive the message");
      // await delayTimeForBot(120000, bot, res);
      // delayfunc != undefined ? clearTimeout(delayfunc): null;
      return;
    } else {
      log.debug("time out set to 30 sec");
      const bot = await estIrcBotConnection();
      log.debug("bot to send message to gateway ");
      await registerBot(bot, gatewayUUID, message);
      log.debug("bot join the datafeed channel name:", bot.user.nick);
      Promise.all([receiveMessage(bot, gatewayUUID, req, res), delayTimeForBot(30000, bot, res)]).then(async () => {
        if (bot !== undefined) {
          await quiteBot(bot);
        } else {
          log.debug("response fulfilled");
        }
      });;
      // await receiveMessage(bot, gatewayUUID, req, res);
      log.debug("bot receive the message");
      // await delayTimeForBot(30000, bot, res);
      // delayfunc != undefined ? clearTimeout(delayfunc): null;
      return;
    }
  } catch (error) {
    log.error("error", error);
  }
}

const sendCommandToIRCChannel = async (req, res) => {
  isResponseSent = false;
  const gatewayUUID = req.params.gatewayuuid;
  // init();
  const message = await prepareMessage(req);
  const responseMessage = await sendMessageToIRC(message, gatewayUUID, req, res);
  return responseMessage;
}

module.exports = {
  sendCommandToIRCChannel,
  prepareMessage,
};