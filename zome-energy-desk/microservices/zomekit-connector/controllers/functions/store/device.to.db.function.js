var log = require("zome-server").logger.log;
const zomeserver = require("zome-server");
const Device = require("mongo-dbmanager").devicemodel;
const IrcFeedRef = require("mongo-dbmanager").ircFeedModel;
const AsyncAuditRef = require("mongo-dbmanager").asyncauditmodel;
const Gateway = require("mongo-dbmanager").gatewaymodel;
const CommandHistory = require("mongo-dbmanager").commandHistory;
const mailSender = require("../../../utils/mail-service")

const { gatewayStatusUpdate } = require("../store/gateway.status.to.db.function");

const gatewayUpdateJson = {
  'GET_IMAGE_VERSION': imageVersion,
  'MS-VERSION': msVersion,
};

function imageVersion(device) {
  return { "image_version": device[0]['Image Version'] }
}

function msVersion(device) {
  return { "ms_version": device[0]['version'] }
}

async function checkDeviceResetModeAndRemove(deviceInfo) {
  log.info("checking the device is in reset mode");
  const deviceList = deviceInfo.filter((devices) => {
    return devices.hasOwnProperty("Device reset");
  });
  if (deviceList.length == 0) {
    return false;
  } else {
    log.info("device is in reset mode", deviceList);
    log.info("removing the devices from the db");
    const deviceId = deviceList[0]["device id"];
    let user = await Device.findOne({
      device_id: deviceId,
    }).populate("main_user");
    await mailSender(user.main_user.email, "Device Deleted", "Device has been deleted");
    await Device.remove({ device_id: deviceId.toString() });
    return true;
  }
}

function cleanupObjects(rawDevices) {
  log.info("cleaning up the response");
  return (devices = rawDevices.filter((devices) => {
    return (
      devices.hasOwnProperty("device id") || devices.hasOwnProperty("DeviceID")
    );
  }));
}

function updateGatewayVersion(gatewayId, updatedValues) {
  log.debug('gatewayid', gatewayId);
  log.debug('updatedValues', updatedValues);
  Gateway.update({ "gateway_uuid": gatewayId }, { $set: updatedValues }).then((response) => {
    log.debug('response');
    log.debug(response);
  });
}

function checkGatewayVersionAndMSVersion(deviceInfo, gatewayId) {
  log.debug("gateway verison values");
  log.debug(deviceInfo);
  const device = deviceInfo.filter((devices) => {
    return (devices['Response-type'] == 'GET_IMAGE_VERSION' || devices['Response-type'] == 'MS-VERSION');
  });
  if (device.length > 0 && (device[0]['Response-type'] == 'GET_IMAGE_VERSION' || device[0]['Response-type'] == 'MS-VERSION')) {
    updateGatewayVersion(gatewayId, gatewayUpdateJson[device[0]['Response-type']](device));
  } else {
    log.debug('command is not for the image and ms version');
  }
  log.debug('device for Image version', device);
  return device;
}

exports.saveIRCFeedMessages = async (ircMessageObj) => {
  log.info("saving the irc messages into the DB ", ircMessageObj); 
  await IrcFeedRef.create(ircMessageObj).catch((err) => {
    log.error("error while saving the irc messages into the DB ", err);
  });
}

exports.retrieveIRCFeedMessages = async (requestId) => {
  log.info("fetch the IRC message based on ReqId ", requestId);
  const messages = await IrcFeedRef.find({
    requestId,
  }).sort({ messageChunk : 1 });
  log.debug("messages from the DB", messages);
  return messages;
}

exports.saveAsyncMsgToMongoDb = async (_asyncMsg) => {
  log.debug("Insert async msg into DB -asyncMsg : ", _asyncMsg);
  log.debug("Insert async msg into DB -asyncMsg toString : ", _asyncMsg.toString());
  if (
    _asyncMsg &&
    _asyncMsg.deviceInfo &&
    _asyncMsg.deviceInfo != null &&
    _asyncMsg.deviceInfo != "null" &&
    _asyncMsg.deviceInfo.length === 1
  ){
    const _deviceId = _asyncMsg.deviceInfo[0]["device id"];
    const _gatewayId = _asyncMsg.GatewayUUID;
    log.debug("******** saveAsyncMsgToMongoDb for _gatewayId", _gatewayId);
    log.debug("******** saveAsyncMsgToMongoDb for _deviceId", _deviceId);
    await zomeserver.Connection("devZomePower");
    await AsyncAuditRef.create(
      { device_id: _deviceId.toString(),
        gateway_id: _gatewayId.toString(),
        asyncMsg: _asyncMsg }
    );
    log.debug("******** saveAsyncMsgToMongoDb DONE", _deviceId);
  }

};

const storeCommandHistory = async(data) => {
  //** storeCommandHistory() is store all the command store in db with the status, gatewayUuid, deviceId and requestId */
  try {
    let gatewayUuid = data['GatewayUUID'];
    let devicesOldData = cleanupObjects(data.deviceInfo)
    if (devicesOldData[0]['DeviceID']){

      let deviceObj = []
      devicesOldData.map(device => {
        deviceObj.push({
          command_type: device['Response-type'],
          device_id: device['DeviceID'],
          status: device['Status'] || device['status'],
          request_id: device['RequestID'],
          gateway_uuid: gatewayUuid
        })
      })

      if(deviceObj.length){
        await CommandHistory.create(deviceObj);
      }
    }
  } catch (error) {
    log.error(error)
    return;
  }
}

exports.storeDeviceToMongoDb = async (deviceInfos, gatewayId) => {
  await gatewayStatusUpdate(gatewayId, "ready");
  if ( deviceInfos && deviceInfos.deviceInfo && deviceInfos.deviceInfo != null && deviceInfos.deviceInfo != "null" && deviceInfos.deviceInfo.length > 0) {
    log.debug("we got the list of devices ",deviceInfos);
    log.debug("deviceinfos length ",deviceInfos.deviceInfo.length);
    log.debug("deviceinfos string ",deviceInfos.deviceInfo);
    const deviceInfo = cleanupObjects(deviceInfos.deviceInfo);
    await storeCommandHistory(deviceInfos)
    const gatewayVersionAndMSVersion = checkGatewayVersionAndMSVersion(deviceInfos.deviceInfo, gatewayId);
    log.debug("gateway Version and MSVersion ", gatewayVersionAndMSVersion);
    if (deviceInfo.length === 0) {
      log.info("no devices are there to store in mongodb after filter");
      return;
    }
    log.info("deviceInfo==>,", deviceInfo);
    const isDeviceReset = await checkDeviceResetModeAndRemove(deviceInfo);
    if (isDeviceReset) {
      log.info("device has been removed from the db");
      return;
    }
    const devicesLength = deviceInfo.length;
    await zomeserver.Connection("devZomePower");
    for (var i = 0; i < devicesLength; i++) {
      const resultDevice = await Device.findOne({
        $or: [
          // {device_uuid: deviceInfo[i].DeviceUUID || ""},
          { device_id: deviceInfo[i].DeviceID || deviceInfo[i]["device id"] },
        ],
      });

      let updatedDeviceInfo = {};
      if (resultDevice == null) {
        updatedDeviceInfo = {
          ...deviceInfo[i],
        };
      } else {
        updatedDeviceInfo = {
          ...resultDevice.device_info,
          ...deviceInfo[i],
        };
      }

      //log.info(updatedDeviceInfo);
      await Device.findOneAndUpdate(
        {
          $or: [
            // {device_uuid: deviceInfo[i].DeviceUUID || ""},
            { device_id: deviceInfo[i].DeviceID || deviceInfo[i]["device id"] },
          ],
        },
        {
          $set: {
            //device_uuid: deviceInfo[i].DeviceUUID,
            device_id: deviceInfo[i].DeviceID || deviceInfo[i]["device id"],
            device_info: updatedDeviceInfo,
            updated_at: Date.now(),
          },
          $setOnInsert: {
            device_uuid: deviceInfo[i].DeviceUUID,
            company_id: 1,
            gateway_id: gatewayId,
            location_id: "34dfo34-drt",
            meta: null,
            is_deleted: false,
            created_by: "zomkit-connector",
            updated_by: "zomkit-connector",
          },
        },
        {
          new: true,
          upsert: true,
        }
      );
    }
  } else {
    log.info("no devices are there to store in mongodb");
  }
};
