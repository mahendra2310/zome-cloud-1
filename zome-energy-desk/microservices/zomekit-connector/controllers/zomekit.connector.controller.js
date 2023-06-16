const log = require("zome-server").logger.log;
var responseLib = require("zome-server").resp;

const { sendCommandstoGateway } = require("./functions/command/commands.to.gateway.function");
// const { commandsFromIRCChannel } = require("./functions/command/commands.from.irc.function");
// const { Queue, Worker } = require('bullmq')

// global.zomekitQueue = new Queue('zomekitQueue');

exports.commandToGateway = async function (req, res, next) {
  try {
    log.debug("ENTER: commandToGateway()");
    const commandResponse = await sendCommandstoGateway(req, res);
    // return responseLib.handleSuccess(commandResponse, res);
  } catch (e) {
    return responseLib.handleError(e.toString(), res);
  }
};