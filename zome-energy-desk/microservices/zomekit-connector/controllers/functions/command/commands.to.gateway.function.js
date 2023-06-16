const log = require("zome-server").logger.log;
const zomeserver = require("zome-server");
const Gateway = require("mongo-dbmanager").gatewaymodel;

const { sendCommandToIRCChannel } = require("./commands.to.irc.function");
const { gatewayStatusUpdate } = require("../store/gateway.status.to.db.function");

const responseLib = require("zome-server").resp;


const sendCommandstoGateway = async (req, res) => {
  log.info("Reached at async sendcmd");
  try {
    await gatewayStatusUpdate(req.params.gatewayuuid, "busy");
    return await sendCommandToIRCChannel(req, res);
  } catch (e) {
    responseLib.handleError(e.toString(), res);
  }
};

module.exports = {
  gatewayStatusUpdate,
  sendCommandstoGateway,
};
