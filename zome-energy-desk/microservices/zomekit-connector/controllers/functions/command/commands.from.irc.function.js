
const log = require("zome-server").logger.log;
const { storeDeviceToMongoDb, saveAsyncMsgToMongoDb, saveIRCFeedMessages, retrieveIRCFeedMessages } = require("../store/device.to.db.function");
const { estIrcBotConnection, estAsyncIrcBotConnection } = require("../connection/irc.bot.connection.function");

let commbinedStr = "";


async function messageRecombine(messageChunk, bot) {
  log.info("Received message : " + messageChunk);
  if(messageChunk.includes("NbMsg")){
    var jsonStr = JSON.parse(messageChunk);
    var messageNum = jsonStr.NbMsg;
    log.debug("messageNum at async: " + messageNum);
    var msgBody    = jsonStr.body;
    var ReqID      = jsonStr.ReqID;
    commbinedStr = commbinedStr + msgBody;
    log.debug(commbinedStr);
    var numdelimit = messageNum.split("/");

    await saveIRCFeedMessages({
      messageChunk: parseInt(numdelimit[0]),
      requestId: ReqID,
      feed: msgBody,
      isBroadcast: false,
    });

    if (numdelimit[0] == numdelimit[1]) {
      try {
        let output = JSON.parse(commbinedStr);
        log.info(output);
        commbinedStr = "";
        const messagesRetrievedFromDB = await retrieveIRCFeedMessages(jsonStr.ReqID);
        const ircResponseMessage = await aggregateMessages(messagesRetrievedFromDB);
        return ircResponseMessage;
      } catch (error) {
        commbinedStr = "";
        log.error("failed to parse the combined string");
      }
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


const receiveMessage = async (bot) => {
  let ircResponse = {};
  try {
    bot.on("message", async (event) => {
      log.info("event : " + JSON.stringify(event));
      log.info("message : " + event.message);
      if (event.type == "privmsg") {
        //ircResponse = await aggregateIrcString(event.message);
        //check if msg is valid JSON
        //ircResponseNew = event.message;
        ircResponse = await messageRecombine(event.message, bot);
        //if (ircResponseNew.includes("error")) {
          // should be nbdevice
        //  try{
        //    ircResponse = JSON.parse(ircResponseNew);
         //   log.debug("Valid JSON recvd in ASYNC Msg :",ircResponse);
  
         // }catch(error) {
         //   log.error("Invalid JSON recvd in ASYNC Msg :", ircResponseNew);
          //  return;
          //}
       // }
        if (ircResponse && ircResponse.deviceInfo !== null) {
          log.debug("Writing Device updates to DB :", ircResponse);
          const finalIrcResponse = ircResponse;
          //TODO: Based on job id find the request id and update the response in the DB
          await storeDeviceToMongoDb(finalIrcResponse, finalIrcResponse?.GatewayUUID);
          log.debug("Writing async Msg DB :", finalIrcResponse);
          await saveAsyncMsgToMongoDb(finalIrcResponse);
          log.debug("Writing async Msg DB : Completed ");
          //commbinedStr = "";
          ircResponse = {};
          // await quiteBot(bot);
        } else {
          ircResponse = {};
        }
      }
    });
  } catch (error) {
    log.error("error in getting the bot details");
    estAsyncIrcBotConnection().then(async (bot2) => {
      bot = bot2;
      bot.on("registered", (event) => {
        log.debug("event after register", event);
        let channel;
        channel = bot2.channel("#zome-broadcast-feed");
        channel.join();
        // channel.say("hello! from the broadcast feed bot");
      });
      await receiveMessage(bot);
      await onClose(bot);
    });    
  }
}


const onClose = async (bot, req) => {
  bot.on("close", async () => {
    // await delayTime(1000);
    await receiveMessage(req);
  });
}

const delayTime = async (time) => {
  setTimeout(()=>{
    log.debug('waiting for the timeout to reconnect the bot');
  }, time)
}


module.exports = {
    receiveMessage,
    onClose,
};
