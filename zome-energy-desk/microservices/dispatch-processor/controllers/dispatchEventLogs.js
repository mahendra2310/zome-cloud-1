const log = require("zome-server").logger.log;
const zomeserver = require("zome-server");
const dispatchEventLogs = require("mongo-dbmanager").dispatchEventLogs;
const dispatchEventDetail = require("mongo-dbmanager").dispatchEventDetailModel;
const zomeUtils = require("zome-utils");
// const nodemailer = require("nodemailer");
// const Mailgen = require('mailgen');

const createDispatchEventLog = async (body,ircMessage, commandForDispatch = null) => {
    zomeserver.Connection("devZomePower");
    let eventName = "";
    if (commandForDispatch && commandForDispatch != null && commandForDispatch != undefined) {
        const getDeviceInfo = await dispatchEventDetail.findOne({
            gateway_uuid: ircMessage.gatewayUuid
        }, {}, { sort: { 'created_at': -1 } });
        if (getDeviceInfo) {
            eventName = getDeviceInfo.event_name;            
        }
    }

    const createPayload = new dispatchEventLogs({
        irc_request_id: ircMessage.reqId,
        gateway_uuid: ircMessage.gatewayUuid,
        event_name: eventName,
        reqParams:JSON.stringify(body),
        device_id: ircMessage.deviceID,
        command: ircMessage.command,
        command_type: ircMessage.commandType,
        command_description: JSON.stringify(ircMessage),
        retry_count: 0,
        failure_json: [],
    });
    await createPayload.save();
}

const updateToSuccess = async (ircRequestId, deviceInfo) => {
    zomeserver.Connection("devZomePower");
    const updatedData = await dispatchEventLogs.updateOne({ irc_request_id: ircRequestId }, { is_success: true, sucees_response_synch: JSON.stringify(deviceInfo) }, function (err, res) {
        log.info("Request Becomes Success for the request ID ==> ", ircRequestId);
    });
    log.info("This is the updated data===>", updatedData);
};

const updateAsynchResponse = async (ircRequestId, deviceInfo) => {
    zomeserver.Connection("devZomePower");
    await dispatchEventLogs.updateOne({ irc_request_id: ircRequestId }, { sucees_response_asynch: JSON.stringify(deviceInfo) }, function (err, res) {
        log.info("Request Becomes Success for the request ID ==> ", ircRequestId);
    });
};

const updateRetryCount = async (ircRequestId) => {
    zomeserver.Connection("devZomePower");
    const infoDispatchEventLog = await dispatchEventLogs.updateOne({ irc_request_id: ircRequestId }, { $inc: { retry_count: 1 } }, function (err, res) {
        log.info("Request Becomes Failes for the request ID ==> ", ircRequestId);
    });
};


/**
 * 
 * @param {*} gatewayId 
 * @param {*} deviceId 
 * @param {*} dataOfchennal 
 */
const updateAsynchLogs = async (deviceData) => {

    const gateWayId = deviceData.GatewayUUID;
    const status = deviceData.deviceInfo[0]["Status"] || deviceData.deviceInfo[0]["status"];
    const deviceResponseBody = deviceData.deviceInfo[0];
    const deviceId = deviceData.deviceInfo[0]["device id"];
    let saveCommand=false;
    if (status === "FAILED") {

        log.info("updation of logs for failure==> ");
        log.info(deviceData);

    } else {
        
        const eventNameData = await dispatchEventDetail.findOne({ gateway_uuid: gateWayId,  status: { $exists: false }  });
        if (eventNameData) {
            let where = { gateway_uuid: gateWayId, device_id: deviceId, event_name: eventNameData.event_name };

            if (deviceResponseBody.hasOwnProperty("Thermostat mode")) {
                where = { ...where, command: { $in: [zomeUtils.SET_MODE, zomeUtils.GET_TSTAT_MODE] } };
                saveCommand = true;
            }            
            if (deviceResponseBody.hasOwnProperty("Thermostat setpoint temp")) {
                saveCommand = true;
                where = { ...where, command: { $in: [zomeUtils.GET_SET_POINT_TEMP_VAL, zomeUtils.SET_TEMPERATURE] } };
            }
            if ( saveCommand){
                const logData = await dispatchEventLogs.find(where).limit(1).sort({ $natural: -1 });
                log.info(logData[0]._id);
                log.info("This is last data we are getting");
                log.info(logData);
                log.info(logData[0]);
                // log.info(logData[0] );
    
                if (logData) {
                    await dispatchEventLogs.updateOne(
                        { _id: logData[0]._id },
                        {
                            $set: {
                                sucees_response_asynch: JSON.stringify(deviceData),
                            }
                        },
                        {
                            lean: true,
                            new: true,
                        },
                        function (error, result) {
                            log.info("updation of logs ==> ", result);
                            log.info("updation of logs for errors ==> ", error);
                        }
                    );
                }

            }
         
        }
    }


};

const getLogInfo = async (irc_request_id) => {
    zomeserver.Connection("devZomePower");
    return await dispatchEventLogs.findOne({ irc_request_id });
};


const onEventFailure = async (ircRequestId, deviceInfo) => {
    // const dispatchEventDetail = await getLogInfo(ircRequestId);
    const dispatchEventDetail = await dispatchEventLogs.findOne({ irc_request_id: ircRequestId });
    if (dispatchEventDetail) {
        const retryCout = process.env.RETRYCOUNT || 3;
        log.info("retryCout***", retryCout);
        log.info("dispatchEventDetail.retry_count***", dispatchEventDetail.retry_count);
        log.info("dispatchEventDetail.retry_count***", dispatchEventDetail.retry_count);
        log.info("parseInt(dispatchEventDetail.retry_count) >= parseInt(retryCout)***", parseInt(dispatchEventDetail.retry_count) >= parseInt(retryCout));
        log.info("parseInt(dispatchEventDetail.retry_count) >= parseInt(retryCout)***", parseInt(dispatchEventDetail.retry_count) < parseInt(retryCout));

        if (parseInt(dispatchEventDetail.retry_count) >= parseInt(retryCout)) {
            // send Email To Respected Devs Team
            // TODO : SEND EMAIL 
            log.info("sending email for the retry count");
        } else if (parseInt(dispatchEventDetail.retry_count) <= parseInt(retryCout)) {

            const detail = await dispatchEventLogs.findOneAndUpdate(
                { irc_request_id: ircRequestId },
                {
                    $push: {
                        failure_json: JSON.stringify(deviceInfo),
                    },
                    $inc: { retry_count: 1 }
                },
                {
                    lean: true,
                    new: true,
                    // useFindAndModify: true,
                },
                function (error, result) {
                    log.info("onEventFailure update thing ===>", result);
                    log.info("onEventFailure update thing ===>", error);
                }
            );


            log.info("detail===>", detail);

            //  await reTryExcecution(ircRequestId);
            //await updateRetryCount(ircRequestId);
            return detail;
        }
        return false;
    }
}

// const sendMail = async(nameEmail, senderEmail, senderText, receiversEmail, subjectEmail, bodyEmail) => {
//     var mailGenerator = new Mailgen({
//         theme: 'default',
//         product: {
//             // Appears in header & footer of e-mails
//             name: 'Mailgen',
//             link: 'https://mailgen.js/'
//             // Optional product logo
//             // logo: 'https://mailgen.js/img/logo.png'
//         }
//     });

//     var email = {
//       body: {
//           name: nameEmail,
//           intro: 'Retry count exceded',
//           action: {
//               instructions: bodyEmail,
//               button: {
//                   color: '#22BC66', // Optional action button color
//                   text: 'Zome-energy',
//                   link: 'https://mailgen.js/confirm?s=d9729feb74992cc3482b350163a1a010'
//               }
//           },
//           outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
//       }
//     };

//     var emailBody = mailGenerator.generate(email);
//     let transporter = nodemailer.createTransport({
//       host: "smtp.bhojr.email",  // Change host name accroding to our bhojr email smtp
//       port: 587,
//       secure: false, // true for 465, false for other ports
//       auth: {
//         user: "Bhojr user email",
//         pass: "Bhojr email password",
//       },
//     });

//      // send mail with defined transport object
//      let info = await transporter.sendMail({
//       from: `"${senderText}" <${senderEmail}>`, // sender address
//       to: receiversEmail, // list of receivers || if multiple receiver then use comma separate like abc@mail.com, xyz@mail.com
//       subject: subjectEmail, // Subject line
//       // text: textEmail, // plain text body
//       html: emailBody, // html body
//     });

//     log.info("Message sent: %s", info.messageId);
//     log.info("Preview URL: %s", nodemailer.getTestMessageUrl(info));
//   }

const onDispatchEventCompleted = async (requestObj) => {
    requestObj = JSON.parse(requestObj);
    const dispatchEventName = requestObj.dispatchEventName;
    const gatewayUuid = requestObj.gatewayUuid;
    log.info("onDispatchEventCompleted dispatchEventName", dispatchEventName);
    log.info("onDispatchEventCompleted gatewayUuid", gatewayUuid);
    zomeserver.Connection("devZomePower");
    const dispatchEventCommandLogs = await dispatchEventLogs.find({ event_name: dispatchEventName, gateway_uuid: gatewayUuid });
    log.info("dispatchEventCommandLogs.reduce===>", dispatchEventCommandLogs);
    if (dispatchEventCommandLogs) {
        const successCount = dispatchEventCommandLogs.reduce((a, v) => (v.is_success ? a + 1 : a), 0);
        const errorCount = dispatchEventCommandLogs.reduce((a, v) => (!v.is_success ? a + 1 : a), 0);
        const totalCount = successCount + errorCount;
        let finalStatus = 3;
        let finalDesctiption = `${successCount} are success and ${errorCount} are Failed among ${totalCount} Events`;
        if (errorCount == 0) {
            finalStatus = 1;
            finalDesctiption = `All ${totalCount} events are suceed !!!`;
        } else if (successCount === 0) {
            finalStatus = 0;
            finalDesctiption = `All ${totalCount} events are failed !!!`;
        }

        log.info("final status for gatewayUuid", gatewayUuid);
        log.info("final status for ", finalStatus);
        log.info("final description for ", finalDesctiption);

        await dispatchEventDetail.updateOne(
            {
                gateway_uuid: dispatchEventCommandLogs[0].gateway_uuid,
                event_name: dispatchEventName,
            },
            {
                $set: {
                    status: finalStatus,
                    status_description: finalDesctiption
                },
            },
            {
                returnNewDocument: true,
            },
            async function (error, result) {
                log.info(result);
                log.error(error);
            }
        );
    }

}
module.exports = {
    onEventFailure: (ircRequestId, deviceInfo) => {
        return onEventFailure(ircRequestId, deviceInfo)
    },
    createDispatchEventLog: (body,ircMessage, commandForDispatch) => {
        return createDispatchEventLog(body,ircMessage, commandForDispatch)
    },
    updateToSuccess: (ircRequestId, deviceInfo) => {
        return updateToSuccess(ircRequestId, deviceInfo)
    },
    updateRetryCount: (ircRequestId) => {
        return updateRetryCount(ircRequestId)
    },
    getLogInfo: (ircRequestId) => {
        return getLogInfo(ircRequestId)
    },
    onDispatchEventCompleted: (requestObj) => {
        return onDispatchEventCompleted(requestObj)
    },
    updateAsynchResponse: (requestObj) => {
        return updateAsynchResponse(requestObj)
    },
    updateAsynchLogs: (requestObj) => {
        return updateAsynchLogs(requestObj)
    },



}





