const fs = require("fs");
// require('dotenv').config();
const finalPath = __dirname + "/../" + process.env.TOKEN_FILE_NAME;
const gatewayfinalPath = __dirname + "/../" + process.env.GATEWAY_FILE_NAME;
const parser = require("xml2json");
const baseApiUrl = process.env.CPOWER_BASE_API_LINK;
const cpowerEventDetail = require("mongo-dbmanager").cpowerEventDetailModel;
const gatewaymodel = require("mongo-dbmanager").gatewaymodel;
const cpowerMockModel = require("mongo-dbmanager").cpowerMockModel;
const devicemodel = require('mongo-dbmanager').devicemodel;
const rest = require("zome-server").rest;
const axios = require("axios");
const zomeserver = require("zome-server");
const schedule = require("node-schedule");
const cpowerMock = require("mongo-dbmanager/schema/cpowerMock");
const log = require("zome-server").logger.log;
const cpowerLink = require("./cpowerConfig.js");
const DispatchEventDetail = require("mongo-dbmanager").dispatchEventDetailModel;
const { resetDispatchProcess } = require("../../dispatch-processor/controllers/dispatchProcess.controller")

// TODO : RESPONSE PARSING FROM CPOWER
// TODO : GATEWAY NAME AND ATTACH WITH THE LOCATION
// TODO : CHECK OVERALL FLOW WITH 48 AND 69 TOGATHER
// TODO : POOR ERROR HANDLING
        


// const ERROR_CODE_SUCCESS = "000";
// const ERROR_CODE_SUCCESS = "000";
// const ERROR_CODE_SUCCESS = "000";


/**
 * getGateway id based on the meterid
 * @param {*} meterID 
 */
const getGateway = async (meterID) => {
    return getGatewayFromFile(meterID);
    //return await getGatewayFromDatabse(meterID);
}

const getGatewayFromFile = (meterId) => {
    const gateWay = [];
    console.log("gatewayfinalPath==>", gatewayfinalPath);
    console.log(fs.existsSync(gatewayfinalPath));
    if (fs.existsSync(gatewayfinalPath)) {
        const gatewayFileData = fs.readFileSync(gatewayfinalPath, "utf8");
        console.log(gatewayFileData);
        const fileData = gatewayFileData.split("\n");
        for (let iter in fileData) {
            var tempVar = {};
            if (fileData[iter]) {
                var asso = fileData[iter].split("=");
                console.log("asso", asso);
                if (asso) {
                    tempVar[asso[0].trim()] = asso[1].trim();
                    if (asso[0].trim() == `${meterId}`) {
                        gateWay.push(asso[1].trim());
                    }
                }
            }
        }
    }
    return gateWay;
}

const getGatewayFromDatabse = async (meterId) => {

    const gateWayData = await gatewaymodel.find({
        meterId,
    });
    const gateways = [];
    if (gateWayData) {
        for (const gt of gateWayData) {
            gateways.push(gt.gateway_uuid);
        }
    }
    return gateways;
}

const getCpToken = () => {
    return new Promise((resolve) => {
        let tokenData = readFileToken();
        resolve(tokenData);
    });
};

const generateTokenFile = (token) => {
    console.log("In generateTokenFile");
    if (fs.existsSync(finalPath)) {
        fs.unlink(finalPath, (err) => {
            if (err) throw err;
            console.log("File deleted!");
        });
    }

    const timeStamp = Math.floor(Date.now() / 1000);
    const fileData = `token=${token}\ntimestamp=${timeStamp}`;
    try {
        fs.writeFileSync(finalPath, fileData, {
            flag: "a+",
        });
    } catch (err) {
        console.error(err);
    }
};

const readFileToken = () => {
    let token = "ERROR";
    let timeStamp = null;
    const response = {
        token,
        timeStamp,
    };

    try {
        // console.log("new one==>",fs.existsSync(finalPath));
        if (fs.existsSync(finalPath)) {
            const tokenFileData = fs.readFileSync(finalPath, "utf8");
            console.log(tokenFileData);
            const fileData = tokenFileData.split("\n");
            for (let iter in fileData) {
                var tempVar = {};
                if (fileData[iter]) {
                    var asso = fileData[iter].split("=");
                    console.log("asso", asso);
                    if (asso) {
                        tempVar[asso[0].trim()] = asso[1].trim();
                        if (asso[0].trim() == "token") {
                            response.token = asso[1].trim();
                        } else if (asso[0].trim() == "timestamp") {
                            timeStamp = asso[1].trim();
                        }
                    }
                }
            }
        }
    } catch (err) {
        console.error(err);
    }
    return response;
};

const getTokenFromCpower = () => {
    return new Promise((resolve, reject) => {
        const userName = process.env.CPOWER_USERNAME;
        const password = process.env.CPOWER_PASSWORD;
        const stringOfCredentials = `${userName}:${password}`;
        console.log("stringOfCredentials==>", stringOfCredentials);
        const buffuser = new Buffer.from(stringOfCredentials);
        const APIcredentials = buffuser.toString("base64");
        console.log("APIcredentials==>", APIcredentials);
        const ApiUrl = `${baseApiUrl}authenticate`;

        const config = {
            method: "get",
            url: ApiUrl,
            headers: {
                Authorization: `Basic ${APIcredentials}`,
            },
        };

        axios(config)
            .then((response) => {
                resolve(parser.toJson(response.data));
            })
            .catch((error) => {
                reject(error);
            });
    });
};

const createCron = async (scheduleDataId = null) => {
    zomeserver.Connection("devZomePower");
    let options = { isDeleted: false, isCancelled: false, isExcecuted: false };
    if (scheduleDataId) {
        options = { meterId: scheduleDataId, isDeleted: false, isCancelled: false, isExcecuted: false };
    } else {
        clearAllCron();
    }

    const resultcpowerEventDetail = await cpowerEventDetail.find(options);

    const RUN_CRON_AFTER_TIME = process.env.RUN_CRON_AFTER_TIME;
    if (resultcpowerEventDetail) {
        for (schedulingData of resultcpowerEventDetail) {
            var date = new Date(schedulingData.startDate);
            if (RUN_CRON_AFTER_TIME) {
                const invocationDate = new Date(Date.now() + 20000);
                console.log("invocationDate", invocationDate > date);
                if (invocationDate > date) {
                    date = invocationDate;
                }
            }
            const baseId = schedulingData._id;

            console.log("shceduling for id ==>", schedulingData._id);
            console.log("shceduling for on date  ==>", date);

            const job = schedule.scheduleJob(
                date,
                function (iD) {
                    dispatchEventSchedular(iD);
                }.bind(null, baseId)
            );
            await cpowerEventDetail.updateOne(
                { _id: baseId },
                {
                    $set: {
                        cronId: job.name,
                    },
                },
                {
                    returnNewDocument: true,
                },
                function (error, result) {
                    console.log("===>in set name", result);
                    console.log("===> inset name ", error);
                }
            );
        }
    }
};

const dispatchEventSchedular = async (baseid) => {

    zomeserver.Connection("devZomePower");
    const resultcpowerEventDetail = await cpowerEventDetail.findOneAndUpdate(
        {
            _id: baseid,
        },
        {
            $set: {
                isExcecuted: true,
            },
        },
        {
            new: true,
            upsert: true,
        }
    );

    if (resultcpowerEventDetail) {
        console.log("=================================================================================================================================================")
        // TODO : GATEWAY FINDING
        // const resultcpowerEventDetail = await cpowerEventDetail.findOne({
        //     _id: baseid,
        // });
        const startDate = new Date(resultcpowerEventDetail.startDate);
        const endDate = new Date(resultcpowerEventDetail.endDate);
        const diffMs = endDate - startDate;
        //  var dif = (endDate - startDate);

        var minutes = Math.round((diffMs / 1000) / 60);
        console.log("The final minutes are==>", minutes);

        //const minutes = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes
        // const gt = await getGateway(resultcpowerEventDetail.meterId);
        // console.log(gt);
        let req = {
            excludeDeviceId: '[\"1634092637060\",\"1634093164824\",\"1634093526263\",\"1634093821180\",\"1634094054588\",\"1634352478975\",\"1634690682888\",\"1634691462133\",\"1634691898350\",\"1634858536085\",\"1634858987634\",\"1634859369007\",\"1634859833852\",\"1634860403350\",\"1634865512407\",\"1634868454891\"]',
            // excludeDeviceId:'[]',
            gatewayIds: '["9f8e3c-b6a2eb-29f5-bdf0NaN752d73f2"]', //JSON.stringify(resultcpowerEventDetail.gatewayUuid),
            // gatewayIds: JSON.stringify(gt),
            // mode: resultcpowerEventDetail.mode,
            temprature: resultcpowerEventDetail.tempratureValue,
            minutes,
        };
        var callOptions = {
            url: "http://localhost:30012/zomecloud/api/v1/executeDispatch", // `${zomeKitConnectorUrl}/$
            // url: process.env.GATEWAY_END_POINT_URL,
            method: "POST",
            body: req,
        };
        rest.call(null, callOptions, async (err, response, body) => {
            log.debug("=================================================");
            log.debug("Call for", baseid);
            // log.debug("Error", body);
            // log.debug("Error", response);
            // log.debug("Error", err);
            log.debug("=================================================");
        });
    }
};

/**
 * will cancel the cron
 * @param {*} jobId
 * @param {*} scheduleDataId
 */
const updateCron = (jobId, scheduleDataId) => {
    const listofJobs = schedule.scheduledJobs;
    if (
        Object.keys(listofJobs).length !== 0 &&
        listofJobs.constructor === Object
    ) {
        console.log("listofJobs==>", listofJobs);
        for (const [name, job] of Object.entries(listofJobs)) {
            if (jobId === name) {
                job.cancel();
                createCron(scheduleDataId);
            }
        }
    }
};


/**
 * will cancel the cron
 * @param {*} jobId 
 */
const deleteCron = (jobId) => {
    const listofJobs = schedule.scheduledJobs;
    if (
        Object.keys(listofJobs).length !== 0 &&
        listofJobs.constructor === Object
    ) {
        console.log("listofJobs==>", listofJobs);
        for (const [name, job] of Object.entries(listofJobs)) {
            if (jobId === name) {
                job.cancel();
            }
        }
    }
};


const clearAllCron = () => {
    const listofJobs = schedule.scheduledJobs;
    if (
        Object.keys(listofJobs).length !== 0 &&
        listofJobs.constructor === Object
    ) {
        for (const [job] of Object.entries(listofJobs)) {
            job.cancel();
        }
    }
};

const aknowledgeCpower = (sessionID, eventId, meterId) => {
    return new Promise((resolve, reject) => {
        const ApiUrl = `${baseApiUrl}${sessionID}/AcknowledgeEvent`;
        const postData = `<AckEventRequest xmlns="http://schemas.datacontract.org/2004/07/VLinkService.Services.vLinkService" xmlns:i="http://www.w3.org/2001/XMLSchema-instance"><EventId>${eventId}</EventId><MeterId>${meterId}</MeterId></AckEventRequest>`;
        var config = {
            method: "POST",
            url: ApiUrl,
            headers: {
                Authorization: `Basic ${sessionID}`,
                "Content-Type": "application/xml",
            },
            data: postData,
        };
        axios(config)
            .then((response) => {
                resolve(parser.toJson(response.data));
            })
            .catch((error) => {
                reject(error);
            });
    });
};

const getEventDetailCpower = (sessionID) => {
    return new Promise((resolve, reject) => {
        const ApiUrl = `${baseApiUrl}${sessionID}/DispatchEvents`;
        console.log("ApiUrl", ApiUrl);
        var config = {
            method: "get",
            url: ApiUrl,
            headers: {
                Authorization: `Basic ${sessionID}`,
            },
        };
        axios(config)
            .then((response) => {
                resolve(parser.toJson(response.data));
            })
            .catch((error) => {
                reject(error);
            });
    });
};

const getTempDispatchEvent = () => {
    // "https://run.mocky.io/v3/052fd1b5-c93d-432c-b8fa-b83b7bd1e5fd",
    //https://run.mocky.io/v3/87bb7072-1f6e-41c9-b4cb-e43d07eb7aeb
    // https://run.mocky.io/v3/d2af1ecf-6a44-4d32-84b6-54d867a0a195
    console.log("staticXML:::",staticXML)
    return parser.toJson(staticXML)
    // const urls = ["http://5e05-180-211-110-125.ngrok.io/dispatchEvents"];
    // const random = Math.floor(Math.random() * urls.length);
    // const finalUrl = urls[random];
    // console.log("finalUrl==>", finalUrl);

    // return new Promise((resolve, reject) => {
    //     const ApiUrl = finalUrl;
    //     console.log("ApiUrl", ApiUrl);
    //     var config = {
    //         method: "get",
    //         url: ApiUrl,
    //         // headers: {
    //         //     Authorization: `Basic ${sessionID}`,
    //         // },
    //     };
    //     axios(config)
    //         .then((response) => {
    //             resolve(parser.toJson(response.data));
    //         })
    //         .catch((error) => {
    //             reject(error);
    //         });
    // });

}

const cpowerGetEventDetail = async (req, res) => {

    const allRequestToACK = [];
    let tokenData = await getCpToken();
    let sessionID = tokenData.token;
    if (tokenData.token === "ERROR") {
        const cPowerData = JSON.parse(await getTokenFromCpower());
        console.log("Cpower Authntication on failur===>", cPowerData);
        if (cPowerData.Auth.ErrorCode === "000") {
            sessionID = cPowerData.Auth.ID;
            generateTokenFile(sessionID);
        }
    }




    const responseData = JSON.parse(await getEventDetailCpower(sessionID));
    console.log("Response From Cpower Before Stringyfy", JSON.stringify(responseData));
    console.log("Response From Cpower After", responseData);

    // console.log("responseData===>",responseData);

    if (responseData.DispatchEventResult.ErrorCode === "000") {


        zomeserver.Connection("devZomePower");

        // const dispatchEventResult = responseData;

        // // need to comment it
        const dispatchEventResult = JSON.parse(await getTempDispatchEvent());
        console.log("Event Result IS ==>", dispatchEventResult);

        // console.log("Temporary event Result ==>",dispatchEventResult['DispatchEventResult']['DispatchEventList']);
        console.log("Result seperation ==>", dispatchEventResult['DispatchEventResult']['DispatchEventList']);

        if (dispatchEventResult && Object.keys(dispatchEventResult['DispatchEventResult']['DispatchEventList']).length > 0) {
            const existingEventList = await cpowerEventDetail.find({
                isDeleted: false,
                isCancelled: false,
                isExcecuted: false,
            });

            const newEvents = [];
            let eventDataFromList = dispatchEventResult['DispatchEventResult']['DispatchEventList']['DispatchEvent'];
            console.log("Looping the Data typeof ==>", typeof eventDataFromList);
            console.log("Array.isArray()", Array.isArray(eventDataFromList));
            if (!Array.isArray(eventDataFromList)) {
                console.log("It is not an array==>", eventDataFromList);
                eventDataFromList = [dispatchEventResult['DispatchEventResult']['DispatchEventList']['DispatchEvent']];
            }
            console.log("Looping the Data2 ==>", eventDataFromList);

            const responseDataPart = await eventDataFromList.filter(
                (data) => {
                    const isExists = existingEventList.find(
                        ({ meterId }) => parseInt(meterId) === parseInt(data.MeterId)
                    );

                    const startDateStingFormat = `${data.StartDate} GMT`;
                    const endDateStingFormat = `${data.EndDate} GMT`;
                    const cpowerStartDate = new Date(startDateStingFormat);
                    const cpowerEndDate = new Date(endDateStingFormat);
                    const curruntTime = new Date();

                    console.log("cpowerStartDate.getTime()==>", cpowerStartDate.getTime());
                    console.log("cpowerStartDate.getTime()==> local", curruntTime.getTime());
                    console.log("comparison of timezones==>", cpowerStartDate.getTime() > curruntTime.getTime());
                    console.log("comparison of exits==>", !isExists);
                    // For now testing purpose this is commented in real case needs to enable based on the logic    
                    // if (!isExists && cpowerStartDate.getTime() > curruntTime.getTime()) {

                        const dataToInsert = {
                            ResourceId: (data.ResourceId) ? (JSON.stringify(data.ResourceId)) : "",
                            IsInternalTestEvent: (data.IsInternalTestEvent) ? data.IsInternalTestEvent : "",
                            DemandEventSourceType: (data.DemandEventSourceType) ? data.DemandEventSourceType : "",
                            endDate: cpowerEndDate,
                            eventId: (data.EventId) ? data.EventId : "",
                            facilityName: (data.FacilityName) ? data.FacilityName : "",
                            isoId: (data.IsoId) ? data.IsoId : "",
                            isoName: (data.IsoName) ? data.IsoName : "",
                            meterId: (data.MeterId) ? data.MeterId : "",
                            meterName: (data.MeterName) ? data.MeterName : "",
                            productTypeId: (data.ProductTypeId) ? data.ProductTypeId : "",
                            productTypeName: (data.ProductTypeName) ? data.ProductTypeName : "",
                            programName: (data.ProgramName) ? data.ProgramName : data.ProgramName,
                            startDate: cpowerStartDate,
                            zoneId: (data.ZoneId) ? data.ZoneId : "",
                            zoneName: (data.ZoneName) ? data.ZoneName : "",
                            tempratureMode: 3,
                            tempratureValue: "5",
                            gatewayUuid: [], // TODO : FIND THE GATEWAUY ID
                            created_by: "ZoomKitConnector-dispatch",
                            updated_by: "ZoomKitConnector-dispatch",
                            createdAt: Date.now(),
                            updatedAt: Date.now(),
                        };
                        if (cpowerStartDate.getTime() !== cpowerEndDate.getTime()) {
                            newEvents.push(dataToInsert);
                        } else {
                            console.log("Event Cancelled Recived In Add", data.EventId);
                            console.log("Event Cancelled Recived In Add with meterID", data.MeterId);
                        }
                    // } else if (isExists) {
                    //     // console.log("isExists inside ==>", isExists);
                    //     const dbStartDate = new Date(isExists.startDate);
                    //     const dbEndDate = new Date(isExists.endDate);

                    //     if (
                    //         dbStartDate.getTime() !== cpowerStartDate.getTime() ||
                    //         dbEndDate.getTime() !== cpowerEndDate.getTime()
                    //     ) {

                    //         // implementation of cancelled events
                    //         if (cpowerStartDate.getTime() === cpowerEndDate.getTime()) {
                    //             console.log("Cancelled Things is called");
                    //             console.log("Event Cancelled Recived", isExists.meterId);
                    //             deleteCron(isExists.cronId);
                    //             cpowerEventDetail.updateOne(
                    //                 { _id: isExists._id },
                    //                 {
                    //                     $set: {
                    //                         isCancelled: true,
                    //                         canceledDate: Date.now()
                    //                     },
                    //                 },
                    //                 function (error, result) {
                    //                     console.log("UPDATION IN Cancelled===>", result);
                    //                     console.log("UPDATION IN Cancelled ERROR===>", error);
                    //                 }
                    //             );

                    //         } else {

                    //             if (dbStartDate.getTime() !== cpowerStartDate.getTime()) {
                    //                 // TODO : reset Cron
                    //                 updateCron(isExists.cronId, isExists.meterId);
                    //             }

                    //             /**if need to update all */
                    //             //this.updateDbData(isExists._id,data);
                    //             cpowerEventDetail.updateOne(
                    //                 { _id: isExists._id },
                    //                 {
                    //                     $set: {
                    //                         startDate: new Date(cpowerStartDate),
                    //                         endDate: new Date(cpowerEndDate),
                    //                     },
                    //                 },
                    //                 function (error, result) {
                    //                     console.log("UPDATION IN TIMING===>", result);
                    //                     console.log("UPDATION IN TIMING ERROR===>", error);
                    //                 }
                    //             );

                    //             const resultData = aknowledgeCpower(
                    //                 sessionID,
                    //                 isExists.eventId,
                    //                 isExists.meterId
                    //             );
                    //             console.log("Send Aknowledge Event To Cpower for edit event with ==>", `EventID:${isExists.eventId} and meterID: ${isExists.meterId}`);
                    //             allRequestToACK.push(resultData);

                    //         }
                    //     }
                    // }
                }
            );
            // console.log("responseDataPart===>", newEvents);
            if (newEvents.length > 0) {
                console.log("responseDataPart===>", newEvents);
                await cpowerEventDetail
                    .insertMany(newEvents)
                    .then(function (result) {
                        console.log("Data inserted in bulk", result); // Success

                        for (resultdata of result) {
                            createCron(resultdata.meterId);
                            const resData = aknowledgeCpower(
                                sessionID,
                                resultdata.eventId,
                                resultdata.meterId
                            );
                            console.log("Send Aknowledge Event To Cpower with ==>", `EventID:${resultdata.eventId} and meterID: ${resultdata.meterId}`);
                            allRequestToACK.push(resData);
                        }
                        console.log("All data of ack==>", allRequestToACK);
                    })
                    .catch(function (error) {
                        log.error(error); // Failure
                    });
            }
        }
    }
    // console.log("ISLOGGEDOUT==>", responseData.DispatchEventResult);
    if (
        responseData.DispatchEventResult.ErrorCode === "011" ||
        responseData.DispatchEventResult.ErrorCode === "010"
    ) {

        // token is expired
        if (fs.existsSync(finalPath)) {
            fs.unlink(finalPath, (err) => {
                if (err) throw err;
                console.log("File deleted because Token Expired !");
            });
        }
        cpowerGetEventDetail(req, res);
    } else {
        // console.log("Ack Data==>",allRequestToACK);
        // console.log("Ack Data==>",allRequestToACK.length);
        // manuaaly checked the dispatch ack event data
        if (allRequestToACK.length > 0) {
            for (data of allRequestToACK) {
                console.log("aknowledged data from cpower ==>", data);
                const ts = await data;
                console.log("Info for the ackdata==>", ts);

                // const ackResult = await data;
                // TODO: Need to implement acknowledgement for event
            }
        }
        return res.status(200).json({ msg: "Event Recieved !!!!!" });
    }
};


const updateDbData = (baseID, data) => {
    zomeserver.Connection("devZomePower");
    const startDateStingFormat = `${data.StartDate} GMT`;
    const endDateStingFormat = `${data.EndDate} GMT`;
    cpowerEventDetail.updateOne(
        { _id: baseID },
        {
            $set: {
                ResourceId: (data.ResourceId) ? (data.ResourceId).toString() : "",
                IsInternalTestEvent: (data.IsInternalTestEvent) ? data.IsInternalTestEvent : "",
                DemandEventSourceType: (data.DemandEventSourceType) ? data.DemandEventSourceType : "",
                endDate: new Date(endDateStingFormat),
                startDate: new Date(startDateStingFormat),
                eventId: (data.EventId) ? data.EventId : "",
                facilityName: (data.FacilityName) ? data.FacilityName : "",
                isoId: (data.IsoId) ? data.IsoId : "",
                isoName: (data.IsoName) ? data.IsoName : "",
                meterId: (data.MeterId) ? data.MeterId : "",
                meterName: (data.MeterName) ? data.MeterName : "",
                productTypeId: (data.ProductTypeId) ? data.ProductTypeId : "",
                productTypeName: (data.ProductTypeName) ? data.ProductTypeName : "",
                programName: (data.ProgramName) ? data.ProgramName : data.ProgramName,
                zoneId: (data.ZoneId) ? data.ZoneId : "",
                zoneName: (data.ZoneName) ? data.ZoneName : "",
                gatewayUuid: [], // TODO : FIND THE GATEWAUY ID
                created_by: "ZoomKitConnector-dispatch",
                updated_by: "ZoomKitConnector-dispatch",
                updatedAt: Date.now(),
            },
        },
        function (error, result) {
            console.log("updateDbData RESULT===>", result);
            console.log("updateDbData ERROR===>", error);
        }
    );
}

const isEventInDB = (dispatchEvent) => {

};

const formatDispatchData = (dispatchEvent) => {
    var dataHeader = '{ "xmlData": { "DispatchEventResult": { "xmlns": "http://schemas.datacontract.org/2004/07/VLinkService.Services.vLinkService", "xmlns:i": "http://www.w3.org/2001/XMLSchema-instance", "DispatchEventList": {"DispatchEvent": ';
    var meterId = dispatchEvent.MeterId;
    var startDate = dispatchEvent.StartDate;
    var endDate = dispatchEvent.EndDate;
    var eventId = dispatchEvent.EventId;
    var dataFooter = '}, "ErrorCode": "000" } }, "MeterId": "' + meterId + '","EventId": "' + eventId + '","StartDate": "' + startDate + '", "ScheduleTime": "' + startDate + '", "EndDate": "' + endDate + '" }';
    var dispatchData = dataHeader + JSON.stringify(dispatchEvent) + dataFooter;
    dispatchData = dispatchData.replace(/'/g, '"');
    return dispatchData;
};


const getDataFromCpowerAPI = async (req, res) => {
    
}

module.exports = {

    // This method is a mock CPower get method to simulate response from C power API. TODO: Use C power API link instead of this mock link
    mockCpowerCall: async (req, res, next) => {
        try {
            // Sample response to mock a C power call. 
            let xml = "<?xml version='1.0' encoding='utf-16'?><DispatchEventResult xmlns='http://schemas.datacontract.org/2004/07/VLinkService.Services.vLinkService' xmlns:i='http://www.w3.org/2001/XMLSchema-instance'><DispatchEventList><DispatchEvent><DemandEventSourceType>1</DemandEventSourceType><EndDate>Tue April 25,2023 13:00</EndDate><EventId>16818869786737235</EventId><FacilityName>2100 Crystal Drive - 2029818701</FacilityName><IsoId>1</IsoId><IsoName>PJM ISO</IsoName><MeterId>1681886937235</MeterId><MeterName>06344688</MeterName><ProductTypeId>4</ProductTypeId><ProductTypeName>ILR</ProductTypeName><ProgramName>ILR Product Type</ProgramName><StartDate>Tue April 25,2023 13:00</StartDate><ZoneId>141</ZoneId><ZoneName>ATSI</ZoneName></DispatchEvent></DispatchEventList><ErrorCode>000</ErrorCode></DispatchEventResult>";
            res.header('Content-Type', 'application/xml');
            return res.status(200).send(xml);
        } catch (error) {
            return res.status(400).json(error.message);
        }
    },
    // This method will call the mock C power get method and get an mock XML C power
    getCpowerEvent: async (req, res, next) => {
        try {
            // Here we call the mock C power API. TODO: Replace with real C power endpoint during sandbox testing phase
            let callOptions = {
                url: cpowerLink,
                method: 'GET',
                body: {}
            }
            rest.call(
                null,
                callOptions,
                async (err, response, body) => {
                    // Receive body as XML stringz
                    let xmlString = body;
                    log.debug("=================================================");
                    log.debug("CPower Response Data", body);
                    log.debug("=================================================");
                    // Remove any extra info we don't need
                    if(xmlString.indexOf("<DispatchEventResult") != -1 ){
                        xmlString = xmlString.substring(xmlString.indexOf("<DispatchEventResult"));
                    }
                    // Parse to convert to Object 
                    const obj = parser.toJson(xmlString, { object: true });
            
                    // If this pass, then it is a single dispatch event, and will be formatted accordingly
                    if (obj.DispatchEventResult.DispatchEventList.DispatchEvent.length === undefined) {
                   
                    if (obj.DispatchEventResult.DispatchEventList.DispatchEvent !== null || obj.DispatchEventResult.DispatchEventList.DispatchEvent !== undefined) {
                    
                        var event = obj.DispatchEventResult.DispatchEventList.DispatchEvent;
                        var dispatchData = formatDispatchData(event);

                        // Check DB for event, if exisiting do not send

                        let data = {meterId: event.MeterId}

                        if(event.StartDate){ 
                             data.scheduleTime = event.StartDate
                        }
                        let eventInDb = await cpowerMockModel.find({data});
                        let eventFound = false;
                        if (eventInDb.count > 0) {
                            eventFound = true;
                        }
                        if(!eventFound) {
                            // Send all dispatch event info to C Power DB
                        let callOptions = {
                            url: "http://localhost:30005/zomecloud/api/v1/cpower-mock",
                            method: 'POST',
                            body: JSON.parse(dispatchData)
                        }
                        rest.call(
                            null,
                            callOptions,
                            async (err, response, body) => {
                                log.debug("=================================================");
                                log.debug("Error", err);
                                log.debug("=================================================");
                        });
                    }
                
                    }
                } else {
                    // length is defined, we have multiple events
                    // loop through and add each request to db with proper format
                    var numEvents = obj.DispatchEventResult.DispatchEventList.DispatchEvent.length;
                    for (let x = 0; x < numEvents; x++) {
                        if (obj.DispatchEventResult.DispatchEventList.DispatchEvent[x] !== null || obj.DispatchEventResult.DispatchEventList.DispatchEvent[x] !== undefined) {
                            var event = obj.DispatchEventResult.DispatchEventList.DispatchEvent[x];
                            var dispatchData = formatDispatchData(event);
                            
                            let eventInDb = await cpowerMockModel.find({meterId: event.MeterId, scheduleTime: event.StartDate});
                            let eventFound = false;
                            if (eventInDb.count > 0) {
                                eventFound = true;
                            }
                            console.log(eventFound);
                            if (!eventFound) {
                                let callOptions = {
                                    url: "http://localhost:30005/zomecloud/api/v1/cpower-mock",
                                    method: 'POST',
                                    body: JSON.parse(dispatchData)
                                }
                                rest.call(
                                    null,
                                    callOptions,
                                    async (err, response, body) => {
                                        log.debug("=================================================");
                                        log.debug("Error", err);
                                        log.debug("=================================================");
                                });
                            }
                        }
                    }
                }            

                return res.status(200).json({ msg: "Cpower Connector" });
                    
            });
            
        } catch (error) {
            next(error);
        }

    },

    initializeSchedule: () => {
        createCron();
    },
    getDispatchEventDetail: (req, res) => {
        console.log("getDispatchEventDetail")
        cpowerGetEventDetail(req, res);
    },
    getCpowerConnector: async (req, res, next) => {
        try {
            // Get the current time and one minute ahead time 
            const currentTimeNow = new Date();
            const timeRangeStart = new Date(Math.round(currentTimeNow.getTime()/1000)*1000);
            const timeRangeEnd = new Date(timeRangeStart.getTime() + 1*60000 - 1);
            // search cpower DB for cpower event with scheduleTime that falls in one min range of current time
            const dbResult = await cpowerMockModel.find({
                scheduleTime: { $lte: timeRangeEnd, $gte: timeRangeStart},
            });
            var dispatchDict = [];
            var dispatchLength = [];
            if (dbResult.length > 0) {
                for (let i = 0; i < dbResult.length; i++) {
                    var jsonXML = JSON.parse(parser.toJson(dbResult[i].xmlObj));
                    // Find all devices with matching meter ID from cpower event
                    let devices = await devicemodel.find({meter_id: dbResult[i].meterId});
                    // Collect all matching devices IDs with their gateways and the excluded devices from that gateway
                    for (let i = 0; i < devices.length; i++) {
                        let gatewayID = devices[i].gateway_id
                        // If dispatch object has not been created, create one and assign gateway key with excluded devices
                        if (dispatchDict == []) {
                            let totalDeviceList = await devicemodel.find({gateway_id: gatewayID})
                            var deviceIDarray = []
                            for (let x = 0; x < totalDeviceList.length; x++){
                                deviceIDarray.push(totalDeviceList[x].device_id)
                            }
                            dispatchDict[gatewayID] = deviceIDarray;
                            dispatchDict[gatewayID] = dispatchDict[gatewayID].filter(v => v != devices[i].device_id);
                        }
                       // If dispatch object has been created, but gatewayID is not in object keys 
                        else if (!dispatchDict.hasOwnProperty(gatewayID)) {
                            let totalDeviceList = await devicemodel.find({gateway_id: gatewayID})
                            var deviceIDarray = []
                            for (let x = 0; x < totalDeviceList.length; x++){
                                deviceIDarray.push(totalDeviceList[x].device_id)
                            }
                            dispatchDict[gatewayID] = deviceIDarray;
                            dispatchDict[gatewayID] = dispatchDict[gatewayID].filter(v => v != devices[i].device_id);
                        } 
                        // If dispatch object has been created and gatewayID exists in object keys
                        else {
                            dispatchDict[gatewayID] = dispatchDict[gatewayID].filter(v => v != devices[i].device_id);
                        }
                    }
                    // Make array of gateway uuid
                    let gatewayIds = []
                    //for (let i = 0; i < gateways.length; i++) {
                        //gatewayIds.push(gateways[i].gateway_uuid)
                    //}
                    // let startDate = new Date(jsonXML.DispatchEventResult.DispatchEventList.DispatchEvent.StartDate);
                    // let endDate = new Date(jsonXML.DispatchEventResult.DispatchEventList.DispatchEvent.EndDate);

                    // let timeDiffMinutes = Math.abs(startDate.getTime() - endDate.getTime()) / 60000;

                    // for (device in devices) {
                    //     let gatewayID = device.gateway_id
                    //     if (!dispatchLength.has(gatewayID)) {
                    //         dispatchLength[gatewayID] = [timeDiffMinutes]
                    //     } else {
                    //         dispatchLength[gatewayID].append(timeDiffMinutes)
                    //     }
                    // }


                    // let startDate = jsonXML.
                    
                }
            }
            // Loop through dispatch object and for every key (gateway) fire dispatch with excluded devices calculated above
            for (const key of Object.keys(dispatchDict)) {
                console.log(JSON.stringify(dispatchDict[key]));
                let reqparams = {
                    gatewayIds:JSON.stringify([key]),
                    excludeDeviceId:JSON.stringify(dispatchDict[key]),
                    temprature:2,
                    minutes:5
                }
    
                let callOptions = {
                    url: "http://localhost:30012/zomecloud/api/v1/executeDispatch",
                    method: 'POST',
                    body: reqparams
                }
    
                rest.call(
                    null,
                    callOptions,
                    async (err, response, body) => {
                        log.debug("=================================================");
                        log.debug("Error", err);
                        log.debug("=================================================");
                    });
                
            }
            return res.status(200).json({ msg: "Cpower Connector" });
        } catch (error) {
            next(error);
        }
    },
    postCpowerMockServer: async (req, res, next) => {
        try {
            if(req.body.StartDate === undefined && req.body.EndDate === undefined) {
                log.debug("Start Date and End date are empty")
                return res.status(400)
            }
            else {
                const cancleEvent = async (eventDetail) => {
                    /--If the startDate and endDate are same then we remove db entry--/
                    let isDeleted = await cpowerMockModel.findByIdAndDelete({ _id: eventDetail._id });
                    log.debug(isDeleted, "isDeleted")
                };
    
                let data = req.body.xmlData;
                /--Here we convert string data to JSON object--/
                let dataStringify = JSON.stringify(data);
    
                /--Here we convert JSON object to xml data--/
                let xml = parser.toXml(dataStringify, {
                    header: true,
                    indent: '  ',
                    declaration: {
                        encoding: 'UTF-8',
                        standalone: 'yes'
                    }
                });
    
                if(xml){
                    let FindEventIdExist = await cpowerMockModel.find({ eventId: req.body.EventId });
        
                    if (FindEventIdExist.length > 0) {
                        log.debug("Same EventID found")
        
                        if(FindEventIdExist[0].status == "running"){
                            log.debug("Event is currently running status : ", FindEventIdExist[0].status)
        
                                let currentTime = (new Date()).getTime();
                                let eventEndTime = (new Date(req.body.EndDate)).getTime();
        
                                /--Here we check weather current time is greater then comming event end time if yes then we reset temperature--/
                                if (currentTime >= eventEndTime) {
                                    /--Here we search meterId exist or not in DispatchEventDetail document--/
                                    let dispatchDetails = await DispatchEventDetail.findOne({ event_name: req.body.MeterId, reset_done: false })
                                    if (dispatchDetails != null && Object.keys(dispatchDetails).length > 0) {
                                        resetDispatchProcess(dispatchDetails)
    
                                        await cpowerMockModel.findByIdAndUpdate(
                                            { _id: FindEventIdExist[0]._id },
                                            {
                                                endDate: req.body.EndDate,
                                                updatedAt: Date.now()
                                            })
    
                                    } else {
                                        log.debug("None of dispatchEventFound which is currently running")
                                    }
                                } else {
                                    log.debug("Current time is not greater then event end time")
                                    await cpowerMockModel.findByIdAndUpdate(
                                        { _id: FindEventIdExist[0]._id },
                                        {
                                            endDate: req.body.EndDate,
                                            updatedAt: Date.now()
                                        })
                                }
        
                        }else if(FindEventIdExist[0].status == "pending"){
                            log.debug("Event is currently pending status : ", FindEventIdExist[0].status)
        
                            if (req.body.StartDate == req.body.EndDate) {
                                /--Here we cancle event because xml startDate and endDate are equal--/
                                cancleEvent(FindEventIdExist[0])
                            } else {
                                let xmlEndTime = (new Date(req.body.EndDate)).getTime();
                                let databaseStartTime = (new Date(FindEventIdExist[0].startDate)).getTime();
                                log.debug("xmlEndTime : ", xmlEndTime, "databaseStartTime : ", databaseStartTime);
        
                                /--Here we cancle event because existing event startDate is greate than comming xml data event EndDate--/
                                if (databaseStartTime >= xmlEndTime) {
                                    cancleEvent(FindEventIdExist[0])
                                } else {
                                    await cpowerMockModel.findOneAndUpdate(
                                            { eventId: req.body.EventId },
                                            {
                                                xmlObj: xml,
                                                meterId: req.body.MeterId,
                                                eventId: req.body.EventId,
                                                scheduleTime: req.body.ScheduleTime,
                                                endDate: req.body.EndDate,
                                                startDate: req.body.StartDate,
                                                updatedAt: Date.now()
                                            })
                                }
                            }
        
                        }else{
                            log.debug("Event is currently done status : ", FindEventIdExist[0].status)
                        }
        
                    } else {
        
                        let FindMeterIdExist = await cpowerMockModel.find({ meterId: req.body.MeterId });
        
                        if (FindMeterIdExist.length > 0) {
                            /--Here we find stratDate Present incomming xml data--/
                            let startDateFromXml = Date.parse(req.body.StartDate);
        
                            if (!isNaN(startDateFromXml)) {
                                log.debug("Here we are  getting start date")
        
                                if (FindMeterIdExist[0].status == "running") {
                                    log.debug("currently event is running status : ", FindMeterIdExist[0].status);
        
                                    let currentTime = (new Date()).getTime();
                                    let eventEndTime = (new Date(req.body.EndDate)).getTime();
        
                                    /--Here we check weather current time is greater then comming event end time if yes then we reset temperature--/
                                    if (currentTime >= eventEndTime) {
                                        /--Here we search meterId exist or not in DispatchEventDetail document--/
                                        let dispatchDetails = await DispatchEventDetail.findOne({ event_name: req.body.MeterId, reset_done: false })
                                        if (dispatchDetails != null && Object.keys(dispatchDetails).length > 0) {
                                            log.debug("reset process is started")
                                            resetDispatchProcess(dispatchDetails)
    
                                            await cpowerMockModel.findByIdAndUpdate(
                                                { _id: FindMeterIdExist[0]._id },
                                                {
                                                    endDate: req.body.EndDate,
                                                    updatedAt: Date.now()
                                                })
    
                                        } else {
                                            log.debug("None of dispatchEventFound which is currently running")
                                        }
                                    } else {
                                        log.debug("Current time is not greater then event end time")
                                        await cpowerMockModel.findByIdAndUpdate(
                                            { _id: FindMeterIdExist[0]._id },
                                            {
                                                endDate: req.body.EndDate,
                                                updatedAt: Date.now()
                                            })
                                    }
        
                                } else {
        
                                    if (FindMeterIdExist[0].status == "pending") {
                                        log.debug("currently event is pending status : ", FindMeterIdExist[0].status)
                                        if (req.body.StartDate == req.body.EndDate) {
                                            /--Here we cancle event because xml startDate and endDate are equal--/
                                            cancleEvent(FindMeterIdExist[0])
                                        } else {
                                            let xmlEndTime = (new Date(req.body.EndDate)).getTime();
                                            let databaseStartTime = (new Date(FindMeterIdExist[0].startDate)).getTime();
                                            log.debug("xmlEndTime : ", xmlEndTime, "databaseStartTime : ", databaseStartTime);
        
                                            /--Here we cancle event because existing event startDate is greate than comming xml data event EndDate--/
                                            if (databaseStartTime >= xmlEndTime) {
                                                cancleEvent(FindMeterIdExist[0])
                                            } else {
                                                /--Here we cancle existing event--/
                                                log.debug("Event is deleted")
                                                cancleEvent(FindMeterIdExist[0]);
        
                                                /--Here we create new fresh entry as per the diagram given --/
                                                let createNewEntry = await cpowerMockModel.create({
                                                    xmlObj: xml,
                                                    meterId: req.body.MeterId,
                                                    eventId: req.body.EventId,
                                                    scheduleTime: req.body.ScheduleTime,
                                                    endDate: req.body.EndDate,
                                                    startDate: req.body.StartDate,
                                                    createdAt: Date.now()
                                                });
                                                log.debug("New event is created", createNewEntry)
                                            }
                                        }
                                    } else {
                                        log.debug("Event is already done status : ", FindMeterIdExist[0].status)
                                    }
                                }
                            } else {
                                /--logic for if the start date is not present--/
                                log.debug("Here we not getting any start date");
        
                                /--Here we check MeterId Exist and status is running--/
                                let checkMeterIdExistAndRunning = await cpowerMockModel.find({ meterId: req.body.MeterId, status: "running" });
        
                                if (checkMeterIdExistAndRunning.length > 0) {
                                    let currentTime = (new Date()).getTime();
                                    let eventEndTime = (new Date(req.body.EndDate)).getTime();
        
                                    /--Here we check weather current time is greater then comming event end time if yes then we reset temperature--/
                                    if (currentTime >= eventEndTime) {
                                        /--Here we search meterId exist or not in DispatchEventDetail document--/
                                        let dispatchDetails = await DispatchEventDetail.findOne({ event_name: req.body.MeterId, reset_done: false })
                                        if (dispatchDetails != null && Object.keys(dispatchDetails).length > 0) {
                                            resetDispatchProcess(dispatchDetails)
    
                                            await cpowerMockModel.findByIdAndUpdate(
                                                { _id: FindMeterIdExist[0]._id },
                                                {
                                                    endDate: req.body.EndDate,
                                                    updatedAt: Date.now()
                                                })
    
                                        } else {
                                            log.debug("None of dispatchEventFound which is currently running")
                                        }
                                    } else {
                                        /--Here we upadte end --/
                                        await cpowerMockModel.findByIdAndUpdate(
                                            { _id: FindMeterIdExist[0]._id },
                                            {
                                                endDate: req.body.EndDate,
                                                updatedAt: Date.now()
                                            })
                                    }
        
                                } else {
                                    log.debug("checkMeterIdExistAndNotRunning cancle event")
                                    cancleEvent(FindMeterIdExist[0])
                                }
                            }
                        } else {
                            /--Here we create new fresh entry because neither MeterId nor EventId exist --/
                            let createNewEntry = await cpowerMockModel.create({
                                xmlObj: xml,
                                meterId: req.body.MeterId,
                                eventId: req.body.EventId,
                                scheduleTime: req.body.ScheduleTime,
                                endDate: req.body.EndDate,
                                startDate: req.body.StartDate,
                                createdAt: Date.now()
                            });
        
                            log.debug(createNewEntry, "createNewEntry")
                        }
        
                    }
                }else{
                    log.debug("No xml data found")
                }
    
    
                /--If we get xml data then here we send post request to Cpower--/
                if (xml) {
                    /--Here we call acknowledgement-Cpower Api--/
                    let callOptions = {
                        url: "http://localhost:30005/zomecloud/api/v1/acknowledgement-Cpower",
                        method: 'POST',
                        body: req.body
                    }
                    rest.call(
                        null,
                        callOptions,
                        async (err, response, body) => {
                            log.debug("=================================================");
                            log.debug("Error", err);
                            log.debug("=================================================");
                        });
                } else {
                    /--If there is no xml data then we just log in terminal--/
                    log.debug("Not found XML from Cpower")
                }
    
                return res.status(200).json({ msg: "Cpower Mock Server", xml: xml });
    
            }

                    } catch (error) {
            log.debug(error);
        }
    },
    acknowledgementToCpower: async (req, res, next) => {
        try {

            // log.debug(req.body.MeterId,req.body.EventId)
            axios.get('https://ZomeLink_Stage:878tk32W!@link-stg.cpowercorp.com/vlinkservice.svc/authenticate')
                .then(function (response) {
                    // handle success
                    var jsonXML = JSON.parse(parser.toJson(response.data));
                    let session_id = jsonXML.Auth.ID;

                    /--if we get session_id then if statement will execute else, else statement will execute--/
                    if(session_id){

                        /--here is acknowledgement xml string format containing EventId as well as MeterId--/
                        const xmlData = `<AckEventRequest xmlns="http://schemas.datacontract.org/2004/07/VLinkService.Services.vLinkService" xmlns:i="http://www.w3.org/2001/XMLSchema-instance"><EventId>${req.body.EventId}</EventId><MeterId>${req.body.MeterId}</MeterId></AckEventRequest>`;

                        /--Here is post url to send Cpower--/
                        const url = `https://link-stg.cpowercorp.com/vlinkservice.svc/${session_id}/AcknowledgeEvent`;
                        
                        /--Here we use Axios to send post request--/
                        axios.post(url, xmlData, {
                          headers: {
                            'Content-Type': 'application/xml',
                          },
                        })
                        .then((response) => {
                          console.log(`status: ${response.status}`);
                          console.log(response.data);
                        })
                        .catch((error) => {
                          console.error(error);
                        });

                    }else{
                        log.debug("Cannot get session id")
                        return res.status(200).send("Session Id not found");
                    }

                })
                .catch(function (error) {
                    // handle error
                    log.debug(error);
                })
                
                return res.status(200).send("Successfuly send acknowledgementToCpower");
            } catch (error) {
            log.debug(error);
            return res.status(400).json(error.message);
        }
    },
};


let staticXML = `
<DispatchEventResult xmlns="http://schemas.datacontract.org/2004/07/VLinkService.Services.vLinkService" xmlns:i="http://www.w3.org/2001/XMLSchema-instance">
<DispatchEventList>
<DispatchEvent>
<DemandEventSourceType>1</DemandEventSourceType>
<EndDate>Wed February 09, 2022 13:15</EndDate>
<EventId>2430</EventId>
<FacilityName>Kent State University Power Plant</FacilityName>
<IsInternalTestEvent>0</IsInternalTestEvent>
<IsTestEvent>0</IsTestEvent>
<IsoId>1</IsoId>
<IsoName>PJM</IsoName>
<MeterId>1634793</MeterId>
<MeterName>cpc.a7810.001EC6011082.1</MeterName>
<ProductTypeId>162</ProductTypeId>
<ProductTypeName>Peak Demand Management - PJM</ProductTypeName>
<ProgramName>Fast Demand Response</ProgramName>
<ResourceId/>
<StartDate>Wed February 09, 2022 13:10</StartDate>
<ZoneId>2011</ZoneId>
<ZoneName>PJM PDM Zone</ZoneName>
</DispatchEvent>
</DispatchEventList>
<ErrorCode>000</ErrorCode>
</DispatchEventResult>`;