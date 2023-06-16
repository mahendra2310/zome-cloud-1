// var log = require("zome-server").logger.log;
// var responseLib = require("zome-server").resp;
// const crypto = require("crypto");
// const si = require("systeminformation");
// var irc = require("irc-framework");
// var bot = new irc.Client();
// var bot2 = new irc.Client();
// var ircServerConfig = require("zome-config").irc.ircServer;
// const zomeUtils = require("zome-utils");
// const fs = require("fs");
// let path = require("path");
// const zomeserver = require("zome-server");
// const Device = require("mongo-dbmanager").devicemodel;
// const mongoose = require("zome-server").mongoose;
// const dispatchEventDetail = require("mongo-dbmanager").dispatchEventDetailModel;
// const dispatchEventLogs = require("mongo-dbmanager").dispatchEventLogs;
// const schedule = require("node-schedule");
// const eventLog = require("./dispatchEventLogs");
// const zomekitConstants = require("../utils/constant");

// var rest = require("zome-server").rest;
// // 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
// exports.initializeBot = function () {
//   setScheduling();
//   onSystemRebootCheckSchedule();
// };
// const rTC = process.env.RETRYCOUNT || zomekitConstants.TOTAL_RETRY_OF_COMMANDS;
// var zkConnectorNick = "dispatch";
// var zkConnectorAsyncNick = "async_dispatch";
// // let iniPath =  path.resolve() + '/microservices/'
// const connectorIniStr = fs.readFileSync("../zomekit-connector.ini", {
//   encoding: "utf8",
//   flag: "r",
// }); // this needs to used eventually as mentioned below

// // log.info("=== path.resolve() ===", path.resolve());
// // log.info("=== __dirname====", __dirname);
// // let iniPath = path.resolve() + "/microservices/";
// // log.info("=== path.resolve() ===", path.resolve());
// // log.info("=== __dirname====", __dirname);

// var buffers = [];
// var buffers2 = [];
// var channel = null;

// bot.connect({
//   host: ircServerConfig.host,
//   port: ircServerConfig.port,
//   nick: zkConnectorAsyncNick + "_" + Math.floor(Math.random() * 1000000),
//   // auto_reconnect_max_wait: ircServerConfig.max_wait,
//   // auto_reconnect_max_retries: ircServerConfig.max_retries,
//   // ping_interval: ircServerConfig.ping_int,
//   // ping_timeout: ircServerConfig.ping_time,
//   // auto_reconnect: ircServerConfig.auto_recon,
// });
// bot2.connect({
//   host: ircServerConfig.host,
//   port: ircServerConfig.port,
//   nick: zkConnectorNick + "_" + Math.floor(Math.random() * 10000000),
//   // auto_reconnect_max_wait: ircServerConfig.max_wait,
//   // auto_reconnect_max_retries: ircServerConfig.max_retries,
//   // ping_interval: ircServerConfig.ping_int,
//   // ping_timeout: ircServerConfig.ping_time,
//   // auto_reconnect: ircServerConfig.auto_recon,
// });

// // bot.on("registered", function () {
// //   channel = bot.channel("#zome-broadcast-feed");
// //   buffers.push(channel);

// //   channel.join();
// //   channel.say("Dispatch Connector Connected...");
// // });

// function prepareFinalResponse(deviceRespStr) {
//   var deviceResp = JSON.parse(deviceRespStr);
//   for (var iter in deviceResp.deviceInfo) {
//     delete deviceResp.deviceInfo[iter].reqId;
//   }

//   if (deviceResp.deviceInfo == null) {
//     return deviceResp;
//   }

//   var deviceInfoLocal = deviceResp.deviceInfo.filter(
//     (value) => Object.keys(value).length !== 0
//   );
//   return deviceInfoLocal;
// }

// const generateIRCRequestId = () => {
//   const randomString = crypto
//     .createHash("sha256")
//     .update(new Date().getTime().toString())
//     .digest("hex");
//   const finalHash = randomString.substr(0, 32);
//   return finalHash;
// };

// // FUNCTION FOR SYNCRONIUSE OUTPUT
// // LIVER
// var fullStr = "";
// function agrIrcString2(str) {
//   fullStr = fullStr + str;
//   // log.info("aggrgated str1: " + fullStr);
//   if (str.includes("error")) {
//     //should be nbdevice
//     var output = JSON.parse(fullStr);
//     log.info(output);
//     fullStr = "";
//     if (output.deviceInfo != null) {
//       //to prevent calls when errors are present.
//       let myPromise = new Promise(function (myResolve, myReject) {
//         const checkRequestID = getDispatchEventDetail(output.GatewayUUID);
//         myResolve(checkRequestID);
//         myReject(checkRequestID);
//       });
//       const deviceInfo = output.deviceInfo[0];
//       if (
//         deviceInfo["Status"] === "FAILED" ||
//         deviceInfo["status"] === "FAILED"
//       ) {
//         // retryCommandExcetuion(deviceInfo['reqId'], deviceInfo);
//       } else {
//         console.log("insSuccesss***************",deviceInfo);
//         eventLog.updateToSuccess(deviceInfo["RequestID"], output.deviceInfo);
//       }

//       myPromise.then(
//         function (monoObject) {
//           // console.log("monoObject==>", monoObject);
//           if (!monoObject) {
//             // no events found
//           } else {
//             if (
//               deviceInfo["Response-type"] &&
//               deviceInfo["Response-type"] === "GET_DEVICE_LIST" &&
//               monoObject.irc_request_id_get_device_list ===
//                 deviceInfo["RequestID"]
//             ) {
//               // console.log("getDeviceResponseSuccess===>1.2", output.deviceInfo);
//               //sendDeviceTogetTemprature(output.GatewayUUID, output.deviceInfo, value);

//               // log.info("Get Device List For GatewayID", output.GatewayUUID);
//               // log.info("And Device List is", JSON.stringify(output.deviceInfo));
//               // log.info("Sending Them to get mod one by one");

//               sendDeviceTogetMode(
//                 output.GatewayUUID,
//                 output.deviceInfo,
//                 monoObject
//               );
//             }

//             if (
//               !deviceInfo["Response-type"] &&
//               output.command === "command-response"
//             ) {
//               // console.log("Inside Reponse==>", deviceInfo.RequestID);
//               const getDeviceData = monoObject.gateway_devices.find(
//                 ({ set_mod_request_id }) => {
//                   // console.log("set_mod_request_id==>", set_mod_request_id);
//                   return set_mod_request_id === deviceInfo.RequestID;
//                 }
//               );
//               log.info("getDeviceData", getDeviceData);
//               if (getDeviceData) {
//                 // log.info("Mod is set af level 2 now let get temp for this mod");
//                 // console.log(
//                 //   "Mod Is Set You can send request to get the Temprature of devices===>"
//                 // );
//                 // set command to get the temprature
//                 // sendDeviceTogetTemprature(output.GatewayUUID, deviceInfo.device_id, monoObject);
//                 sendDeviceTogetTempratureAfterSetMod(
//                   output.GatewayUUID,
//                   getDeviceData,
//                   monoObject
//                 );
//               }

//               // if (!getDeviceData) {
//               //   const getFinalRequestId = monoObject.gateway_devices.find(
//               //     ({ irc_request_id }) => {
//               //       log.info("irc_request_id==>", irc_request_id);
//               //       return irc_request_id === deviceInfo.RequestID;
//               //     }
//               //   );

//               //   if (getFinalRequestId) {
//               //     log.info("getFinalRequestId===>line410");
//               //     updateThermostateDeviceInfoFinal(
//               //       output.GatewayUUID,
//               //       deviceInfo["RequestID"]
//               //     );
//               //   }
//               // }
//             }

//             // if (deviceInfo["status"] === "SUCCESS") {
//             //   log.info("getFinalRequestId===>line420");
//             //   // need to set the temprature in db call the final
//             //   updateThermostateDeviceInfoFinal(
//             //     output.GatewayUUID,
//             //     deviceInfo["RequestID"]
//             //   );
//             // }
//           }
//         },
//         function (error) {
//           log.info("error==>", error);
//           // storeDeviceToMongoDb(output, output.GatewayUUID);
//         }
//       );
//     }
//   }
// }

// // bot2.on("message", function (event) {
// //   // console.log(event.message);
// //   if (event.message.includes("command-response")) {
// //     fullStr = "";
// //   }
// //   agrIrcString2(event.message);
// // });

// function cleanupObjects(rawDevices) {
//   log.info("cleaning up the response");
//   return (devices = rawDevices.filter((devices) => {
//     return (
//       devices.hasOwnProperty("device id") || devices.hasOwnProperty("DeviceID")
//     );
//   }));
// }

// // FUNCTION FOR ASYNC OUTPUT
// // HEART FOR DISPATCH
// var asyncFullStr = "";
// function agrgregateIrcString(str) {
//   asyncFullStr = asyncFullStr + str;
//   log.info("aggrgated str2: " + asyncFullStr);
//   if (str.includes("error")) {
//     //should be nbdevice
//     var output = JSON.parse(asyncFullStr);
//     log.info(output);
//     asyncFullStr = "";
//     if (output.deviceInfo != null) {
//       // console.log("final granted==>", output.deviceInfo[0]);
//       // console.log("final granted==>", output.deviceInfo[0]["Status"]);
//       // console.log("final granted==>", output.deviceInfo[0]["RequestID"]);

//       // updating Async logs
//       eventLog.updateAsynchLogs(output);

//       if (
//         output.deviceInfo[0]["Status"] === "FAILED" ||
//         output.deviceInfo[0]["status"] === "FAILED"
//       ) {
//         //retryCommandExcetuion(output.deviceInfo[0]['reqId'], output.deviceInfo[0]);
//       } else {
//         if (output.deviceInfo[0]["RequestID"]) {
//           eventLog.updateToSuccess(
//             output.deviceInfo[0]["RequestID"],
//             output.deviceInfo
//           );
//         }
//       }

//       let myPromise = new Promise(function (myResolve, myReject) {
//         const checkRequestID = getDispatchEventDetail(output.GatewayUUID);
//         myResolve(checkRequestID);
//         myReject(checkRequestID);
//       });

//       if (output.deviceInfo[0].hasOwnProperty("Thermostat mode")) {
//         myPromise.then(
//           function (mongoObject) {
//             // console.log("Thermostat mode value==>", mongoObject);
//             // console.log(
//             //   "output.deviceInfo This is from IRC Thermostat mode==>",
//             //   output.deviceInfo
//             // );
//             if (mongoObject) {
//               // log.info("Recived The Get Mod Response for device ", output.deviceInfo[0]["device id"]);
//               updateThermostateDeviceInfoAfterGetMode(
//                 output.GatewayUUID,
//                 output.deviceInfo
//               );
//             }
//             if (!mongoObject) {
//               checkExclusionOfDevice(output.GatewayUUID, output.deviceInfo);
//             }
//           },
//           function (error) {
//             log.info("error==>", error);
//             // storeDeviceToMongoDb(output, output.GatewayUUID);
//           }
//         );
//       }

//       if (output.deviceInfo[0].hasOwnProperty("Thermostat setpoint temp")) {
//         myPromise.then(
//           function (mongoObject) {
//             log.info("irc channel get the temprature==>", mongoObject);
//             log.info(
//               "output.deviceInfo This is from IRC==>",
//               output.deviceInfo
//             );
//             if (!mongoObject) {
//               checkExclusionOfDevice(output.GatewayUUID, output.deviceInfo);
//             }

//             const deviceObjFromMongo = mongoObject.gateway_devices.find(
//               (deviceObj) => {
//                 return (
//                   deviceObj.device_id === output.deviceInfo[0]["device id"]
//                 );
//               }
//             );
//             if (
//               mongoObject &&
//               deviceObjFromMongo.previouse_temprature_info.set_point_temp > 1 &&
//               deviceObjFromMongo.set_temprature == false
//             ) {
//               // updateThermostateDeviceInfoAfterGetPoint(
//               //   output.GatewayUUID,
//               //   output.deviceInfo
//               // );
//               log.info(
//                 "We got the tempretur for device in dispatch requested mod for device ==>",
//                 output.deviceInfo[0]["device id"]
//               );
//               setTempratureToThermostat(
//                 output.GatewayUUID,
//                 output.deviceInfo,
//                 mongoObject
//               );
//             } else if (
//               mongoObject &&
//               !deviceObjFromMongo.previouse_temprature_info.set_point_temp
//             ) {
//               // this is request to set the previosue temprature of device
//               console.log("print before updatePreviouseInfo==>");
//               log.info(
//                 "Got response Updating Previouse info of the temprature for device ",
//                 output.deviceInfo[0]["device id"]
//               );

//               updatePreviouseInfo(
//                 output.GatewayUUID,
//                 output.deviceInfo,
//                 mongoObject
//               );
//             }
//           },
//           function (error) {
//             log.info("error==>", error);
//             // storeDeviceToMongoDb(output, output.GatewayUUID);
//           }
//         );
//       }
//     } else {
//       log.info("comes in eldse pasr");
//       // storeDeviceToMongoDb(output, output.GatewayUUID);
//     }
//   }
// }

// const updatePreviouseInfo = async (gatewayId, device, mongoObject) => {
//   log.info("In updatePreviouseInfo==>", device);
//   device = device[0];
//   const typeofUnit =
//     device["Thermostat setpoint unit"] === "Fahrenheit" ? "1" : "0";
//   const temratureValue = device["Thermostat setpoint temp"];
//   const temratureType = device["Thermostat setpoint type"];
//   await dispatchEventDetail.updateOne(
//     {
//       gateway_uuid: gatewayId,
//       is_deleted: false,
//       gateway_devices: {
//         $elemMatch: {
//           device_id: device["device id"],
//           get_mode: false,
//         },
//       },
//     },
//     {
//       $set: {
//         "gateway_devices.$.get_mode": true,
//         "gateway_devices.$.previouse_temprature_info.set_point_unit":
//           typeofUnit,
//         "gateway_devices.$.previouse_temprature_info.set_point_type":
//           temratureType,
//         "gateway_devices.$.previouse_temprature_info.set_point_temp":
//           temratureValue,
//       },
//     },
//     {
//       returnNewDocument: true,
//     },
//     function (error, result) {
//       log.info("error", error);
//       log.info("result", result);

//       log.info("Previouse Info updated for the device ID", device["device id"]);
//       log.info("Now Set The Given Mod", mongoObject.temprature_mode);

//       setThermostatMode(
//         gatewayId,
//         device["device id"],
//         mongoObject.temprature_mode
//       );
//     }
//   );
// };

// // bot.on("message", function (event) {
// //   log.info("reached at just bot on");

// //   log.info("message : " + event.message);
// //   //log.info('message length : ' + event.message.length);
// //   if (event.message.includes("device-async-output")) {
// //     asyncFullStr = "";
// //   }

// //   agrgregateIrcString(event.message);
// // });

// async function storeDeviceToMongoDb(deviceInfos, gatewayId) {
//   if (deviceInfos != undefined && deviceInfos.deviceInfo.length > 0) {
//     log.info("we got the list of devices");
//     const deviceInfo = cleanupObjects(deviceInfos.deviceInfo);
//     if (deviceInfo.length === 0) {
//       log.info("no devices are there to store in mongodb after filter");
//       return;
//     }
//     log.info("deviceInfo==>,", deviceInfo);
//     const isDeviceReset = await checkDeviceResetModeAndRemove(deviceInfo);
//     if (isDeviceReset) {
//       console.log("device has been removed from the db");
//       return;
//     }
//     const devicesLength = deviceInfo.length;
//     await zomeserver.Connection("devZomePower");
//     for (var i = 0; i < devicesLength; i++) {
//       const resultDevice = await Device.findOne({
//         $or: [
//           // {device_uuid: deviceInfo[i].DeviceUUID || ""},
//           { device_id: deviceInfo[i].DeviceID || deviceInfo[i]["device id"] },
//         ],
//       });

//       let updatedDeviceInfo = {};
//       if (resultDevice == null) {
//         updatedDeviceInfo = {
//           ...deviceInfo[i],
//         };
//       } else {
//         updatedDeviceInfo = {
//           ...resultDevice.device_info,
//           ...deviceInfo[i],
//         };
//       }

//       //log.info(updatedDeviceInfo);
//       await Device.findOneAndUpdate(
//         {
//           $or: [
//             // {device_uuid: deviceInfo[i].DeviceUUID || ""},
//             { device_id: deviceInfo[i].DeviceID || deviceInfo[i]["device id"] },
//           ],
//         },
//         {
//           $set: {
//             //device_uuid: deviceInfo[i].DeviceUUID,
//             device_id: deviceInfo[i].DeviceID || deviceInfo[i]["device id"],
//             device_info: updatedDeviceInfo,
//             updated_at: Date.now(),
//           },
//           $setOnInsert: {
//             device_uuid: deviceInfo[i].DeviceUUID,
//             company_id: 1,
//             gateway_id: gatewayId,
//             location_id: "34dfo34-drt",
//             meta: null,
//             is_deleted: false,
//             created_by: "zomkit-connector",
//             updated_by: "zomkit-connector",
//           },
//         },
//         {
//           new: true,
//           upsert: true,
//         }
//       );
//     }
//   } else {
//     log.info("no devices are there to store in mongodb");
//   }
// }

// async function checkDeviceResetModeAndRemove(deviceInfo) {
//   log.info("checking the device is in reset mode");
//   const deviceList = deviceInfo.filter((devices) => {
//     return devices.hasOwnProperty("Device reset");
//   });
//   if (deviceList.length == 0) {
//     return false;
//   } else {
//     console.log("device is in reset mode", deviceList);
//     console.log("removing the devices from the db");
//     const deviceId = deviceList[0]["device id"];
//     await zomeserver.Connection("devZomePower");
//     await Device.deleteOne({ device_id: deviceId.toString() });
//     return true;
//   }
// }

// /**
//  *
//  * @param {*} req
//  * @param {*} res
//  * @param {*} next
//  * @returns
//  *
//  * Author: Rajesh yadav
//  *
//  */
// exports.setPoint = async function (req, res, next) {
//   const deviceIds = JSON.parse(req.body.excludeDeviceId);
//   log.info("setpoint initiated", deviceIds);
//   const gatewayIds = JSON.parse(req.body.gatewayIds);
//   let { mode, temprature, minutes } = req.body;
//   // console.log("gatewayIds==>", gatewayIds);
//   // console.log("mode==>", mode);
//   // console.log("temprature==>", temprature);

//   // TODO: need to remove once the proper testing is done
//   if (minutes < 2) {
//     minutes = 5;
//   }

//   const commandTypeGetAllDevice = zomeUtils.GET_DEVICE_LIST;
//   const arrayOfInitiation = { mode, temprature, minutes };
//   const eventName = "Event_" + Date.now();

//   for (let gatewayData of gatewayIds) {
//     req.params.gatewayuuid = gatewayData;
//     req.params.commandType = commandTypeGetAllDevice;
//     req.params.setPoint = true;
//     req.zcReqId = generateIRCRequestId();
//     req.params.commandForDispatch = true;
//     arrayOfInitiation["getDevicelistReqId"] = req.zcReqId;
//     await createDispatchEventDetail(
//       eventName,
//       gatewayData,
//       deviceIds,
//       arrayOfInitiation
//     );
//     sendCommandToIRCChannel(req, res);
//   }
//   return res;
// };

// const createDispatchEventDetail = async (
//   eventName,
//   gatewayId,
//   deviceIds,
//   arrayOfInitiation
// ) => {
//   // const dbName = 'devZomePower';
//   // mongoserver.Connection('devZomePower');
//   zomeserver.Connection("devZomePower");
//   // var connectionString = mongoserver.Connection.useDb(dbName);
//   // log.info("first thing");
//   // const dispatchEventDetailDb =connectionString.model("dispatchEventDetail", dispatchEventDetail);
//   log.info("second thing");
//   const filter = { gateway_uuid: gatewayId, is_deleted: false };
//   const isDataExists = await dispatchEventDetail.findOne(filter);
//   log.info("in createDispatchEventDetail isDataExists", isDataExists);
//   // if data is exists then we will not do anything for now
//   if (!isDataExists) {
//     const mlseconds = arrayOfInitiation.minutes * 60000;
//     const invocationDate = new Date(Date.now() + mlseconds);

//     const update = {
//       event_name: eventName,
//       irc_request_id: "",
//       minutes: arrayOfInitiation.minutes,
//       temprature_mode: arrayOfInitiation.mode,
//       temprature_value: arrayOfInitiation.temprature,
//       irc_request_id_get_device_list: arrayOfInitiation.getDevicelistReqId,
//       schedular_date: invocationDate,
//       reset_done: false,
//       gateway_uuid: gatewayId,
//       excluded_device: deviceIds,
//       created_by: "ZoomKitConnector-dispatch",
//       updated_by: "ZoomKitConnector-dispatch",
//       created_at: Date.now(),
//       updated_at: Date.now(),
//     };
//     const data = await dispatchEventDetail.findOneAndUpdate(filter, update, {
//       new: true,
//       upsert: true, // Make this update into an upsert
//     });

//     //set the schedular
//     //TODO : after full test remove the
//     setScheduling(data._id);
//   }
// };

// /**
//  *
//  * @param {*} gatewayId
//  * @returns
//  * for get the dispatch event detail
//  */
// const getDispatchEventDetail = async (gatewayId) => {
//   zomeserver.Connection("devZomePower");
//   const resultDispatchEventDetail = await dispatchEventDetail.findOne({
//     gateway_uuid: gatewayId,
//     is_deleted: false,
//   });
//   return resultDispatchEventDetail;
// };

// /**
//  *
//  * @param {*} gatewayId
//  * for updating the dispatch event
//  * To do: Need to check already updated irc id or not
//  */
// const updteDispatchEventDetailIrcRequestId = async (
//   gatewayId,
//   updationStirng
// ) => {
//   log.info("updteDispatchEventDetail,gatewayId===>", gatewayId);
//   log.info("updteDispatchEventDetail,updationStirng===>", updationStirng);

//   // const dbName = 'devZomePower';
//   // var connectionString = mongoserver.Connection.useDb(dbName);
//   // const dispatchEventDetailDb =connectionString.model("dispatchEventDetail", dispatchEventDetail);

//   await dispatchEventDetail.updateOne(
//     { gateway_uuid: gatewayId },
//     {
//       $set: {
//         irc_request_id: updationStirng,
//       },
//     },
//     {
//       returnNewDocument: true,
//     },
//     function (error, result) {
//       log.info("updteDispatchEventDetailIrcRequestId===>", result);
//     }
//   );
// };

// const updteDispatchEventDetailSetModIrcRequestId = async (
//   gatewayId,
//   deviceId,
//   irc_request_id
// ) => {
//   log.info("updteDispatchEventDetail,gatewayId===>", gatewayId);

//   // zomeserver.Connection('devZomePower');
//   // const dbName = 'devZomePower';
//   // var connectionString = mongoserver.Connection.useDb(dbName);
//   // const dispatchEventDetailDb =connectionString.model("dispatchEventDetail", dispatchEventDetail);

//   await dispatchEventDetail.updateOne(
//     {
//       gateway_uuid: gatewayId,
//       is_deleted: false,
//       gateway_devices: { $elemMatch: { device_id: deviceId } },
//     },
//     {
//       $set: {
//         "gateway_devices.$.set_mod_request_id": irc_request_id,
//       },
//     },
//     {
//       returnNewDocument: true,
//     },
//     async function (error, result) {
//       log.info(
//         "updteDispatchEventDetailSetModIrcRequestId result ***=>",
//         gatewayId
//       );
//     }
//   );
// };

// const updteDispatchEventDetailDeviceIrcRequestId = async (
//   gatewayId,
//   deviceId,
//   irc_request_id
// ) => {
//   log.info("updteDispatchEventDetail,gatewayId===>", gatewayId);

//   // zomeserver.Connection('devZomePower');
//   // const dbName = 'devZomePower';
//   // var connectionString = mongoserver.Connection.useDb(dbName);
//   // const dispatchEventDetailDb =connectionString.model("dispatchEventDetail", dispatchEventDetail);

//   await dispatchEventDetail.updateOne(
//     {
//       gateway_uuid: gatewayId,
//       is_deleted: false,
//       gateway_devices: { $elemMatch: { device_id: deviceId } },
//     },
//     {
//       $set: {
//         "gateway_devices.$.irc_request_id": irc_request_id,
//       },
//     },
//     {
//       returnNewDocument: true,
//     },
//     async function (error, result) {
//       log.info(
//         "updteDispatchEventDetailDeviceIrcRequestId result ***=>",
//         gatewayId
//       );
//     }
//   );
// };

// /**
//  *
//  * @param {*} gatewayId
//  * @param {*} deviceObj
//  * this will get the gateway id and all devices of the gateway and store only Tstat
//  * device to mongoDb and then make request to get the mode
//  */
// const sendDeviceTogetMode = async (gatewayId, deviceObj, mongoObject) => {
//   log.info("sendDeviceTogetMode===>", gatewayId);
//   log.info("sendDeviceTogetMode===>", deviceObj);
//   log.info("sendDeviceTogetMode===>", mongoObject);

//   const deviceType = "259"; // thermostate
//   for (let devices of deviceObj) {
//     log.info("loop of device==>1", devices);
//     const isExclued = mongoObject.excluded_device.find((data) => {
//       return data === devices.DeviceID;
//     });

//     const isAlreadyAdded = mongoObject.gateway_devices.find((deviceData) => {
//       return deviceData.device_id === devices.DeviceID;
//     });

//     // const arrayOfDevices = ['1630616841908','1630614589619','1630617496988','1630616841908']
//     // const arrayOfDevices = ['1630619631003','1630618312386'];
//     // const arrayOfDevices = ['1630618067316','1630617762028','1630617496988']

//     log.info("isExclued==>", isExclued);
//     // if (devices.DeviceType && devices.DeviceType === deviceType && !isExclued && !isAlreadyAdded && arrayOfDevices.includes(devices.DeviceID)) {
//     if (
//       devices.DeviceType &&
//       devices.DeviceType === deviceType &&
//       !isExclued &&
//       !isAlreadyAdded
//     ) {
//       console.log("before sendDeviceTogetTemprature");

//       await updateThermostateDeviceInfoBeforeGetMode(
//         gatewayId,
//         devices,
//         mongoObject
//       );

//       /**dont have the mode set in request */
//       log.info("MODE NOT GIVEN");
//       let res = {};
//       let req = {
//         params: {
//           commandType: zomeUtils.GET_PARAMS,
//           gatewayuuid: gatewayId,
//           commandForDispatch: true,
//         },
//         query: {
//           deviceID: devices.DeviceID,
//           command: zomeUtils.GET_TSTAT_MODE,
//         },
//       };

//       log.info(
//         "Inside loop of send to get device mod and device id is=>",
//         devices.DeviceID
//       );
//       log.info("command is=>", JSON.stringify(req));

//       await sendCommandToIRCChannel(req, res);

//       // if (mongoObject.temprature_mode) {
//       //   log.info(
//       //     "consolce mongoObject.temprature_mode",
//       //     mongoObject.temprature_mode
//       //   );
//       //   // need to call the function that recieves the response from IRC channel
//       //   // updateThermostateDeviceInfoAfterGetMode(gatewayId, deviceObj)
//       //   setThermostatMode(
//       //     gatewayId,
//       //     devices.DeviceID,
//       //     mongoObject.temprature_mode
//       //   );
//       // } else {
//       //   /**dont have the mode set in request */
//       //   log.info("MODE NOT GIVEN");
//       //   let res = {};
//       //   let req = {
//       //     params: {
//       //       commandType: zomeUtils.GET_PARAMS,
//       //       gatewayuuid: gatewayId,
//       //     },
//       //     query: {
//       //       deviceID: devices.DeviceID,
//       //       command: zomeUtils.GET_TSTAT_MODE,
//       //     },
//       //   };
//       //   await sendCommandToIRCChannel(req, res);
//       // }
//     }
//   }
// };

// const sendDeviceTogetTempratureAfterSetMod = async (
//   gatewayId,
//   deviceObj,
//   mongoRequestObject
// ) => {
//   log.info("sendDeviceTogetTempratureAfterSetMod===>", gatewayId);
//   log.info("sendDeviceTogetTempraturedeviceObjSetMod====>", deviceObj);
//   const mode = getModeToSendIrcChannl(mongoRequestObject.temprature_mode);
//   let res = {};
//   let req = {
//     params: {
//       commandType: zomeUtils.GET_PARAMS,
//       gatewayuuid: gatewayId,
//       commandForDispatch: true,
//     },
//     query: {
//       deviceID: deviceObj.device_id,
//       command: zomeUtils.GET_SET_POINT_TEMP_VAL,
//       param1: mode,
//     },
//   };
//   log.info(
//     "Sending Commmand to getting the temprature in currunt mode commnand is"
//   );
//   log.info(JSON.stringify(req));
//   log.info("before sendDeviceTogetTempratureafterSetMod@@@@", req);
//   await sendCommandToIRCChannel(req, res);
// };

// const getModeToSendIrcChannl = (originalMode) => {
//   return originalMode == "2" ? "1" : "2";
// };

// const updateThermostateDeviceInfoBeforeGetMode = async (
//   gatewayId,
//   devices,
//   mongoObject
// ) => {
//   log.info("inside the updateThermostateDeviceInfoBeforeGetMode");
//   log.info(
//     "inside the updateThermostateDeviceInfoBeforeGetMode gatewayId",
//     gatewayId
//   );
//   log.info(
//     "inside the updateThermostateDeviceInfoBeforeGetMode devices",
//     devices
//   );

//   // zomeserver.Connection('devZomePower');
//   // const dbName = 'devZomePower';
//   // var connectionString = mongoserver.Connection.useDb(dbName);
//   // const dispatchEventDetailDb =connectionString.model("dispatchEventDetail", dispatchEventDetail);

//   const deviceObject = {
//     device_id: devices.DeviceID,
//     device_type: devices.DeviceType,
//     device_name: devices.DeviceName,
//     device_uuid: devices.DeviceUUID,
//     previouse_temprature_info: {
//       set_point_type: null,
//       set_point_unit: null,
//       set_point_temp: null,
//       set_point_mode: mongoObject.temprature_mode
//         ? mongoObject.temprature_mode
//         : 0,
//     },
//     final_temprature_info: {
//       set_point_type: null,
//       set_point_unit: null,
//       set_point_temp: null,
//       set_point_mode: null,
//     },
//   };
//   await dispatchEventDetail.updateOne(
//     {
//       gateway_uuid: gatewayId,
//       is_deleted: false,
//     },
//     {
//       $addToSet: {
//         gateway_devices: deviceObject,
//       },
//     },
//     {
//       returnNewDocument: true,
//     },
//     function (error, result) {
//       log.info("updateThermostateDeviceInfoBeforeGetMode error===>", error);
//       log.info(
//         "updateThermostateDeviceInfoBeforeGetMode result===>",
//         result
//       );
//     }
//   );
// };

// const updateThermostateDeviceInfoAfterGetMode = async (gatewayId, devices) => {
//   // log.info("Updation After Getting Some More")
//   // console.log("inside the updateThermostateDeviceInfoAfterGetMode");
//   // console.log(
//   //   "inside the updateThermostateDeviceInfoAfterGetMode gatewayId",
//   //   gatewayId
//   // );
//   // console.log(
//   //   "inside the updateThermostateDeviceInfoAfterGetMode devices",
//   //   devices
//   // );
//   // zomeserver.Connection('devZomePower');
//   let modeOfDevice = null;
//   if (devices.length > 0 && devices[0]["Thermostat mode"]) {
//     devices = devices[0];
//     const desiredMode = devices["Thermostat mode"].toLowerCase();
//     log.info("desiredMode==>", desiredMode);
//     switch (desiredMode) {
//       case "off":
//         modeOfDevice = "1";
//         break;
//       case "heat":
//         modeOfDevice = "2";
//         break;
//       case "cool":
//         modeOfDevice = "3";
//         break;
//       case "auto":
//         modeOfDevice = "4";
//     }
//     // console.log(
//     //   "modeOfDevice in updateThermostateDeviceInfoAfterGetMode@@@@@",
//     //   modeOfDevice
//     // );

//     await dispatchEventDetail.updateOne(
//       {
//         gateway_uuid: gatewayId,
//         is_deleted: false,
//         gateway_devices: { $elemMatch: { device_id: devices["device id"] } },
//         "gateway_devices.previouse_temprature_info.set_point_mode": { $lt: 1 },
//       },
//       {
//         $set: {
//           "gateway_devices.$.previouse_temprature_info.set_point_mode":
//             modeOfDevice,
//         },
//       },
//       {
//         returnNewDocument: true,
//       },
//       async function (error, result) {
//         console.log("FunctiondoneFor the Getmode error==>", error);
//         console.log("FunctiondoneFor the Getmode result==>", result);
//         log.info(
//           "We have updated the get mod result for device ",
//           devices["device id"]
//         );
//         log.info("Query success result is==>", result);
//         log.info("Query error result is==>", error);
//       }
//     );

//     // get Device temprature

//     getDeviceCurruntTempratureOfCurruntMode(
//       modeOfDevice,
//       gatewayId,
//       devices["device id"]
//     );
//     /**commented because of flow  */
//     // setThermostatMode(gatewayId, devices["device id"], modeOfDevice);
//   }
// };

// const getDeviceCurruntTempratureOfCurruntMode = async (
//   mode,
//   gatewayId,
//   deviceId
// ) => {
//   let res = {};
//   let req = {
//     params: {
//       commandType: zomeUtils.GET_PARAMS,
//       gatewayuuid: gatewayId,
//       commandForDispatch: true,
//     },
//     query: {
//       deviceID: deviceId,
//       command: zomeUtils.GET_SET_POINT_TEMP_VAL,
//       param1: getModeToSendIrcChannl(mode),
//     },
//   };
//   log.info("getDeviceCurruntTempratureOfCurruntMode", req);
//   await sendCommandToIRCChannel(req, res);
// };

// /**
//  *
//  * @param {*} gatewayId
//  * @param {*} modeOfDevice
//  * This function calls from 2 place
//  * set the thermostat mode
//  */
// const setThermostatMode = async (gatewayId, deviceId, modeOfDevice) => {
//   log.info("ModeOfDevice==>", modeOfDevice);
//   log.info("gatewayId==>", gatewayId);

//   // const dbName = 'devZomePower';
//   // var connectionString = mongoserver.Connection.useDb(dbName);
//   // const dispatchEventDetailDb =connectionString.model("dispatchEventDetail", dispatchEventDetail);
//   const curruntData = await dispatchEventDetail.findOne({
//     gateway_uuid: gatewayId,
//     is_deleted: false,
//     gateway_devices: { $elemMatch: { device_id: deviceId } },
//   });
//   let modOfSendToIrc = modeOfDevice;
//   if (
//     curruntData &&
//     curruntData.temprature_mode &&
//     curruntData.temprature_mode != null &&
//     curruntData.temprature_mode !== undefined
//   ) {
//     modOfSendToIrc = curruntData.temprature_mode;
//   }

//   // CHECKING IF THE CURRENT MODE IS SAME AS DEVICE MODE

//   const currentDeviceObject = curruntData.gateway_devices.find(
//     ({ device_id }) => {
//       return device_id === deviceId;
//     }
//   );

//   if (
//     currentDeviceObject &&
//     currentDeviceObject.previouse_temprature_info.set_point_mode ==
//       curruntData.temprature_mode
//   ) {
//     // if mod is already set
//     sendDeviceTogetTempratureAfterSetMod(
//       gatewayId,
//       { device_id: deviceId },
//       curruntData
//     );
//   } else {
//     let res = {};
//     let req = {
//       zcReqId: generateIRCRequestId(),
//       params: {
//         commandType: zomeUtils.SET_PARAMS,
//         gatewayuuid: gatewayId,
//         commandForDispatch: true,
//       },
//       query: {
//         deviceID: deviceId,
//         command: zomeUtils.SET_MODE,
//         param1: getModeValueTosendInCommand(modOfSendToIrc),

//         //setModeQuery: true,
//       },
//     };
//     log.info("Inside Setting final The mod");
//     await updteDispatchEventDetailSetModIrcRequestId(
//       gatewayId,
//       deviceId,
//       req.zcReqId
//     );

//     await sendCommandToIRCChannel(req, res);
//   }
// };

// // const updateThermostateDeviceInfoAfterGetPoint = async (gatewayId, devices) => {
// //   log.info("inside the updateThermostateDeviceInfoAfterGetPoint");
// //   log.info(
// //     "inside the updateThermostateDeviceInfoAfterGetPoint gatewayId",
// //     gatewayId
// //   );
// //   log.info(
// //     "inside the updateThermostateDeviceInfoAfterGetPoint devices",
// //     devices
// //   );
// //   // zomeserver.Connection('devZomePower');
// //   // const dbName = 'devZomePower';
// //   // var connectionString = mongoserver.Connection.useDb(dbName);
// //   // const dispatchEventDetailDb =connectionString.model("dispatchEventDetail", dispatchEventDetail);

// //   if (devices.length > 0 && devices[0]["Thermostat setpoint temp"]) {
// //     devices = devices[0];
// //     await setTempratureToThermostat(gatewayId, devices["device id"]);
// //     // const typeofUnit =
// //     //   devices["Thermostat setpoint unit"] === "Fahrenheit" ? "1" : "0";
// //     // const temratureValue = devices["Thermostat setpoint temp"];
// //     // const temratureType = devices["Thermostat setpoint type"];

// //     // await dispatchEventDetail.updateOne(
// //     //   {
// //     //     gateway_uuid: gatewayId,
// //     //     is_deleted: false,
// //     //     gateway_devices: {
// //     //       $elemMatch: { device_id: devices["device id"], get_mode: false },
// //     //     },
// //     //   },
// //     //   {
// //     //     $set: {
// //     //       "gateway_devices.$.get_mode": true,
// //     //       "gateway_devices.$.previouse_temprature_info.set_point_unit":
// //     //         typeofUnit,
// //     //       "gateway_devices.$.previouse_temprature_info.set_point_type":
// //     //         temratureType,
// //     //       "gateway_devices.$.previouse_temprature_info.set_point_type":
// //     //         temratureType,
// //     //       "gateway_devices.$.previouse_temprature_info.set_point_temp":
// //     //         temratureValue,
// //     //     },
// //     //   },
// //     //   {
// //     //     returnNewDocument: true,
// //     //   },
// //     //   async function (error, result) {
// //     //     log.info(
// //     //       "updateThermostateDeviceInfoAfterGetPoint result===>",
// //     //       result
// //     //     );
// //     //     log.info(
// //     //       "updateThermostateDeviceInfoAfterGetPoint result===>",
// //     //       error
// //     //     );
// //     //     // await setTempratureToThermostat(gatewayId, devices["device id"]);
// //     //   }
// //     // );
// //   }
// // };

// const updateThermostateDeviceInfoFinal = async (gatewayId, reqId) => {
//   log.info("inside the updateThermostateDeviceInfoFinal");
//   log.info(
//     "inside the updateThermostateDeviceInfoFinal gatewayId",
//     gatewayId
//   );
//   log.info("inside the updateThermostateDeviceInfoFinal reqId", reqId);
//   // zomeserver.Connection('devZomePower');
//   // const dbName = 'devZomePower';
//   // var connectionString = mongoserver.Connection.useDb(dbName);
//   // const dispatchEventDetailDb =connectionString.model("dispatchEventDetail", dispatchEventDetail);

//   const getDeviceInfo = await dispatchEventDetail.findOne({
//     is_deleted: false,
//     gateway_uuid: gatewayId,
//     "gateway_devices.irc_request_id": reqId,
//   });
//   log.info(
//     "inside the updateThermostateDeviceInfoFinal getDeviceInfo",
//     getDeviceInfo
//   );

//   if (getDeviceInfo) {
//     const getParticularDeviceInfo = getDeviceInfo.gateway_devices.find(
//       ({ irc_request_id }) => {
//         return irc_request_id === reqId;
//       }
//     );

//     log.info("getParticularDeviceInfo==>", getParticularDeviceInfo);

//     if (getParticularDeviceInfo) {
//       let modeOfChane = getDeviceInfo.temprature_mode;

//       if (!modeOfChane) {
//         modeOfChane =
//           getParticularDeviceInfo.currunt_mode_temprature_info.set_point_mode;
//       }
//       log.info("before modeOfChane====>", modeOfChane);

//       let finalTemprature = parseInt(
//         getParticularDeviceInfo.currunt_mode_temprature_info.set_point_temp
//       );
//       log.info("finalTemprature====>", finalTemprature);
//       switch (modeOfChane) {
//         case "1":
//           finalTempratureure = eval(finalTemprature);
//           break;
//         case "2":
//           finalTemprature = eval(
//             finalTemprature - parseInt(getDeviceInfo.temprature_value)
//           );
//           break;
//         case "3":
//           finalTemprature = eval(
//             finalTemprature + parseInt(getDeviceInfo.temprature_value)
//           );
//           break;
//         case "4":
//           finalTemprature = eval(
//             finalTemprature + parseInt(getDeviceInfo.temprature_value)
//           );
//           break;
//         default:
//           finalTemprature = eval(
//             finalTemprature + parseInt(getDeviceInfo.temprature_value)
//           );
//       }

//       log.info("Finally==>", finalTemprature);

//       const curruntValue = Math.round(finalTemprature);
//       if (curruntValue) {
//         await dispatchEventDetail.updateOne(
//           {
//             gateway_uuid: gatewayId,
//             is_deleted: false,
//             "gateway_devices.device_id": getParticularDeviceInfo.device_id,
//           },
//           {
//             $set: {
//               "gateway_devices.$.final_temprature_info.set_point_type":
//                 getParticularDeviceInfo.currunt_mode_temprature_info
//                   .set_point_type,
//               "gateway_devices.$.final_temprature_info.set_point_unit":
//                 getParticularDeviceInfo.currunt_mode_temprature_info
//                   .set_point_unit,
//               "gateway_devices.$.final_temprature_info.set_point_mode":
//                 getParticularDeviceInfo.currunt_mode_temprature_info
//                   .set_point_mode,
//               "gateway_devices.$.final_temprature_info.set_point_temp":
//                 curruntValue,
//             },
//           },
//           {
//             returnNewDocument: true,
//           },
//           function (error, result) {
//             log.info("updateThermostateDeviceInfoFinal result===>", result);
//             log.info("updateThermostateDeviceInfoFinal result===>", error);
//             updateDispatchEventDetailToDeleted(gatewayId);
//           }
//         );
//       }
//     }
//   }
// };

// const updateDispatchEventDetailToDeleted = async (gatewayId) => {
//   const updatetoDeleted = await dispatchEventDetail.findOne({
//     gateway_uuid: gatewayId,
//     "gateway_devices.final_temprature_info.set_point_temp": { $eq: null },
//   });
//   log.info("updatetoDeleted==>", updatetoDeleted);
//   if (!updatetoDeleted) {
//     const dispatchData = await dispatchEventDetail.findOne({
//       gateway_uuid: gatewayId,
//       is_deleted: false,
//     });
//     const mlseconds = dispatchData.minutes * 60000;
//     const invocationDate = new Date(Date.now() + mlseconds);
//     const detail = await dispatchEventDetail.updateOne(
//       {
//         gateway_uuid: gatewayId,
//         is_deleted: false,
//       },
//       {
//         $set: {
//           is_deleted: true,
//           schedular_date: invocationDate,
//         },
//       },
//       {
//         returnNewDocument: true,
//       },
//       function (error, result) {
//         log.info("All-Process-Finished===>", result);
//         log.info("All-Process-error Finished===>", error);
//         log.info("updatetoDeletedinneroops==>");
//         updateCron(dispatchData.cronId, dispatchData._id);
//       }
//     );
//   }
// };

// const setTempratureToThermostat = async (gatewayId, deviceId, mongoObject) => {
//   log.info("setTempratureToThermostat", deviceId);
//   let deviceInfo = deviceId[0];
//   deviceId = deviceInfo["device id"];
//   const isDispatchDevice = await dispatchEventDetail.findOne({
//     gateway_uuid: gatewayId,
//     is_deleted: false,
//     "gateway_devices.device_id": deviceId,
//   });

//   log.info(
//     "This is the main dispatchDevice==>",
//     JSON.stringify(isDispatchDevice)
//   );

//   if (!isDispatchDevice) {
//     return;
//   }

//   const typeofUnit =
//     deviceInfo["Thermostat setpoint unit"] === "Fahrenheit" ? "1" : "0";
//   const temratureValue = deviceInfo["Thermostat setpoint temp"];
//   const temratureType = deviceInfo["Thermostat setpoint type"];
//   // first updating
//   await dispatchEventDetail.updateOne(
//     {
//       gateway_uuid: gatewayId,
//       is_deleted: false,
//       "gateway_devices.device_id": deviceId,
//     },
//     {
//       $set: {
//         "gateway_devices.$.set_temprature": true,
//         "gateway_devices.$.currunt_mode_temprature_info.set_point_unit":
//           typeofUnit,
//         "gateway_devices.$.currunt_mode_temprature_info.set_point_type":
//           temratureType,
//         "gateway_devices.$.currunt_mode_temprature_info.set_point_temp":
//           temratureValue,
//         "gateway_devices.$.currunt_mode_temprature_info.set_point_mode":
//           mongoObject.temprature_mode,
//       },
//     },
//     {
//       returnNewDocument: true,
//     },
//     function (error, result) {}
//   );

//   log.info("setTempratureToThermostat deviceTempratureObject===>");
//   const command = zomeUtils.SET_TEMPERATURE;
//   const commandtype = zomeUtils.SET_PARAMS;
//   const checkRequestIDvalue = mongoObject; //await getDispatchEventDetail(gatewayId);
//   log.info("checkRequestIDvalue===>", checkRequestIDvalue);

//   if (checkRequestIDvalue) {
//     let modeOfChane = checkRequestIDvalue.temprature_mode;
//     const getDeviceData = checkRequestIDvalue.gateway_devices.find(
//       ({ device_id }) => {
//         log.info("device_id==>", device_id);
//         return device_id === deviceId;
//       }
//     );
//     log.info("getDeviceDataTTTTTTTt", getDeviceData);
//     // 1 -OFF
//     // 2 -HEAT
//     // 3- COOL
//     // 4 -AUTO
//     if (!modeOfChane) {
//       // modeOfChane = getDeviceData.previouse_temprature_info.set_point_mode;
//       modeOfChane = temratureType;
//     }
//     log.info("before modeOfChane====>", modeOfChane);

//     let finalTemprature = parseInt(temratureValue);
//     log.info("finalTemprature====>", finalTemprature);
//     switch (modeOfChane) {
//       case "1":
//         finalTempratureure = finalTemprature;
//         break;
//       case "2":
//         finalTemprature = eval(
//           parseInt(finalTemprature) -
//             parseInt(checkRequestIDvalue.temprature_value)
//         );
//         break;
//       case "3":
//         finalTemprature = eval(
//           parseInt(finalTemprature) +
//             parseInt(checkRequestIDvalue.temprature_value)
//         );
//         break;
//       case "4":
//         finalTemprature = eval(
//           parseInt(finalTemprature) +
//             parseInt(checkRequestIDvalue.temprature_value)
//         );
//         break;
//       default:
//         finalTemprature = eval(
//           parseInt(finalTemprature) +
//             parseInt(checkRequestIDvalue.temprature_value)
//         );
//     }

//     log.info("Finally we have set temprature==>", finalTemprature);

//     const curruntValue = Math.round(finalTemprature);

//     log.info("value curruntValue==>", curruntValue);
//     // curruntValue=36;
//     if (curruntValue > 35 && curruntValue < 95) {
//       let res = {};
//       let req = {
//         zcReqId: generateIRCRequestId(),
//         tags: "dispatchSetpointDevice",
//         params: {
//           commandType: commandtype,
//           gatewayuuid: gatewayId,
//           commandForDispatch: true,
//         },
//         query: {
//           deviceID: deviceId,
//           command: command,
//           param1: "1",
//           type: modeOfChane > 2 ? 1 : 0,
//           unit: typeofUnit,
//           value: curruntValue,
//         },
//       };
//       await sendCommandToIRCChannel(req, res);
//       // await updteDispatchEventDetailDeviceIrcRequestId(
//       //   gatewayId,
//       //   deviceId,
//       //   req.zcReqId
//       // );

//       //new code
//       await dispatchEventDetail.updateOne(
//         {
//           gateway_uuid: gatewayId,
//           is_deleted: false,
//           "gateway_devices.device_id": deviceId,
//         },
//         {
//           $set: {
//             "gateway_devices.$.irc_request_id": req.zcReqId,
//             "gateway_devices.$.final_temprature_info.set_point_type":
//               temratureType,
//             "gateway_devices.$.final_temprature_info.set_point_unit":
//               typeofUnit,
//             "gateway_devices.$.final_temprature_info.set_point_mode":
//               mongoObject.temprature_mode,
//             "gateway_devices.$.final_temprature_info.set_point_temp":
//               curruntValue,
//           },
//         },
//         {
//           returnNewDocument: true,
//         },
//         function (error, result) {
//           log.info("updateThermostateDeviceInfoFinal result===>", result);
//           log.info("updateThermostateDeviceInfoFinal result===>", error);
//           updateDispatchEventDetailToDeleted(gatewayId);
//         }
//       );

//       // const dbName = 'devZomePower';
//       // var connectionString = mongoserver.Connection.useDb(dbName);
//       // const DeviceDb =connectionString.model("Device", Device);
//     } else {
//       //update device info that temprature is high or low
//       await dispatchEventDetail.updateOne(
//         {
//           gateway_uuid: gatewayId,
//           is_deleted: false,
//           "gateway_devices.device_id": deviceId,
//         },
//         {
//           $set: {
//             "gateway_devices.$.other_info": "Temprature is out of Range",
//             "gateway_devices.$.final_temprature_info.set_point_temp": 0,
//           },
//         },
//         {
//           returnNewDocument: true,
//         },
//         function (error, result) {
//           log.info("Incorrect temprature info ===>", result);
//           log.info("Incorrect temprature info ===>", error);
//           updateDispatchEventDetailToDeleted(gatewayId);
//         }
//       );
//     }
//   }
//   return;
// };

// function ResetConnections(opt) {
//   log.info(`Reset Connection..`);

//   if (opt == 1) {
//     bot.connect({
//       host: ircServerConfig.host,
//       port: ircServerConfig.port,
//       nick: zkConnectorAsyncNick + "_" + Math.floor(Math.random() * 100000),
//       auto_reconnect_max_wait: ircServerConfig.max_wait,
//       auto_reconnect_max_retries: ircServerConfig.max_retries,
//       ping_interval: ircServerConfig.ping_int,
//       ping_timeout: ircServerConfig.ping_time,
//       auto_reconnect: ircServerConfig.auto_recon,
//     });
//   } else {
//     bot2.connect({
//       host: ircServerConfig.host,
//       port: ircServerConfig.port,
//       nick: zkConnectorNick + "_" + Math.floor(Math.random() * 10000000),
//       auto_reconnect_max_wait: ircServerConfig.max_wait,
//       auto_reconnect_max_retries: ircServerConfig.max_retries,
//       ping_interval: ircServerConfig.ping_int,
//       ping_timeout: ircServerConfig.ping_time,
//       auto_reconnect: ircServerConfig.auto_recon,
//     });
//   }
// }

// bot.on("close", function () {
//   setTimeout(ResetConnections, 5000, 1);
// });
// bot2.on("close", function () {
//   setTimeout(ResetConnections, 5000, 2);
// });

// // main last function to be executed
// const dispatchEventSchedular = async (baseId) => {
//   zomeserver.Connection("devZomePower");
//   const resultDispatchEventDetail = await dispatchEventDetail.findOne({
//     _id: baseId,
//     reset_done: false,
//   });
//   log.info("dispatchEventForschedular baseId===>", baseId);
//   log.info("dispatchEventForschedular===>", resultDispatchEventDetail);

//   if (resultDispatchEventDetail) {
//     // update that resetting done
//     await dispatchEventDetail.updateOne(
//       { _id: baseId },
//       {
//         $set: {
//           reset_done: true,
//           is_deleted: true,
//         },
//       },
//       {
//         returnNewDocument: true,
//       },
//       function (error, result) {
//         log.info("dispatchEventSchedular===>", result);
//         log.info("dispatchEventSchedular error===>", error);
//       }
//     );

//     for (data of resultDispatchEventDetail.gateway_devices) {
//       const gatewayId = resultDispatchEventDetail.gateway_uuid;
//       const deviceId = data.device_id;
//       const previouseTemrature = parseInt(
//         data.previouse_temprature_info.set_point_temp
//       );
//       const isExclued = resultDispatchEventDetail.excluded_device.find(
//         (deviceid) => {
//           return deviceid === data.device_id;
//         }
//       );

//       log.info("isExclued in reset ever==>", isExclued);
//       if (previouseTemrature > 35 && previouseTemrature < 95 && !isExclued) {
//         log.info("insideLoop===>", data);
//         log.info(
//           "is cooling==>",
//           data.previouse_temprature_info.set_point_type === "Cooling"
//         );

//         const curruntTempratureMode =
//           data.currunt_mode_temprature_info.set_point_type;
//         const previouseTempratureMode =
//           data.previouse_temprature_info.set_point_type;
//         log.info("curruntTempratureMode==>", curruntTempratureMode);
//         log.info("previouseTempratureMode==>", previouseTempratureMode);
//         if (curruntTempratureMode !== previouseTempratureMode) {
//           console.log(
//             "Not Matched",
//             curruntTempratureMode !== previouseTempratureMode
//           );

//           //set the thermostat temprature
//           const commandCurrunt = zomeUtils.SET_TEMPERATURE;
//           const commandtypeCurrunt = zomeUtils.SET_PARAMS;
//           let resDataCurruntMode = {};
//           let reqDataCurruntModeCurrunt = {
//             params: {
//               commandType: commandtypeCurrunt,
//               gatewayuuid: gatewayId,
//               commandForDispatch: true,
//             },
//             query: {
//               deviceID: deviceId,
//               command: commandCurrunt,
//               param1: "1",
//               type:
//                 data.currunt_mode_temprature_info.set_point_type === "Cooling"
//                   ? 1
//                   : 0,
//               unit: data.currunt_mode_temprature_info.set_point_unit,
//               value: data.currunt_mode_temprature_info.set_point_temp,
//             },
//           };
//           await sendCommandToIRCChannel(
//             reqDataCurruntModeCurrunt,
//             resDataCurruntMode
//           );
//         }

//         // if(data.previouse_temprature_info.set_point_type !=resultDispatchEventDetail.temprature_mode){
//         // setting the Thermostat mod
//         let res = {};
//         let req = {
//           params: {
//             commandType: zomeUtils.SET_PARAMS,
//             gatewayuuid: gatewayId,
//             commandForDispatch: true,
//           },
//           query: {
//             deviceID: deviceId,
//             command: zomeUtils.SET_MODE,
//             //param1: data.previouse_temprature_info.set_point_mode,
//             param1:
//               data.previouse_temprature_info.set_point_type === "Cooling"
//                 ? 3
//                 : 2,
//           },
//         };
//         await sendCommandToIRCChannel(req, res);
//         // }

//         //set the thermostat temprature
//         const command = zomeUtils.SET_TEMPERATURE;
//         const commandtype = zomeUtils.SET_PARAMS;
//         let resData = {};
//         let reqData = {
//           params: {
//             commandType: commandtype,
//             gatewayuuid: gatewayId,
//             commandForDispatch: true,
//           },
//           query: {
//             deviceID: deviceId,
//             command: command,
//             param1: "1",
//             type:
//               data.previouse_temprature_info.set_point_type === "Cooling"
//                 ? 1
//                 : 0,
//             // ,getModeValueTosendInCommand(
//             //   data.previouse_temprature_info.set_point_mode
//             // ),
//             unit: data.previouse_temprature_info.set_point_unit,
//             value: data.previouse_temprature_info.set_point_temp,
//           },
//         };
//         await sendCommandToIRCChannel(reqData, resData);
//       }
//     }
//     // this is the schedule to update after 2 mins
//     const requestObj = {
//       dispatchEventName: resultDispatchEventDetail.event_name,
//       gatewayUuid: resultDispatchEventDetail.gateway_uuid,
//     };
//     const miliseconds = process.env.CHECKSUCCESS || 120000;
//     // After 2 mins we are checking for all commands
//     const invocationDate = new Date(Date.now() + miliseconds);
//     log.info("Setting Schedule fo command check at ", invocationDate);
//     schedule.scheduleJob(
//       invocationDate,
//       function (iD) {
//         eventLog.onDispatchEventCompleted(iD);
//       }.bind(null, JSON.stringify(requestObj))
//     );
//   }
// };
// /**
//  * main function for scheduling
//  */
// const setScheduling = async (id = false) => {
//   zomeserver.Connection("devZomePower");
//   let options = { reset_done: false };
//   if (id) {
//     options = { _id: id };
//   } else {
//     //cancel and reschedule the job
//     const listofJobs = schedule.scheduledJobs;
//     if (
//       Object.keys(listofJobs).length !== 0 &&
//       listofJobs.constructor === Object
//     ) {
//       log.info("listofJobs==>", listofJobs);
//       for (job of listofJobs) {
//         job.cancel();
//       }
//     }
//   }
//   const resultDispatchEventDetail = await dispatchEventDetail.find(options);

//   const RUN_CRON_AFTER_TIME = true;
//   if (resultDispatchEventDetail) {
//     for (schedulingData of resultDispatchEventDetail) {
//       var date = new Date(schedulingData.schedular_date);
//       /** if RUN_CRON_AFTER_TIME true then cron will run imideatly  */
//       if (RUN_CRON_AFTER_TIME) {
//         const mlseconds = 1 * 60000;
//         const invocationDate = new Date(Date.now() + mlseconds);
//         log.info("invocationDate", invocationDate > date);
//         if (invocationDate > date) {
//           date = invocationDate;
//         }
//       }

//       const baseId = schedulingData._id;
//       log.info("shceduling for id ==>", schedulingData._id);
//       log.info("shceduling for on date  ==>", date);

//       const job = schedule.scheduleJob(
//         date,
//         function (iD) {
//           dispatchEventSchedular(iD);
//         }.bind(null, baseId)
//       );

//       await dispatchEventDetail.updateOne(
//         { _id: baseId },
//         {
//           $set: {
//             cronId: job.name,
//           },
//         },
//         {
//           returnNewDocument: true,
//         },
//         function (error, result) {
//           log.info("===>in set name", result);
//           log.info("===> inset name ", error);
//         }
//       );
//     }
//   }
// };

// const getModeValueTosendInCommand = (modeValue) => {
//   // modeValue = parseInt(modeValue);
//   if (modeValue == 1 || modeValue == "1") {
//     return null;
//   }

//   if (modeValue == 2 || modeValue == "2") {
//     //heating mode
//     return "2";
//   }

//   if (modeValue == 3 || modeValue == "3") {
//     // cooling mode
//     return "3";
//   }

//   if (modeValue == 4 || modeValue == "4") {
//     // cooling mode
//     return null;
//   }
// };

// const checkExclusionOfDevice = async (gatewayUUID, deviceInfo) => {
//   // log.info("In Exclusion one device is there 1");
//   // return true;
//   const resultDispatchEventDetail = await dispatchEventDetail.findOne({
//     gateway_uuid: gatewayUUID,
//     reset_done: false,
//     is_deleted: true,
//   });
//   log.info("In Exclusion one device is there");

//   if (resultDispatchEventDetail) {
//     deviceid = deviceInfo[0]["device id"];
//     deviceMod = deviceInfo[0]["Thermostat mode"];
//     const getDeviceData = resultDispatchEventDetail.gateway_devices.find(
//       ({ device_id }) => {
//         // log.info("set_mod_request_id==>", set_mod_request_id);
//         return device_id === deviceid;
//       }
//     );

//     if (getDeviceData) {
//       const finalTemprature = parseInt(
//         getDeviceData.final_temprature_info.set_point_temp
//       );
//       const previouseTemprature = parseInt(
//         getDeviceData.previouse_temprature_info.set_point_temp
//       );
//       const curruntTemprature = parseInt(
//         getDeviceData.currunt_mode_temprature_info.set_point_temp
//       );
//       const changedTemprature = parseInt(
//         deviceInfo[0]["Thermostat setpoint temp"]
//       );
//       const finalTempratureMode =
//         getDeviceData.final_temprature_info.set_point_type;
//       const previouseDeviceMode =
//         finalTempratureMode === "Heating" ? "Heat" : "Cool";
//       console.log("previousemod==>", previouseDeviceMode);
//       console.log("deviceMod==>", deviceMod);

//       log.info("finalTemprature checkExclusionOfDevice==>", finalTemprature);
//       log.info(
//         "changedTemprature checkExclusionOfDevice==>",
//         changedTemprature
//       );
//       log.info(
//         "curruntTemprature checkExclusionOfDevice==>",
//         curruntTemprature
//       );
//       if (
//         finalTemprature > 35 &&
//         finalTemprature < 95 &&
//         changedTemprature > 0 &&
//         changedTemprature != finalTemprature &&
//         changedTemprature != previouseTemprature &&
//         changedTemprature != curruntTemprature
//       ) {
//         log.info("Adding device to Exclusion..!===>", changedTemprature);
//         const query = { reset_done: false, gateway_uuid: gatewayUUID };
//         const updateDocument = {
//           $addToSet: { excluded_device: deviceid },
//         };
//         await dispatchEventDetail.updateMany(query, updateDocument);
//         mongoose.connection.close();
//       }

//       if (
//         deviceMod &&
//         previouseDeviceMode &&
//         previouseDeviceMode !== deviceMod
//       ) {
//         console.log("Adding device to Exclusion..!===>", changedTemprature);
//         const query = { reset_done: false, gateway_uuid: gatewayUUID };
//         const updateDocument = {
//           $addToSet: { excluded_device: deviceid },
//         };
//         await dispatchEventDetail.updateMany(query, updateDocument);
//         mongoose.connection.close();
//       }
//     }
//   }
// };

// const onSystemRebootCheckSchedule = async () => {
//   const mlseconds = 1 * 60000; // 1 minute
//   const date = new Date(Date.now() - mlseconds);
//   const dispatchEventDetail = await dispatchEventLogs.find({
//     is_success: false,
//     last_check: {
//       // 1 minutes ago (from now)
//       $gte: date,
//     },
//     retry_count: {
//       $lte: rTC,
//     },
//   });

//   if (dispatchEventDetail) {
//     for (dispatchEventDetaildata of dispatchEventDetail) {
//       await setRetrySchedule(dispatchEventDetaildata.irc_request_id);
//     }
//   }
// };
// const setRetrySchedule = async (ircRequestId) => {
//   const mlseconds = 15 * 1000; //15 seconds
//   const invocationDate = new Date(Date.now() + mlseconds);

//   const job = schedule.scheduleJob(
//     invocationDate,
//     function (ircRequestId) {
//       checkRetry(ircRequestId);
//     }.bind(null, ircRequestId)
//   );
// };

// const checkRetry = async (ircRequestId, deviceInfo = {}) => {
//   const eventData = await eventLog.getLogInfo(ircRequestId);
//   // const rTC = process.env.RETRYCOUNT || 3;
//   if (parseInt(eventData.retry_count) < rTC && eventData.is_success == false) {
//     retryCommandExcetuion(ircRequestId, deviceInfo);
//     setRetrySchedule(ircRequestId);
//   }
// };
// const retryCommandExcetuion = async (ircRequestId, deviceInfo) => {
//   // const eventData = await eventLog.onEventFailure(ircRequestId, deviceInfo);
//   const eventData = await eventLog.getLogInfo(ircRequestId);
//   log.info("eventData==>0", eventData);
//   // const rTC = process.env.RETRYCOUNT || 3;
//   if (eventData && parseInt(eventData.retry_count) < parseInt(rTC)) {
//     console.log("retrying with===>", eventData.command_description);
//     // const channel2 = bot2.channel("#zome-datafeed-" + eventData.gateway_uuid);
//     // channel2.say(eventData.command_description);
//     await sendCommandToIRCChannel(
//       JSON.parse(eventData.reqParams),
//       {},
//       JSON.parse(eventData.reqParams)
//     );
//     const detail = await dispatchEventLogs.findOneAndUpdate(
//       { irc_request_id: ircRequestId },
//       {
//         $push: {
//           failure_json: JSON.stringify(deviceInfo),
//         },
//         retry_count: eventData.retry_count + 1,
//         // $inc: { retry_count: 1 }
//       },
//       {
//         lean: true,
//         new: true,
//         // useFindAndModify: true,
//       },
//       function (error, result) {
//         log.info("onEventFailure update thing ===>", result);
//         log.info("onEventFailure update thing ===>", error);
//       }
//     );
//   }
// };

// const sleepFunction = (time) => {
//   return new Promise((resolve) => setTimeout(resolve, time));
// };

// /**
//  * will cancel the cron
//  * @param {*} jobId
//  * @param {*} scheduleDataId
//  */
// const updateCron = (jobId, scheduleDataId) => {
//   const listofJobs = schedule.scheduledJobs;
//   if (
//     Object.keys(listofJobs).length !== 0 &&
//     listofJobs.constructor === Object
//   ) {
//     log.info("listofJobs==>", listofJobs);
//     for (const [name, job] of Object.entries(listofJobs)) {
//       if (jobId === name) {
//         job.cancel();
//         setScheduling(scheduleDataId);
//       }
//     }
//   }
// };

// const sendCommandToIRCChannel = (req, res, retryBody = null) => {
//   // console.log("callOptions==>callOptions primary requests", req.body);
//   // console.log("callOptions==>callOptions primary requests", req.query);
//   // console.log("callOptions==>callOptions primary requests", req.zcReqId);
//   var gatewayUuid = req.params.gatewayuuid;
//   //Send the command on IRC channel #zome-datafeed-<zome-gateway-uuid>.
//   var channel2 = bot2.channel("#zome-datafeed-" + gatewayUuid);
//   buffers2.push(channel2);
//   channel2.join();
//   console.log(req.query);
//   var message;
//   if(!req.zcReqId){
//     req.zcReqId =generateIRCRequestId();

//   }
//   console.log(req.query);

//   //Find which command type are we sending
//   var commandtype = req.params.commandType;
//   if (commandtype == zomeUtils.ADD_DEVICE) {
//     message = {
//       commandType: req.params.commandType,
//       gatewayUuid: gatewayUuid,
//       retryBody,
//       reqId: req.zcReqId,
//       desc: req.query.desc,
//     };
//   } else if (
//     commandtype == zomeUtils.REMOVE_DEVICE ||
//     commandtype == zomeUtils.GET_DEVICE_LIST ||
//     commandtype == zomeUtils.IMAGE_VERSION
//   ) {
//     message = {
//       commandType: req.params.commandType,
//       gatewayUuid: gatewayUuid,
//       reqId: req.zcReqId,
//     };
//   } else if (commandtype == zomeUtils.ADD_DEVICE_DSK) {
//     message = {
//       commandType: req.params.commandType,
//       gatewayUuid: gatewayUuid,
//       reqId: req.zcReqId,
//       param1: req.query.param1,
//       desc: req.query.desc,
//     };
//   } else if (commandtype == zomeUtils.SET_PARAMS) {
//     var command = req.query.command;
//     console.log(command);
//     switch (command) {
//       case zomeUtils.SET_TEMPERATURE:
//         message = {
//           commandType: req.params.commandType,
//           gatewayUuid: gatewayUuid,
//           reqId: req.zcReqId,
//           deviceID: req.query.deviceID,
//           command: req.query.command,
//           type: req.query.type,
//           unit: req.query.unit,
//           value: req.query.value,
//         };
//         break;
//       case zomeUtils.SET_DIFFERENTIAL_TEMP_MODE:
//       case zomeUtils.SET_TEMP_REPORT_FILTER:
//         message = {
//           commandType: req.params.commandType,
//           gatewayUuid: gatewayUuid,
//           reqId: req.zcReqId,
//           deviceID: req.query.deviceID,
//           command: req.query.command,
//           param1: req.query.param1,
//           param2: req.query.param2,
//         };
//         break;

//       default:
//         message = {
//           commandType: req.params.commandType,
//           gatewayUuid: gatewayUuid,
//           reqId: req.zcReqId,
//           deviceID: req.query.deviceID,
//           command: req.query.command,
//           param1: req.query.param1,
//         };
//         break;
//     }
//   } else if (commandtype == zomeUtils.GET_PARAMS) {
//     var command = req.query.command;
//     switch (command) {
//       case zomeUtils.GET_SET_POINT_TEMP_VAL:
//       case zomeUtils.GET_LIVE_TEMP:
//         message = {
//           commandType: req.params.commandType,
//           gatewayUuid: gatewayUuid,
//           reqId: req.zcReqId,
//           deviceID: req.query.deviceID,
//           command: req.query.command,
//           param1: req.query.param1,
//         };
//         break;

//       default:
//         message = {
//           commandType: req.params.commandType,
//           gatewayUuid: gatewayUuid,
//           reqId: req.zcReqId,
//           deviceID: req.query.deviceID,
//           command: req.query.command,
//         };
//         break;
//     }
//   } else if (
//     commandtype == zomeUtils.GET_ALL_PARAMS_TSTAT ||
//     commandtype == zomeUtils.GET_ALL_PARAMS_SWITCH ||
//     commandtype == zomeUtils.REMOVE_NODE
//   ) {
//     message = {
//       commandType: req.params.commandType,
//       gatewayUuid: gatewayUuid,
//       reqId: req.zcReqId,
//       deviceID: req.query.deviceID,
//     };
//   } else if (
//     commandtype == zomeUtils.END_DEVICE_UPDATE ||
//     commandtype == zomeUtils.ADD_TO_GROUP ||
//     commandtype == zomeUtils.CONTROL_GROUP ||
//     commandtype == zomeUtils.REMOVE_FROM_GROUP
//   ) {
//     message = {
//       commandType: req.params.commandType,
//       gatewayUuid: gatewayUuid,
//       reqId: req.zcReqId,
//       deviceID: req.query.deviceID,
//       param1: req.query.param1,
//       param2: req.query.param2,
//     };
//   } else {
//     message = {
//       commandType: req.params.commandType,
//       gatewayUuid: gatewayUuid,
//       reqId: req.zcReqId,
//       param1: req.query.param1,
//     };
//   }

//   let body = {};
//   if (!retryBody) {
//     body["params"] = req.params;
//     body["query"] = req.query;
//     body["zcReqId"] = req.zcReqId;
//   } else {
//     body = retryBody;
//   }

//   var callOptions = {
//     url: process.env.API_GATEWAY_END_POINT_URL,
//     method: "POST",
//     body: body,
//   };

//   // log.info("callOptions==>callOptions",callOptions);

//   sleepFunction(5000).then(() => {
//     if (!retryBody) {
//       eventLog.createDispatchEventLog(body, message, true);
//       setRetrySchedule(req.zcReqId);
//     }

//     rest.call(null, callOptions, async (err, response, body) => {
//       // log.debug("=================================================");
//       // log.debug("Error", body);
//       // log.debug("Error", response);
//       // log.debug("Error", err);
//       // log.debug("=================================================");
//     });
//   });
// };
