const zomeserver = require('zome-server');
const log = require('zome-server').logger.log;
const rest = require('zome-server').rest;
const errLib = require('zome-server').error;
const responseLib = require('zome-server').resp;
const Device = require('mongo-dbmanager').devicemodel;
const HistoryLog = require('mongo-dbmanager').historyLogmodel;
const Queue = require('mongo-dbmanager').queuemodel;
const msConfig = require('zome-config').microservices;
const mongoose = require('zome-server').mongoose;
const crypto = require("crypto");
var { isConnected } = require("./../utils/checkConnection")

const generateIRCRequestId = () => {
    const randomString = crypto
        .createHash("sha256")
        .update(new Date().getTime().toString())
        .digest("hex");
    const finalHash = randomString.substr(0, 32);
    return finalHash;
};

module.exports = {
    addDevice: async (req, res, next) => {
        try {
            const { dskId, gatewayId, description } = req.body;

            //gatewayId = c83e36-41ab5a-a8d6-4f04NaN2a243b30
            let urlString;
            if (dskId) {
                urlString = `http://localhost:30008/zomecloud/api/v1/command-to-gateway/${gatewayId}/5001?param1=${dskId}&&desc=${description}`
            } else {
                urlString = `http://localhost:30008/zomecloud/api/v1/command-to-gateway/${gatewayId}/5000?desc=${description}`
            }
            let jobId = mongoose.Types.ObjectId();
            var callOptions = {
                url: `http://localhost:30004/queues/add-job`,
                method: 'POST',
                body: { 
                    queueId: gatewayId + "-sender", 
                    jobName: "test-zomekit-sender", 
                    jobPayload:{
                        jobId: jobId,
                        type: "api",
                        value: {
                            url: urlString,
                            method: 'POST',
                            body: {}
                        }
                    } 
                }
            }

            rest.call(
                null,
                callOptions,
                async (err, response, body) => {
                    // log.debug("REST call returned from " + msConfig.services.zomeGatewayAgent.name + " service");
                    // log.error(err);
                    // log.info(response.body);
                    // log.info(body);
                    const responseBody = JSON.parse(body)
                    // if (responseBody.status == "SUCCESS" || responseBody['response-type'] == "ADD" || responseBody['response-type'] == "ADD_DSK") {
                    if (responseBody) {
                        // zomeserver.Connection('devZomePower');
                        // const addDevice = await new Device(DeviceObject).save();
                        //  mongoose.connection.close();
                        return responseLib.handleSuccess({ msg: "success" }, res);
                    } else {
                        return errLib.internalFailure;
                    }
                });


        } catch (error) {
            return errLib.internalFailure;
        }
    },

    editDeviceDescription: async (req, res, next) => {
        try {
            const { deviceId, description } = req.body;
            await zomeserver.Connection('devZomePower');
            await Device.findOneAndUpdate({ device_id: deviceId }, { "device_info.desc": description });
            // mongoose.connection.close();
            return responseLib.handleSuccess({ msg: "success" }, res);
        } catch (error) {
            return errLib.internalFailure;
        }
    },

    getAllDevice: async (req, res, next) => {
        try {

            const { gatewayId = "" } = req.params;
            zomeserver.Connection('devZomePower');
            let jobId = mongoose.Types.ObjectId();
            if (req.user.userRole == "tenant" || req.user.userRole == "TenantAdministratorUser" ) {
                log.debug("tenant user");
                zomeserver.Connection('devZomePower');
                const gatewayDeviceList = await Device.find({ $or: [{ users: req.user.userId }, { main_user: req.user.userId }], is_deleted: false });
                if (gatewayDeviceList.length > 0) {
                    const callToZomekitForSFUUser = async () => {
                        var callOptions = {
                            url: `http://localhost:30004/queues/add-job`,
                            method: 'POST',
                            body: {
                                queueId: gatewayId + "-sender",
                                jobName: "test-zomekit-sender",
                                jobPayload: {
                                    jobId: jobId,
                                    type: "api",
                                    value: {
                                        url: `http://localhost:30008/zomecloud/api/v1/command-to-gateway/${gatewayDeviceList[0].gateway_id}/5003`,
                                        method: 'POST',
                                        body: {}
                                    }
                                }
                            }
                        }

                        // Save queue in DB
                        queueObj = {
                            jobId: jobId,
                            request: {
                                ...callOptions.body.jobPayload.value,
                                createdAt: new Date()
                            }
                        }
                        let queue = new Queue(queueObj);
                        await queue.save();

                        rest.call(
                            null,
                            callOptions,
                            async (err, response, body) => {

                                // log.debug("REST call returned from " + msConfig.services.zomeGatewayAgent.name + " service");
                                // log.error(err);
                                // log.info(response.body);
                                // log.info(body);

                                // if (body !== undefined && JSON.parse(body).status === "SUCCESS" && (JSON.parse(body).data?.deviceInfo[0]?.Status !== 'FAILED' || JSON.parse(body).data?.deviceInfo[0]?.status !== 'FAILED')) {
                                // if connection is not establish then send back to establish connection
                                const connectionStatus = await isConnected();
                                if (!connectionStatus) {
                                    return false;
                                }
                                const DeviceList = await Device.find({ $or: [{ users: req.user.userId }, { main_user: req.user.userId }], is_deleted: false });
                                // mongoose.connection.close();
                                return responseLib.handleSuccess(DeviceList, res);

                                // } else {
                                //     return responseLib.handleSuccess({}, res);
                                // }
                            });
                    }
                    const responseToSFU = async () => {
                        return responseLib.handleSuccess(gatewayDeviceList, res);
                    }

                    Promise.all([callToZomekitForSFUUser(), responseToSFU()]).then(values => {
                        // mongoose.connection.close();
                    });

                } else {
                    return responseLib.handleSuccess({ msg: "no device found" }, res);
                }
            } else {
                // const callToZomekit = async () => {
                var callOptions = {
                    url: `http://localhost:30004/queues/add-job`,
                    method: 'POST',
                    body: {
                        queueId: gatewayId + "-sender",
                        jobName: "test-zomekit-sender",
                        jobPayload: {
                            jobId,
                            type: "api",
                            value: {
                                url: `http://localhost:30008/zomecloud/api/v1/command-to-gateway/${gatewayId}/5003`,
                                method: 'POST',
                                body: {
                                    jobId,
                                }
                            }
                        }
                    }
                }

                rest.call(
                    null,
                    callOptions,
                    async (err, response, body) => {

                        log.debug("REST call returned from " + msConfig.services.zomeGatewayAgent.name + " service");
                        log.error(err);
                        log.info(body);
                        const queueObj = {
                            jobId: jobId,
                            request: {
                                ...callOptions.body.jobPayload.value,
                                createdAt: new Date()
                            }
                        }
                        log.debug('setting up the queue object to the db');
                        const queue = new Queue(queueObj);
                        await queue.save();
                        // if (body !== undefined && body !== undefined && JSON.parse(body).status === "SUCCESS" && (JSON.parse(body).data?.deviceInfo[0]?.Status !== 'FAILED' || JSON.parse(body).data?.deviceInfo[0]?.status !== 'FAILED')) {
                        // zomeserver.Connection('devZomePower');
                        // const DeviceList = await Device.find({ gateway_id: gatewayId, is_deleted: false });
                        // // mongoose.connection.close();
                        // return responseLib.handleSuccess(DeviceList, res);
                        // } else {
                        //     return responseLib.handleSuccess({}, res);
                        // }
                    });

                const fetchAllDevice = async () => {
                    const queueObj = await Queue.findOne({ jobId: jobId });
                    if (queueObj.response != undefined) {
                        const DeviceList = await Device.find({ gateway_id: gatewayId, is_deleted: false });

                        clearInterval(jobObserver);

                        if(DeviceList.length > 0){
                            return responseLib.handleSuccess(DeviceList, res);
                        }else{
                            let msg = "Gateway have no device connected"
                            return responseLib.handleSuccess(msg, res);
                        }
                        // // mongoose.connection.close();
                    }
                }
                
                const jobObserver = await setInterval(fetchAllDevice, 2000);

            }
        } catch (error) {
            return errLib.internalFailure;
        }
    },
    
    editDevice: async (req, res, next) => {
        try {
            const {
                deviceUuid,
                deviceInfo,
                companyId,
                gatewayId,
                locationId,
                meta,
                isDeleted,
                createdBy,
                updatedBy
            } = req.body;

            const DeviceObject = {
                device_uuid: deviceUuid,
                device_info: deviceInfo,
                company_id: companyId,
                gateway_id: gatewayId,
                location_id: locationId,
                meta: meta,
                is_deleted: isDeleted,
                updated_at: Date.now(),
                created_by: createdBy,
                updated_by: updatedBy
            };

            zomeserver.Connection('devZomePower');


            const UpdateDevice = await Device.findOneAndUpdate({ device_uuid: deviceUuid }, DeviceObject, {
                new: true,
                upsert: true
            });

            mongoose.connection.close()
            return responseLib.handleSuccess(UpdateDevice, res);
        } catch (error) {
            return errLib.internalFailure;
        }
    },

    deleteDevice: async (req, res, next) => {
        try {
            const { deviceId, gatewayId } = req.body;
            log.info('deviceId');
            log.info(deviceId);
            let jobId = mongoose.Types.ObjectId();
            var callOptions = {
                url: `http://localhost:30004/queues/add-job`,
                method: 'POST',
                body: { 
                    queueId: gatewayId + "-sender", 
                    jobName: "test-zomekit-sender", 
                    jobPayload:{
                        jobId,
                        type: "api",
                        value: {
                            url: `http://localhost:30008/zomecloud/api/v1/command-to-gateway/${gatewayId}/5002`,
                            method: 'POST',
                            body: {}
                        }
                    } 
                }
            }

            rest.call(
                null,
                callOptions,
                async (err, response, body) => {
                    log.debug("REST call returned from " + msConfig.services.zomeGatewayAgent.name + " service");
                    log.error(err);
                    // log.info(response.body);
                    log.info(body);
                    const responseBody = JSON.parse(body);
                    log.info('responseBody from the remove device');
                    log.info(responseBody);
                    if (responseBody) {
                        // zomeserver.Connection('devZomePower');
                        log.info('device is being deleted, device id =', deviceId);
                        try {
                            await Device.remove({ device_id: deviceId.toString() });
                        } catch (error) {
                            log.error("device is already deleted or device is not exist in db");
                        }
                        // mongoose.connection.close();
                        return responseLib.handleSuccess({ msg: "Device delete successfully" }, res);
                    } else {
                        // mongoose.connection.close();
                        return responseLib.handleSuccess({ msg: "Device delete failed" }, res);
                    }
                });

        } catch (error) {
            // mongoose.connection.close();
            return errLib.internalFailure;
        }
    },

    deviceDetails: async (req, res, next) => {
        try {

            const { deviceId, gatewayId } = req.body;
            zomeserver.Connection('devZomePower');

            const lastCheck = await Device.findOne({ device_id: deviceId }, { last_check: 1 })

            var d = new Date();
            var d1 = new Date(lastCheck.last_check);
            var diff = (d.getTime() - d1.getTime()) / 1000;
            diff /= 60;

            checkAgo = Math.abs(Math.round(diff))
            let jobId = mongoose.Types.ObjectId();
            if (checkAgo < 2) {
                let msg = false;
                // mongoose.connection.close();
                return responseLib.handleSuccess({ msg: msg }, res);
            } else {
                await Device.findOneAndUpdate({ device_id: deviceId }, { last_check: Date.now() });
                let msg = true;
                var callOptions = {
                    url: `http://localhost:30004/queues/add-job`,
                    method: 'POST',
                    body: { 
                        queueId: gatewayId + "-sender", 
                        jobName: "test-zomekit-sender", 
                        jobPayload:{
                            jobId,
                            type: "api",
                            value: {
                                url: `http://localhost:30008/zomecloud/api/v1/command-to-gateway/${gatewayId}/5006?deviceID=${deviceId}`,
                                method: 'POST',
                                body: {}
                            }
                        } 
                    }
                }

                rest.call(
                    null,
                    callOptions,
                    async (err, response, body) => {

                        log.debug("REST call returned from " + msConfig.services.zomeGatewayAgent.name + " service");
                        log.error(err);
                        log.info(body);

                        // if (body !== undefined && JSON.parse(body).status === "SUCCESS" && (JSON.parse(body).data?.deviceInfo[0]?.Status !== 'FAILED' || JSON.parse(body).data?.deviceInfo[0]?.status !== 'FAILED')) {
                            const deviceDetails = await Device.findOne({ "device_id": deviceId, "gateway_id": gatewayId });
                            let msg = true;
                            // mongoose.connection.close();
                            return responseLib.handleSuccess({ deviceDetails, msg }, res);
                        // } else {
                        //     let msg = false;
                        //     // mongoose.connection.close();
                        //     return responseLib.handleSuccess({ msg }, res);
                        // }
                    });
            }

        } catch (error) {
            // mongoose.connection.close();
            return errLib.internalFailure;
        }
    },

    smartSwitchControl: async (req, res, next) => {
        try {

            const { deviceId, gatewayId, switchStatus } = req.body;
            let jobId = mongoose.Types.ObjectId();
            var callOptions = {
                url: `http://localhost:30004/queues/add-job`,
                method: 'POST',
                body: { 
                    queueId: gatewayId + "-sender", 
                    jobName: "test-zomekit-sender", 
                    jobPayload:{
                        jobId,
                        type: "api",
                        value: {
                            url: `http://localhost:30008/zomecloud/api/v1/command-to-gateway/${gatewayId}/5004?command=71000&param1=${switchStatus}&deviceID=${deviceId}`,
                            method: 'POST',
                            body: {}
                        }
                    } 
                }
            }
            rest.call(
                null,
                callOptions,
                async (err, response, body) => {

                    log.debug("REST call returned from " + msConfig.services.zomeGatewayAgent.name + " service");
                    log.error(err);
                    // log.info(response.body);
                    log.info(body);

                    // if (body !== undefined && JSON.parse(body).status === "SUCCESS" && (JSON.parse(body).data?.deviceInfo[0]?.Status !== 'FAILED' || JSON.parse(body).data?.deviceInfo[0]?.status !== 'FAILED')) {
                        return responseLib.handleSuccess({ msg: "Smart Switch Control Successfully" }, res);
                    // } else {
                        // return responseLib.handleSuccess({ msg: "Smart Switch Control Failed" }, res);
                    // }
                });
        } catch (error) {
            return errLib.internalFailure;
        }
    },

    sendMetricsSwitch: async (req, res, next) => {
        try {

            const { deviceId, gatewayId } = req.body;
            let jobId = mongoose.Types.ObjectId();
            var callOptions = {
                url: `http://localhost:30004/queues/add-job`,
                method: 'POST',
                body: { 
                    queueId: gatewayId + "-sender", 
                    jobName: "test-zomekit-sender", 
                    jobPayload:{
                        jobId,
                        type: "api",
                        value: {
                            url: `http://localhost:30008/zomecloud/api/v1/command-to-gateway/${gatewayId}/5014?deviceID=${deviceId}`,
                            method: 'POST',
                            body: {}
                        }
                    } 
                }
            }
            rest.call(
                null,
                callOptions,
                async (err, response, body) => {

                    log.debug("REST call returned from " + msConfig.services.zomeGatewayAgent.name + " service");
                    log.error(err);
                    log.info(response.body);
                    log.info(body);
                    const data = JSON.parse(response.body);
                    // if (body !== undefined && JSON.parse(body).status === "SUCCESS" && (JSON.parse(body).data?.deviceInfo[0]?.Status !== 'FAILED' || JSON.parse(body).data?.deviceInfo[0]?.status !== 'FAILED')) {
                        return responseLib.handleSuccess({ msg: "Metrics Switch Successfully", data }, res);
                    // } else {
                    //     return responseLib.handleSuccess({ msg: "Metrics Switch Failed" }, res);
                    // }
                });
        } catch (error) {
            return errLib.internalFailure;
        }
    },

    instantTemperature: async (req, res, next) => {
        try {
            zomeserver.Connection('devZomePower');

            const { deviceId, gatewayId, typeValue } = req.body;
            const userId = req.user.userId;
            let jobId = mongoose.Types.ObjectId();

            // let reqId = generateIRCRequestId();
            // const callToZomekit = async () => {
            //     var getModeCallOptions = {
            //         url: `http://localhost:30004/queues/add-job`,
            //         method: 'POST',
            //         body: { 
            //             queueId: gatewayId + "-sender", 
            //             jobName: "test-zomekit-sender", 
            //             jobPayload:{
            //                 type: "api",
            //                 jobId,
            //                 reqId: reqId,
            //                 value: {
            //                     url: `http://localhost:30008/zomecloud/api/v1/command-to-gateway/${gatewayId}/5005?deviceID=${deviceId}&command=81015`,
            //                     method: 'POST',
            //                     body: {}
            //                 }
            //             } 
            //         }
            //     }
            //     let queueObj = {
            //         jobId: jobId,
            //         request: {
            //             ...getModeCallOptions.body.jobPayload.value,
            //             createdAt: new Date()
            //         }
            //     }
            //     let queue = new Queue(queueObj);
            //     await queue.save();
            //     rest.call(
            //         null,
            //         getModeCallOptions,
            //         async (err, response, body) => {
            //             log.error(err);
            //             console.log("body of the get mode");
            //             console.log(body);
            //             // if(body !== undefined && JSON.parse(body).status === "SUCCESS" && (JSON.parse(body).data?.deviceInfo[0]?.Status !== 'FAILED' || JSON.parse(body).data?.deviceInfo[0]?.status !== 'FAILED')) { 
            //                 jobId = mongoose.Types.ObjectId();
            //                 const getUnitCallOptions = {
            //                     url: `http://localhost:30004/queues/add-job`,
            //                     method: 'POST',
            //                     body: { 
            //                         queueId: gatewayId + "-sender", 
            //                         jobName: "test-zomekit-sender", 
            //                         jobPayload:{
            //                             type: "api",
            //                             jobId,
            //                             reqId: reqId,
            //                             value: {
            //                                 url: `http://localhost:30008/zomecloud/api/v1/command-to-gateway/${gatewayId}/5005?deviceID=${deviceId}&command=81013`,
            //                                 method: 'POST',
            //                                 body: {}
            //                             }
            //                         } 
            //                     }
            //                 }
                            
            //                 queueObj = {
            //                     jobId: jobId,
            //                     request: {
            //                         ...getUnitCallOptions.body.jobPayload.value,
            //                         createdAt: new Date()
            //                     }
            //                 }

            //                 console.log("get unit call options", queueObj);
            //                 let queue = new Queue(queueObj);
            //                 await queue.save();

            //                 rest.call(
            //                     null,
            //                     getUnitCallOptions,
            //                     async (err, response, body) => {
            //                         log.error(err);
            //                         console.log("body of the get unit");
            //                         log.info(body);

            //                         // if(body !== undefined && JSON.parse(body).status === "SUCCESS" && (JSON.parse(body).data?.deviceInfo[0]?.Status !== 'FAILED' || JSON.parse(body).data?.deviceInfo[0]?.status !== 'FAILED')) {
            //                             const modereolver = {
            //                                 Heat: 1,
            //                                 Cool: 2,
            //                                 Auto: 1, //TODO: Need to figure from the op state
            //                                 Off: 3,
            //                             };
                    
            //                             let mode = 2;
                
                                        const deviceMode = await Device.findOne(
                                            { device_id: deviceId, gateway_id: gatewayId },
                                            { device_info: 1 }
                                        );
                                        zomeserver.Connection('devZomePower');
                                        await HistoryLog.create({
                                            action_details: "Display activated",
                                            control: req.user.userEmail || "local user",
                                            customFields: deviceMode.device_info,
                                            device_id: deviceId,
                                            user_id: userId,
                                        });
                
            //                             if (
            //                                 deviceMode.device_info["Thermostat mode"] &&
            //                                 deviceMode.device_info["Thermostat mode"] != "" &&
            //                                 deviceMode.device_info["Thermostat mode"] != null
            //                             ) {
            //                                 mode =
            //                                     modereolver[
            //                                         deviceMode.device_info["Thermostat mode"]
            //                                     ] == 3
            //                                         ? 2
            //                                         : modereolver[
            //                                         deviceMode.device_info["Thermostat mode"]
            //                                         ];
            //                             } else {
            //                                 mode = 2;
            //                             }

            //                             log.info("device------", deviceMode.device_info);
            //                             log.info("mode------------", mode);
            //                             jobId = mongoose.Types.ObjectId();
            //                             var getTempCallOptions = {
            //                                 url: `http://localhost:30004/queues/add-job`,
            //                                 method: 'POST',
            //                                 body: { 
            //                                     queueId: gatewayId + "-sender", 
            //                                     jobName: "test-zomekit-sender", 
            //                                     jobPayload:{
            //                                         type: "api",
            //                                         jobId,
            //                                         reqId: reqId,
            //                                         value: {
            //                                             url: `http://localhost:30008/zomecloud/api/v1/command-to-gateway/${gatewayId}/5005?deviceID=${deviceId}&command=81000&param1=${mode}`,
            //                                             method: "POST",
            //                                             body: {},
            //                                         }
            //                                     } 
            //                                 }
            //                             };
                
            //                             queueObj = {
            //                                 jobId: jobId,
            //                                 request: {
            //                                     ...getTempCallOptions.body.jobPayload.value,
            //                                     createdAt: new Date()
            //                                 }
            //                             }
            //                             queue = new Queue(queueObj);
            //                             await queue.save();
            //                             rest.call(
            //                                 null,
            //                                 getTempCallOptions,
            //                                 async (err, response, body) => {
            //                                     log.error(err);
            //                                     console.log("body of the get temp");
            //                                     log.info(body);

            //                                     // if(body !== undefined && JSON.parse(body).status === "SUCCESS" && (JSON.parse(body).data?.deviceInfo[0]?.Status !== 'FAILED' || JSON.parse(body).data?.deviceInfo[0]?.status !== 'FAILED')) {
            //                                         jobId = mongoose.Types.ObjectId();
            //                                         var getTstatModeCallOptions = {
            //                                             url: `http://localhost:30004/queues/add-job`,
            //                                             method: 'POST',
            //                                             body: { 
            //                                                 queueId: gatewayId + "-sender", 
            //                                                 jobName: "test-zomekit-sender", 
            //                                                 jobPayload:{
            //                                                     type: "api",
            //                                                     jobId,
            //                                                     reqId: reqId,
            //                                                     value: {
            //                                                         url: `http://localhost:30008/zomecloud/api/v1/command-to-gateway/${gatewayId}/5005?deviceID=${deviceId}&command=81017&param1=1`,
            //                                                         method: "POST",
            //                                                         body: {},
            //                                                     }
            //                                                 } 
            //                                             }
            //                                         };

            //                                         queueObj = {
            //                                             jobId: jobId,
            //                                             request: {
            //                                                 ...getTstatModeCallOptions.body.jobPayload.value,
            //                                                 createdAt: new Date()
            //                                             }
            //                                         }
            //                                         queue = new Queue(queueObj);
            //                                         await queue.save();
            //                                         rest.call(
            //                                             null,
            //                                             getTstatModeCallOptions,
            //                                             async (err, response, body) => {
            //                                                 log.error(err);
            //                                                 log.info(response.body);
            //                                                 log.info(body);
                    
            //                                                 // if (
            //                                                 //     body !== undefined &&
            //                                                 //     JSON.parse(body).data?.deviceInfo[0]?.Status !== 'FAILED' || JSON.parse(body).data?.deviceInfo[0]?.status !== 'FAILED'
            //                                                 // ) {
            //                                                     const deviceDetails = await Device.findOne({
            //                                                         device_id: deviceId,
            //                                                         gateway_id: gatewayId,
            //                                                     });
            //                                                     deviceDetails.device_info.updatedAt =
            //                                                         deviceDetails.updated_at;
            //                                                     // mongoose.connection.close();
            //                                                     // return responseLib.handleSuccess(
            //                                                     //     {
            //                                                     //         msg: "Instant Temperature Successfully",
            //                                                     //         data: deviceDetails,
            //                                                     //     },
            //                                                     //     res
            //                                                     // );
            //                                                 // } else {
            //                                                 //     return responseLib.handleSuccess(
            //                                                 //         { msg: "Instant Temperature Failed" },
            //                                                 //         res
            //                                                 //     );
            //                                                 // }
            //                                             }
            //                                         );
            //                                     // } else {
            //                                     //     const deviceDetails = await Device.findOne({device_id: deviceId,gateway_id: gatewayId});
            //                                     //     deviceDetails.device_info.updatedAt = deviceDetails.updated_at;
            //                                     //     // mongoose.connection.close();
            //                                     //     return responseLib.handleSuccess(
            //                                     //         {
            //                                     //         msg: "Failed to fetch the device mode",
            //                                     //         data: deviceDetails,
            //                                     //         },
            //                                     //         res
            //                                     //     );
            //                                     // }
            //                                 }
            //                             );
            //                         // } else {
            //                         //     const deviceDetails = await Device.findOne({device_id: deviceId,gateway_id: gatewayId});
            //                         //     deviceDetails.device_info.updatedAt = deviceDetails.updated_at;
            //                         //     // mongoose.connection.close();
            //                         //     return responseLib.handleSuccess(
            //                         //         {
            //                         //         msg: "Failed to fetch the device mode",
            //                         //         data: deviceDetails,
            //                         //         },
            //                         //         res
            //                         //     );
            //                         // }
            //                     });
                            
            //             // } else {  
            //             //     const deviceDetails = await Device.findOne({device_id: deviceId,gateway_id: gatewayId});
            //             //     deviceDetails.device_info.updatedAt = deviceDetails.updated_at;
            //             //     // mongoose.connection.close();
            //             //     return responseLib.handleSuccess(
            //             //         {
            //             //         msg: "Failed to fetch the device mode",
            //             //         data: deviceDetails,
            //             //         },
            //             //         res
            //             //     );
            //             // }
            //         });
            //     }
            
            // const deviceResponse = async () => {
                const deviceDetails = await Device.findOne({device_id: deviceId,gateway_id: gatewayId});
                // deviceDetails.device_info.updatedAt = deviceDetails.updated_at;
                return responseLib.handleSuccess(
                    {
                        msg: "Response Successfully",
                        data: deviceDetails,
                    },
                    res
                );
            // };

            // Promise.all([callToZomekit(), deviceResponse()]).then(() => {
            //     // // mongoose.connection.close();
            // });
        } catch (error) {
            return errLib.internalFailure;
        }
    },

    editTemperature: async (req, res, next) => {
        try {
            const { gatewayId, deviceId, type, unit, value } = req.body;
            const userId = req.user.userId;
            //type = 0 for heat, 1 for cool
            //unit = 0 for Celsius, 1 for Fahrenheit
            //value = Target temperature.... 35F to 95F, 2C to 34C
            zomeserver.Connection("devZomePower");
            if (unit == 1) {
                if (value < 35 || value > 95) {
                    return responseLib.handleError({ msg: "Invalid temperature value" }, res);
                }
            } else {
                if (value < 2 || value > 34) {
                    return responseLib.handleError({ msg: "Invalid temperature value" }, res);
                }
            }
            const typeResolver = {
                Heat: 0,
                Cool: 1,
                Auto: 2,
                Off: -1,
            };

            const unitResolver = {
                '0': 'Celsius',
                '1': 'Fahrenheit'
            }
            const unitName = unitResolver[unit.toString()];

            let typeM = 1;
            if (type == '0' || type == '1') {
                typeM = type;
            } else {
                typeM = typeResolver[type];
            }
            let jobId = mongoose.Types.ObjectId();
            var callOptions = {
                url: `http://localhost:30004/queues/add-job`,
                method: 'POST',
                body: { 
                    queueId: gatewayId + "-sender", 
                    jobName: "test-zomekit-sender", 
                    jobPayload:{
                        jobId: jobId,
                        type: "api",
                        value: {
                            url: `http://localhost:30008/zomecloud/api/v1/command-to-gateway/${gatewayId}/5004?deviceID=${deviceId}&command=71006&type=${typeM}&unit=${unit}&value=${value}`,
                            method: "POST",
                            body: {},
                        }
                    } 
                }
            };

            rest.call(null, callOptions, async (err, response, body) => {
                log.debug(
                    "REST call returned from " +
                    msConfig.services.zomeGatewayAgent.name +
                    " service"
                );
                log.error(err);
                log.info(response.body);
                log.info(body);

                if(response.statusCode == 200){
                    const updateHistory = await Device.findOne({ device_id: deviceId })
    
                    await HistoryLog.create({
                        action_details: `Set point adjusted to temperature ${value} ${unitName}`,
                        control: req.user.userEmail || "local user",
                        customFields: updateHistory.device_info,
                        device_id: deviceId,
                        user_id: userId
                    });
                }
                
                if (JSON.parse(body).status == "SUCCESS") {
                    const updateDevice = await Device.findOneAndUpdate(
                        { device_id: deviceId },
                        {
                            $set: {
                                "device_info.Thermostat temp": value,
                                "device_info.Thermostat setpoint type": type,
                                "device_info.Thermostat setpoint unit": unit,
                                "device_info.Thermostat setpoint unit1": unit,
                            },
                        },
                        { new: true }
                    );

                    


                    // mongoose.connection.close();
                    return responseLib.handleSuccess({ msg: "Temperature updated successfully", device: updateDevice }, res);
                } else {
                    // mongoose.connection.close();
                    return responseLib.handleSuccess({ msg: "Temperature update failed" }, res);
                }
            });
        } catch (error) {
            return errLib.internalFailure;
        }
    },

    smartSwitchStatus: async (req, res, next) => {
        try {
            const { gatewayId, deviceId } = req.params;
            let jobId = mongoose.Types.ObjectId();
            // var callOptions = {
            //     url: `http://localhost:30004/queues/add-job`,
            //     method: 'POST',
            //     body: { 
            //         queueId: gatewayId + "-sender", 
            //         jobName: "test-zomekit-sender", 
            //         jobPayload:{
            //             jobId: jobId,
            //             type: "api",
            //             value: {
            //                 url: `http://localhost:30008/zomecloud/api/v1/command-to-gateway/${gatewayId}/5005?deviceID=${deviceId}&command=81018`,
            //                 method: "POST",
            //                 body: {},
            //             }
            //         } 
            //     }
            // };

            // rest.call(null, callOptions, async (err, response, body) => {
            //     log.debug(
            //         "REST call returned from " +
            //         msConfig.services.zomeGatewayAgent.name +
            //         " service"
            //     );
            //     log.error(err);
            //     log.info(response.body);
            //     log.info(body);

                 zomeserver.Connection("devZomePower");
                 const deviceStatus = await Device.findOne(
                     { device_id: deviceId }, { device_info: 1 }
                 );
            //     if (JSON.parse(body).status == "SUCCESS") {
            //         if (deviceStatus.device_info["Power State"] == undefined || deviceStatus.device_info["Power State"] == null) {
            //             deviceStatus.device_info["Power State"] = "Off"
            //         }

                     return responseLib.handleSuccess({ msg: "Smart Switch Status", device: deviceStatus.device_info }, res);

            //     } else {
            //         return responseLib.handleSuccess({ msg: "Smart Switch Status Failed", device: deviceStatus.device_info }, res);
            //     }
            //     // mongoose.connection.close();
            // }
            // );
        } catch (error) {
            return errLib.internalFailure;
        }
    },

    deviceStatus: async (req, res, next) => {
        try {
            /--Here we take deviceId as well as gatewayId from request user--/
            const { gatewayId, deviceId } = req.params;
          
                 zomeserver.Connection("devZomePower");

                 /--Here we find device based on deviceId if it's found then it's only return device_info Object--/
                 const deviceStatus = await Device.findOne(
                     { device_id: deviceId }, { device_info: 1 }
                 );

                 return res.status(200).send(deviceStatus)
        } catch (error) {
            log.debug(error)
            return errLib.internalFailure;
        }
    },

    removeNode: async (req, res, next) => {
        try {
            const { gatewayId, deviceId } = req.body;
            let jobId = mongoose.Types.ObjectId();
            var callOptions = {
                url: `http://localhost:30004/queues/add-job`,
                method: 'POST',
                body: { 
                    queueId: gatewayId + "-sender", 
                    jobName: "test-zomekit-sender", 
                    jobPayload:{
                        jobId: jobId,
                        type: "api",
                        value: {
                            url: `http://localhost:30008/zomecloud/api/v1/command-to-gateway/${gatewayId}/5016?deviceID=${deviceId}`,
                            method: "POST",
                            body: {},
                        }
                    } 
                }
            };

            rest.call(null, callOptions, async (err, response, body) => {
                log.debug(
                    "REST call returned from " +
                    msConfig.services.zomeGatewayAgent.name +
                    " service"
                );
                log.error(err);
                log.info(response.body);
                log.info(body);

                return responseLib.handleSuccess({ msg: "Node removed successfully" }, res);
            }
            );
        } catch (error) {
            return errLib.internalFailure;
        }
    },

    editMultipleDevice: async (req, res, next) => {
        try {
            const MultiDevices = [
                {
                    "DeviceName": "Zwave Range Extender device",
                    "DeviceID": "1618653803483",
                    "DeviceUUID": "12",
                    "DeviceNodeID": "29",
                    "DeviceType": "65536",
                    "DeviceAction": "0",
                    "DeviceBrightness": "0",
                    "reqId": "55cb53cf250a3979ba42105cf981d263"
                },
                {
                    "DeviceName": "Thermostatdevice",
                    "DeviceID": "1618997133797",
                    "DeviceUUID": "121212",
                    "DeviceNodeID": "56",
                    "DeviceType": "259",
                    "DeviceAction": "0",
                    "DeviceBrightness": "0",
                    "reqId": "55cb53cf250a3979ba42105cf981d263"
                },
                {
                    "DeviceName": "Smartswitch",
                    "DeviceID": "1619003326088",
                    "DeviceUUID": "1212121213",
                    "DeviceNodeID": "58",
                    "DeviceType": "256",
                    "DeviceAction": "0",
                    "DeviceBrightness": "0",
                    "reqId": "55cb53cf250a3979ba42105cf981d263"
                },
                {
                    "DeviceName": "Smartswitch 2",
                    "DeviceID": "1619003326088",
                    "DeviceUUID": "12121212",
                    "DeviceNodeID": "58",
                    "DeviceType": "256",
                    "DeviceAction": "0",
                    "DeviceBrightness": "0",
                    "reqId": "55cb53cf250a3979ba42105cf981d263"
                }
            ]

            var DeviceLength = MultiDevices.length;

            zomeserver.Connection('devZomePower');

            for (var i = 0; i < DeviceLength; i++) {
                //!!! This is 1st method which is sync with model
                // await Device.findOne({device_uuid : MultiDevices[i].DeviceUUID})
                //         .then((device) => {
                //             log.info(device);
                //             device.updateDevice(MultiDevices[i])
                //         })
                //         .catch(next)

                //!!! This is 2nd method which is work find and update with if...else
                // const device = await Device.findOne({device_uuid: MultiDevices[i].DeviceUUID})

                // if(device.length != 0){
                //     device.device_info.DeviceName = MultiDevices[i].DeviceName;
                //     device.device_info.DeviceID = MultiDevices[i].DeviceID;
                //     device.device_info.DeviceUUID = MultiDevices[i].DeviceUUID;
                //     device.device_info.DeviceNodeID = MultiDevices[i].DeviceNodeID;
                //     device.device_info.DeviceType = MultiDevices[i].DeviceType;
                //     device.device_info.DeviceAction = MultiDevices[i].DeviceAction;
                //     device.device_info.DeviceBrightness = MultiDevices[i].DeviceBrightness;
                //     device.updated_at = Date.now();

                //     await device.save();
                // } else{
                //     //In this section create new document
                // }

                //!!! 3rd meethod

                await Device.findOneAndUpdate({ device_uuid: MultiDevices[i].DeviceUUID },
                    {
                        device_uuid: MultiDevices[i].DeviceUUID,
                        device_info: {
                            DeviceName: MultiDevices[i].DeviceName,
                            DeviceID: MultiDevices[i].DeviceID,
                            DeviceUUID: MultiDevices[i].DeviceUUID,
                            DeviceNodeID: MultiDevices[i].DeviceNodeID,
                            DeviceType: MultiDevices[i].DeviceType,
                            DeviceAction: MultiDevices[i].DeviceAction,
                            DeviceBrightness: MultiDevices[i].DeviceBrightness
                        },
                        company_id: 1,
                        gateway_id: "472c6b7c-8a2c-49de-877d-52a83d1fad71",
                        location_id: "34dfo34-drt",
                        meta: null,
                        is_deleted: false,
                        updated_at: Date.now(),
                        created_by: "dipaks",
                        updated_by: "dipaks"
                    }, {
                    new: true,
                    upsert: true
                });

            }

            mongoose.connection.close()

            return responseLib.handleSuccess({ msg: "Multiple Device Edited successfully" }, res);
        } catch (error) {
            return errLib.internalFailure;
        }
    },

    getDeviceByGateway: async (req, res, next) => {
        try {
            zomeserver.Connection('devZomePower');
            const { gatewayId } = req.body;

            let Devices = [];
            for (let i = 0; i < gatewayId.length; i++) {
                const DeviceByGateway = await Device.find({ gateway_id: gatewayId[i], "device_info.DeviceType": { $in: ['259', '256'] } });
                Devices.push(DeviceByGateway);
                // Object.assign(Devices, DeviceByGateway)
            }
            // mongoose.connection.close();

            return responseLib.handleSuccess(Devices, res);
        } catch (error) {
            return errLib.internalFailure;
        }
    },

    setPoinThermostateDevices: async (req, res, next) => {
        try {

            const { mode } = req.body;
            const zomeKitConnectorUrl = process.env.ZOMEKITCONNECTOR_API_URL;
            const setpointEndPoint = "zomekit-setpoint";
            let existingGateways = [];
            const gatewayIds = JSON.parse(req.body.gatewayIds);
            // if (mode === "3" || mode === "2") {
                zomeserver.Connection('devZomePower');
                const allExistingIds = await DispatchEventDetail.find({ gateway_uuid: gatewayIds, reset_done: false });
                if (allExistingIds) {
                    existingGateways = allExistingIds.map((data) => {
                        return data.gateway_uuid;
                    });
                }
                const finalGatewayIDs = gatewayIds.filter((id) => {
                    return existingGateways.includes(id) == false;
                });
                req.body.gatewayIds = JSON.stringify(finalGatewayIDs);
                if (finalGatewayIDs.length > 0) {
                    var callOptions = {
                        // url: "http://localhost:30008/zomecloud/api/v1/zomekit-setpoint", // `${zomeKitConnectorUrl}/${setpointEndPoint}`,
                        url: "http://localhost:30012/zomecloud/api/v1/executeDispatch", // `${zomeKitConnectorUrl}/${setpointEndPoint}`,
                        method: 'POST',
                        body: req.body
                    }

                    rest.call(
                        null,
                        callOptions,
                        async (err, response, body) => {
                            log.debug("=================================================");
                            log.debug("Error", body);
                            log.debug("Error", response);
                            log.debug("Error", err);
                            log.debug("=================================================");
                        });
                }

            // }
            let msg = 'tmeparature updated';
            log.info("existingGateways==>", existingGateways);
            if (existingGateways.length > 0) {

                msg = `tmeparature updated and dispatch event for ${existingGateways} is not finished yet, so this will not include in this request`
            }
            return responseLib.handleSuccess({ msg }, res);
        } catch (error) {
            return errLib.internalFailure;
        }
    },

    setMode: async (req, res, next) => {
        try {
            const userId = req.user.userId;
            const { deviceId, gatewayId, mode } = req.body;
            console.log(mode,"mode...")
            zomeserver.Connection('devZomePower');
            const typeResolver = {
                OFF: 1,
                HEAT: 2,
                COOL: 3,
                AUTO: 4,
            };

            let selectMode = typeResolver[mode];
            let jobId = mongoose.Types.ObjectId();
            let reqId = generateIRCRequestId();
            var callOptions = {
                url: `http://localhost:30004/queues/add-job`,
                method: 'POST',
                body: { 
                    queueId: gatewayId + "-sender", 
                    jobName: "test-zomekit-sender", 
                    jobPayload:{
                        jobId: jobId,
                        type: "api",
                        value: {
                            url: `http://localhost:30008/zomecloud/api/v1/command-to-gateway/${gatewayId}/5004?deviceID=${deviceId}&command=71005&param1=${selectMode}`, // `${zomeKitConnectorUrl}/${setpointEndPoint}`,
                            method: 'POST',
                            body: {}
                        }
                    } 
                }
            }

            rest.call(
                null,
                callOptions,
                async (err, response, body) => {
                    log.debug("=================================================");
                    log.debug("Body", body);
                    log.debug("Response", response);
                    log.debug("Error", err);

                    // if (body !== undefined && JSON.parse(body).status === "SUCCESS" && (JSON.parse(body).data?.deviceInfo[0]?.Status !== 'FAILED' || JSON.parse(body).data?.deviceInfo[0]?.status !== 'FAILED')) {
                        const deviceDetails = await Device.findOne({ "device_id": deviceId, "gateway_id": gatewayId });
                        // mongoose.connection.close();

                        // Mahendra's code for demo purpose

                        const modereolver = {
                            Heat: 1,
                            Cool: 2,
                            Auto: 2, //TODO: here we set Auto to cool mode
                            Off: 3,
                        };
                        
                        // here we find deviceMode
                       
                        zomeserver.Connection('devZomePower');
                        let selectMode;
                        // Here we check Device have mode or not if not then we consider as cool mode
                        if (mode == "HEAT" || mode == "OFF") {
                            selectMode = 1
                        } else {
                            selectMode = 2;
                        }
                        
                        log.info("mode------------", selectMode);
                        jobId = mongoose.Types.ObjectId();
                        var getTempCallOptions = {
                            url: `http://localhost:30004/queues/add-job`,
                            method: 'POST',
                            body: { 
                                queueId: gatewayId + "-sender", 
                                jobName: "test-zomekit-sender", 
                                jobPayload:{
                                    type: "api",
                                    jobId,
                                    reqId: reqId,
                                    value: {
                                        url: `http://localhost:30008/zomecloud/api/v1/command-to-gateway/${gatewayId}/5005?deviceID=${deviceId}&command=81000&param1=${selectMode}`,
                                        method: "POST",
                                        body: {},
                                    }
                                } 
                            }
                        };
                        
                        queueObj = {
                            jobId: jobId,
                            request: {
                                ...getTempCallOptions.body.jobPayload.value,
                                createdAt: new Date()
                            }
                        }
                        queue = new Queue(queueObj);
                        await queue.save();

                        rest.call(
                            null,
                            getTempCallOptions,
                            async (err, response, body) => {
                                log.error(err);
                                console.log("body of the get temp");
                                log.info(body);
        
                            }
                        );


                        return responseLib.handleSuccess({ deviceDetails }, res);
                });

        } catch (error) {
            return errLib.internalFailure;
        }
    }
}