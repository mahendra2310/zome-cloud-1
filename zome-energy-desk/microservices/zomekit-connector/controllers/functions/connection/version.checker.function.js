var log = require("zome-server").logger.log;
exports.checkGatewayMSVersionAndImageVersion = async(deviceInfos) => {
    log.debug('gateway microservice version available in string', deviceInfos);
    if(deviceInfos && deviceInfos.hasOwnProperty('version')) {
        log.debug('gateway microservice version###########################################');
        log.debug(deviceInfos['GatewayUUID']);
        log.debug(deviceInfos['version']);
        await Gateway.findOneAndUpdate({ "gateway_uuid": deviceInfos.GatewayUUID }, { $set: { "ms_version": deviceInfos['version'] } })
    } else {
        log.debug('do nothing for ms');
    }

    if (deviceInfos && deviceInfos.deviceInfo && deviceInfos.deviceInfo != null && deviceInfos.deviceInfo != 'null' && deviceInfos.deviceInfo.length > 0 &&  deviceInfos.deviceInfo[0]['Response-type'] === 'GET_IMAGE_VERSION') { 
        log.debug('gateway image version###########################################');
        log.debug(deviceInfos['GatewayUUID']);
        log.debug(deviceInfos.deviceInfo[0]['Image Version']);
        await Gateway.findOneAndUpdate({ "gateway_uuid": deviceInfos.GatewayUUID }, { $set: { "image_version": deviceInfos.deviceInfo[0]['Image Version'] } })
    } else {
        log.debug('do nothing for image version');
    }
}