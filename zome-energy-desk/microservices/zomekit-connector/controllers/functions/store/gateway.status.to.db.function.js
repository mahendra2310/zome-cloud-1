const log = require("zome-server").logger.log;
const zomeserver = require("zome-server");
const Gateway = require("mongo-dbmanager").gatewaymodel;

const gatewayStatusUpdate = async (gatewayId, status) => {
  try {
    await zomeserver.Connection("devZomePower");
    await Gateway.findOneAndUpdate(
      { gateway_uuid: gatewayId },
      { $set: { status: status } },
      { new: true },
      (err, doc) => {
        if (err) {
          log.info("Error in updating gateway status");
        } else {
          log.info("Gateway status updated successfully in DB");
        }
      }
    );
  } catch (error) {
    throw error;
  }
};

module.exports = {
    gatewayStatusUpdate
}