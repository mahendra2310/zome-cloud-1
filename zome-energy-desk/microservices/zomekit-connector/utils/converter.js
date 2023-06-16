var log = require("zome-server").logger.log;
const zomeserver = require("zome-server");
const Audit = require("mongo-dbmanager").auditmodel;
const zomekitConstants = require("./constant");
const rTC = process.env.RETRYCOUNT || zomekitConstants.TOTAL_RETRY_OF_COMMANDS;
const retryCommands = [
  "71000",
  "71001",
  "71002",
  "71003",
  "71004",
  "71005",
  "71006",
  "71007",
  "71008",
  "71009",
  "71010",
  "71011",
  "71012",
  "71013",
  "71014",
  "81000",
  "81001",
  "81002",
  "81003",
  "81004",
  "81005",
  "81006",
  "81007",
  "81008",
  "81009",
  "81010",
  "81011",
  "81012",
  "81013",
  "81014",
  "81015",
  "81016",
  "81017",
  "81018",
  "81019",
];
var fullStr = "";

async function retryExecution(eventInfo, type) {
  log.info("eventInfo at retryExeuction function");
  log.info(eventInfo);
  zomeserver.Connection();
  const auditObj = await Audit.findOne({
    request_id: eventInfo.RequestID,
  }).lean();
  log.info("auditObj from the audit table for retry");
  log.info(auditObj);
  if (
    retryCommands.includes(auditObj.command.command) &&
    auditObj.retry_count < rTC
  ) {
    const channel2 = bot2.channel(
      "#zome-datafeed-" + auditObj.command.gatewayUuid
    );
    channel2.say(JSON.stringify(auditObj.command));
    await Audit.findOneAndUpdate(
      { request_id: eventInfo.RequestID },
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
      }
    );
  } else {
    log.info("retry count exceed");
  }
}

exports.agrIrcString = async (str) => {
  fullStr = fullStr + str;
  log.info("aggrgated str1: " + fullStr);
  if (str.includes("error")) {
    //should be nbdevice
    var output = JSON.parse(fullStr);
    log.info("opt--------------->>>>>", output);
    fullStr = "";
    await checkGatewayMSVersionAndImageVersion(output);
    if (output.deviceInfo != null) {
      const deviceInfo = output.deviceInfo[0];
      log.info("deviceInfo status");
      log.info(deviceInfo["Status"]);
      if (
        (deviceInfo["Status"] !== undefined &&
          deviceInfo["Status"] != "SUCCESS") ||
        (deviceInfo["status"] !== undefined &&
          deviceInfo["status"] != "SUCCESS")
      ) {
        log.info("device info after failure", deviceInfo);
        // retryExecution(deviceInfo, (type = "response"));
      }
      storeDeviceToMongoDb(output, output.GatewayUUID);
    } else if (output["error"] !== undefined && output["error"] !== null) {
      log.info("error in executing the command", output["error"]);
      const retryObj = {
        RequestID: output.RequestID,
      };
      // retryExecution(retryObj, type="response"); //TODO: NEED TO UNCOMMENT ON SPECIFIC ERROR CASES
      storeDeviceToMongoDb(output, output.GatewayUUID);
    } else {
      log.info("Do nothing");
    }
  }
};
