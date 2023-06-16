var log = require("zome-server").logger.log;
const zomeserver = require('zome-server');
const path = require('path');
var log = require('zome-server').logger.log;
var rest = require('zome-server').rest;
var errLib = require('zome-server').error;
var responseLib = require('zome-server').resp;
var protocol = process.env.PROTOCOL || 'http';
var serviceHost = process.env.SERVICE_HOST || 'localhost';
var msConfig = require('zome-config').microservices;
var mongoose = require('zome-server').mongoose;
const nodemailer = require("nodemailer");
// var gatewayStatus = require('../utils/gateway.status');
const IRC = require('irc-framework');
const Property = require('mongo-dbmanager').propertymodel;
var { isConnected } = require("./../utils/checkConnection")
const JWT_SECRET = process.env.JWT_SECRET;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const building = require("mongo-dbmanager/schema/building");
const User = require('mongo-dbmanager').usermodel;
const Device = require('mongo-dbmanager').devicemodel;
const Gateway = require('mongo-dbmanager').gatewaymodel;
const Building = require('mongo-dbmanager').buildingmodel;
const DispatchEventDetail = require('mongo-dbmanager').dispatchEventDetailModel;
const HistoryLog = require('mongo-dbmanager').historyLogmodel;
const Config = require('mongo-dbmanager').configmodel;
const Apartment = require('mongo-dbmanager').apartmentModel;
const vacancyMode = require('mongo-dbmanager').vacancyModeModel;
const crypto = require("crypto");
const ScheduleTask = require('node-cron');
const moment = require('moment-timezone');

const generateIRCRequestId = () => {
    const randomString = crypto
        .createHash("sha256")
        .update(new Date().getTime().toString())
        .digest("hex");
    const finalHash = randomString.substr(0, 32);
    return finalHash;
};

//the below schedular run every one minutes
ScheduleTask.schedule('*/1 * * * *', async () => {
    const gatways = await Gateway.find({}, { country: 1, city_state: 1, gateway_uuid: 1 })

    // Here we go through one by one gateways
    for (let i = 0; i < gatways.length; i++) {

        // Here we take country/city_state from every gateway and make string literal.
        const country_stateCity = `${gatways[i].country}/${gatways[i].city_state}`

        log.debug(country_stateCity,"country_stateCity")
        async function checkIs2AM(location) {

            // Here we use moment library to know the localtime of any country
            const timezoneId = moment.tz.zone(location)?.name;

            // If we are unable to get localtime of any counrty then we simply return it.
            if (!timezoneId) {
                console.log(`Could not find timezone information for ${location}`);
                return;
            }

            // Here we get localtime of country
            const currentTime = moment().tz(timezoneId);

            // Here we get 2 AM localtime of given country
            const twoAM = currentTime.clone().startOf('day').add(2, 'hours')

            // Here we add 2 AM plus one minutes in localtime
            const twoAmPlusOne = currentTime.clone().startOf('day').add(2, 'hours').add(1, 'minute');

            // Here we check current time of given country lies between 2 AM and 2 Am plus one if yes then fire command of specific gateways
            if (currentTime.isAfter(twoAM) && currentTime.isBefore(twoAmPlusOne)) {

                // Here we gate all devices associated with gateways
                const data = await Device.find({ gateway_id: gatways[i].gateway_uuid })

                // Here we go through one by one devices
                for (let i = 0; i < data.length; i++) {
                    // the below line ping every devices 
                    let jobId = mongoose.Types.ObjectId();
                    let reqId = generateIRCRequestId();
                    var callOptions = {
                        url: `http://localhost:30004/queues/add-job`,
                        method: 'POST',
                        body: {
                            queueId: `${data[i].gateway_id}` + "-sender",
                            jobName: "test-zomekit-sender",
                            jobPayload: {
                                jobId,
                                reqId: reqId,
                                type: "api",
                                value: {
                                    url: `http://localhost:30008/zomecloud/api/v1/command-to-gateway/${data[i].gateway_id}/${data[i].device_info.DeviceName == "Thermostat device"?"5006":"5014"}?deviceID=${data[i].device_id}`,
                                    method: 'POST',
                                    body: {}
                                }
                            }
                        }
                    }

                    queueObj = {
                        jobId: jobId,
                        request: {
                            ...callOptions.body.jobPayload.value,
                            createdAt: new Date()
                        }
                    }
                    queue = new Queue(queueObj);
                    await queue.save();

                    rest.call(
                        null,
                        callOptions,
                        async (err, response, body) => {
                            try {
                                log.debug("REST call returned from " + msConfig.services.zomeGatewayAgent.name + " service");
                                // here we check weather we gate response or not if not it's consider as disconnected
                                if (response != undefined && response.statusCode == 200) {
                                    // Here we check device is Thermostat or Smartswitch
                                    if (data[i].device_info.DeviceName == "Thermostat device") {
                                        // Here we check Thermostat mode On of Off
                                        if (data[i].device_info['Thermostat mode'] == "Off") {

                                            // If thermostat mode is Off then we fire commands to cool mode
                                            // Here we take mode = 3 which is Cool mode 
                                            // OFF : 1,
                                            // HEAT: 2,
                                            // COOL: 3,
                                            // AUTO: 4,
                                            let mode = 3;
                                            let jobId = mongoose.Types.ObjectId();
                                            let reqId = generateIRCRequestId();
                                            var callOptions = {
                                                url: `http://localhost:30004/queues/add-job`,
                                                method: 'POST',
                                                body: {
                                                    queueId: data[i].gateway_id + "-sender",
                                                    jobName: "test-zomekit-sender",
                                                    jobPayload: {
                                                        jobId: jobId,
                                                        reqId: reqId,
                                                        type: "api",
                                                        value: {
                                                            url: `http://localhost:30008/zomecloud/api/v1/command-to-gateway/${data[i].gateway_id}/5004?deviceID=${data[i].device_id}&command=71005&param1=${mode}`, // `${zomeKitConnectorUrl}/${setpointEndPoint}`,
                                                            method: 'POST',
                                                            body: {}
                                                        }
                                                    }
                                                }
                                            }

                                            queueObj = {
                                                jobId: jobId,
                                                request: {
                                                    ...callOptions.body.jobPayload.value,
                                                    createdAt: new Date()
                                                }
                                            }
                                            queue = new Queue(queueObj);
                                            await queue.save();

                                            rest.call(
                                                null,
                                                callOptions,
                                                async (err, response, body) => {

                                                    try {
                                                        if (response != undefined && response.statusCode == 200) {

                                                            // Here we again fire mode to Off to set as previous state
                                                            let mode = 1;
                                                            let jobId = mongoose.Types.ObjectId();
                                                            let reqId = generateIRCRequestId();
                                                            var callOptions = {
                                                                url: `http://localhost:30004/queues/add-job`,
                                                                method: 'POST',
                                                                body: {
                                                                    queueId: data[i].gateway_id + "-sender",
                                                                    jobName: "test-zomekit-sender",
                                                                    jobPayload: {
                                                                        jobId: jobId,
                                                                        reqId: reqId,
                                                                        type: "api",
                                                                        value: {
                                                                            url: `http://localhost:30008/zomecloud/api/v1/command-to-gateway/${data[i].gateway_id}/5004?deviceID=${data[i].device_id}&command=71005&param1=${mode}`,
                                                                            method: 'POST',
                                                                            body: {}
                                                                        }
                                                                    }
                                                                }
                                                            }

                                                            queueObj = {
                                                                jobId: jobId,
                                                                request: {
                                                                    ...callOptions.body.jobPayload.value,
                                                                    createdAt: new Date()
                                                                }
                                                            }
                                                            queue = new Queue(queueObj);
                                                            await queue.save();

                                                            rest.call(
                                                                null,
                                                                callOptions,
                                                                async (err, response, body) => {

                                                                    try {
                                                                        if (response != undefined && response.statusCode == 200) {
                                                                            // if statusCode is 200 mean device tstate mode off and device status should be off
                                                                            await Device.findOneAndUpdate({ device_id: data[i].device_id }, { status: "Off" })
                                                                            log.debug("Status is....","Off")
                                                                        }
                                                                    } catch (error) {
                                                                        log.debug(error)
                                                                        // if statusCode is not 200 means command is failure then device status should be disconnected
                                                                        await Device.findOneAndUpdate({ device_id: data[i].device_id }, { status: "disconnected" })
                                                                        log.debug("Status is....","disconnected")
                                                                    }

                                                                })
                                                        }
                                                    } catch (error) {
                                                        log.debug(error)
                                                        // if statusCode is not 200 means command is failure then device status should be disconnected
                                                        await Device.findOneAndUpdate({ device_id: data[i].device_id }, { status: "disconnected" })
                                                        log.debug("Status is....","disconnected")
                                                    }

                                                });

                                        } else {

                                            //there are only two type heating and cooling if it's colling then type = 1 if not then it will be consider as Type 0 for heating
                                            let typeM = 1;
                                            if (data[i].device_info['Thermostat setpoint type'] == 'Cooling') {
                                                typeM = 1;
                                            } else {
                                                typeM = 0
                                            }

                                            //there are only two units Celsius and Fahrenheit if it's Celsius then unit = 0 if not then it will be consider as unit = 1 for Fahrenheit
                                            let unit = 1;
                                            if (data[i].device_info['Thermostat setpoint unit'] == 'Celsius') {
                                                unit = 0;
                                            } else {
                                                unit = 1
                                            }

                                            let temp = Number(data[i].device_info['Thermostat setpoint temp']) + 1;
                                            let jobId = mongoose.Types.ObjectId();
                                            let reqId = generateIRCRequestId();
                                            var callOptions = {
                                                url: `http://localhost:30004/queues/add-job`,
                                                method: 'POST',
                                                body: {
                                                    queueId: data[i].gateway_id + "-sender",
                                                    jobName: "test-zomekit-sender",
                                                    jobPayload: {
                                                        jobId: jobId,
                                                        reqId: reqId,
                                                        type: "api",
                                                        value: {
                                                            url: `http://localhost:30008/zomecloud/api/v1/command-to-gateway/${data[i].gateway_id}/5004?deviceID=${data[i].device_id}&command=71006&type=${typeM}&unit=${unit}&value=${temp}`,
                                                            method: "POST",
                                                            body: {},
                                                        }
                                                    }
                                                }
                                            };

                                            queueObj = {
                                                jobId: jobId,
                                                request: {
                                                    ...callOptions.body.jobPayload.value,
                                                    createdAt: new Date()
                                                }
                                            }
                                            queue = new Queue(queueObj);
                                            await queue.save();

                                            rest.call(null, callOptions, async (err, response, body) => {

                                                try {
                                                    log.debug(
                                                        "REST call returned from " +
                                                        msConfig.services.zomeGatewayAgent.name +
                                                        " service"
                                                    );
                                                    // if statusCode is 200 means temperature change successfully and we again change temperature as it is.
                                                    if (response != undefined && response.statusCode == 200) {
                                                        let jobId = mongoose.Types.ObjectId();
                                                        let reqId = generateIRCRequestId();
                                                        var callOptions = {
                                                            url: `http://localhost:30004/queues/add-job`,
                                                            method: 'POST',
                                                            body: {
                                                                queueId: data[i].gateway_id + "-sender",
                                                                jobName: "test-zomekit-sender",
                                                                jobPayload: {
                                                                    jobId: jobId,
                                                                    reqId: reqId,
                                                                    type: "api",
                                                                    value: {
                                                                        url: `http://localhost:30008/zomecloud/api/v1/command-to-gateway/${data[i].gateway_id}/5004?deviceID=${data[i].device_id}&command=71006&type=${typeM}&unit=${unit}&value=${temp - 1}`,
                                                                        method: "POST",
                                                                        body: {},
                                                                    }
                                                                }
                                                            }
                                                        };

                                                        queueObj = {
                                                            jobId: jobId,
                                                            request: {
                                                                ...callOptions.body.jobPayload.value,
                                                                createdAt: new Date()
                                                            }
                                                        }
                                                        queue = new Queue(queueObj);
                                                        await queue.save();

                                                        rest.call(null, callOptions, async (err, response, body) => {

                                                            try {
                                                                log.debug(
                                                                    "REST call returned from " +
                                                                    msConfig.services.zomeGatewayAgent.name +
                                                                    " service"
                                                                );

                                                                // if statusCode is 200 means temperature change successfully 
                                                                if (response != undefined && response.statusCode == 200) {
                                                                    await Device.findOneAndUpdate({ device_id: data[i].device_id }, { status: "On" })
                                                                    log.debug("Status is....","On")
                                                                }
                                                            } catch (error) {
                                                                log.debug(error)
                                                                // if statusCode is not 200 means command is failure then device status should be disconnected
                                                                await Device.findOneAndUpdate({ device_id: data[i].device_id }, { status: "disconnected" })
                                                                log.debug("Status is....","disconnected")
                                                            }
                                                        })


                                                    }
                                                } catch (error) {
                                                    log.debug(error)
                                                    // if statusCode is not 200 means command is failure then device status should be disconnected
                                                    await Device.findOneAndUpdate({ device_id: data[i].device_id }, { status: "disconnected" })
                                                    log.debug("Status is....","disconnected")
                                                }

                                            });
                                        }

                                    } else if (data[i].device_info.DeviceName == "Smart switch") {
                                        // Here we check power state is On or Off
                                        if (data[i].device_info['Power State'] == "Off") {

                                            // if power state is Off then we turn it On State = 1
                                            let State = 1;
                                            let jobId = mongoose.Types.ObjectId();
                                            let reqId = generateIRCRequestId();
                                            var callOptions = {
                                                url: `http://localhost:30004/queues/add-job`,
                                                method: 'POST',
                                                body: {
                                                    queueId: `${data[i].gateway_id}` + "-sender",
                                                    jobName: "test-zomekit-sender",
                                                    jobPayload: {
                                                        jobId,
                                                        reqId: reqId,
                                                        type: "api",
                                                        value: {
                                                            url: `http://localhost:30008/zomecloud/api/v1/command-to-gateway/${data[i].gateway_id}/5004?command=71000&param1=${State}&deviceID=${data[i].device_id}`,
                                                            method: 'POST',
                                                            body: {}
                                                        }
                                                    }
                                                }
                                            }

                                            queueObj = {
                                                jobId: jobId,
                                                request: {
                                                    ...callOptions.body.jobPayload.value,
                                                    createdAt: new Date()
                                                }
                                            }
                                            queue = new Queue(queueObj);
                                            await queue.save();

                                            rest.call(
                                                null,
                                                callOptions,
                                                async (err, response, body) => {

                                                    try {
                                                        log.debug("REST call returned from " + msConfig.services.zomeGatewayAgent.name + " service");

                                                        if (response != undefined && response.statusCode == 200) {
                                                            // we again turn it Off as previous State = 0
                                                            let State = 0
                                                            let jobId = mongoose.Types.ObjectId();
                                                            let reqId = generateIRCRequestId();
                                                            var callOptions = {
                                                                url: `http://localhost:30004/queues/add-job`,
                                                                method: 'POST',
                                                                body: {
                                                                    queueId: `${data[i].gateway_id}` + "-sender",
                                                                    jobName: "test-zomekit-sender",
                                                                    jobPayload: {
                                                                        jobId,
                                                                        reqId: reqId,
                                                                        type: "api",
                                                                        value: {
                                                                            url: `http://localhost:30008/zomecloud/api/v1/command-to-gateway/${data[i].gateway_id}/5004?command=71000&param1=${State}&deviceID=${data[i].device_id}`,
                                                                            method: 'POST',
                                                                            body: {}
                                                                        }
                                                                    }
                                                                }
                                                            }

                                                            queueObj = {
                                                                jobId: jobId,
                                                                request: {
                                                                    ...callOptions.body.jobPayload.value,
                                                                    FcreatedAt: new Date()
                                                                }
                                                            }
                                                            queue = new Queue(queueObj);
                                                            await queue.save();

                                                            rest.call(
                                                                null,
                                                                callOptions,
                                                                async (err, response, body) => {

                                                                    try {
                                                                        log.debug("REST call returned from " + msConfig.services.zomeGatewayAgent.name + " service");

                                                                        if (response != undefined && response.statusCode == 200) {
                                                                            // if statusCode is 200 mean temperature is changed successfully then device status is on
                                                                            await Device.findOneAndUpdate({ device_id: data[i].device_id }, { status: "Off" })
                                                                            log.debug("Status is....","Off")
                                                                        }
                                                                    } catch (error) {
                                                                        log.debug(error)
                                                                        // if statusCode is not 200 means command is failure then device status should be disconnected
                                                                        await Device.findOneAndUpdate({ device_id: data[i].device_id }, { status: "disconnected" })
                                                                        log.debug("Status is....","disconnected")
                                                                    }
                                                                })

                                                        }
                                                    } catch (error) {
                                                        log.debug(error)
                                                        // if statusCode is not 200 means command is failure then device status should be disconnected
                                                        await Device.findOneAndUpdate({ device_id: data[i].device_id }, { status: "disconnected" })
                                                        log.debug("Status is....","disconnected")
                                                    }

                                                });

                                        } else {
                                            // if Smartswitch is On then we turn Off State = 0
                                            let State = 0
                                            let jobId = mongoose.Types.ObjectId();
                                            let reqId = generateIRCRequestId();
                                            var callOptions = {
                                                url: `http://localhost:30004/queues/add-job`,
                                                method: 'POST',
                                                body: {
                                                    queueId: `${data[i].gateway_id}` + "-sender",
                                                    jobName: "test-zomekit-sender",
                                                    jobPayload: {
                                                        jobId,
                                                        reqId: reqId,
                                                        type: "api",
                                                        value: {
                                                            url: `http://localhost:30008/zomecloud/api/v1/command-to-gateway/${data[i].gateway_id}/5004?command=71000&param1=${State}&deviceID=${data[i].device_id}`,
                                                            method: 'POST',
                                                            body: {}
                                                        }
                                                    }
                                                }
                                            }

                                            queueObj = {
                                                jobId: jobId,
                                                request: {
                                                    ...callOptions.body.jobPayload.value,
                                                    createdAt: new Date()
                                                }
                                            }
                                            queue = new Queue(queueObj);
                                            await queue.save();

                                            rest.call(
                                                null,
                                                callOptions,
                                                async (err, response, body) => {


                                                    try {
                                                        log.debug("REST call returned from " + msConfig.services.zomeGatewayAgent.name + " service");

                                                        if (response != undefined && response.statusCode == 200) {
                                                            // we turn On smartswitch as previous State = 1
                                                            let State = 1

                                                            let jobId = mongoose.Types.ObjectId();
                                                            let reqId = generateIRCRequestId();
                                                            var callOptions = {
                                                                url: `http://localhost:30004/queues/add-job`,
                                                                method: 'POST',
                                                                body: {
                                                                    queueId: `${data[i].gateway_id}` + "-sender",
                                                                    jobName: "test-zomekit-sender",
                                                                    jobPayload: {
                                                                        jobId,
                                                                        reqId: reqId,
                                                                        type: "api",
                                                                        value: {
                                                                            url: `http://localhost:30008/zomecloud/api/v1/command-to-gateway/${data[i].gateway_id}/5004?command=71000&param1=${State}&deviceID=${data[i].device_id}`,
                                                                            method: 'POST',
                                                                            body: {}
                                                                        }
                                                                    }
                                                                }
                                                            }

                                                            queueObj = {
                                                                jobId: jobId,
                                                                request: {
                                                                    ...callOptions.body.jobPayload.value,
                                                                    createdAt: new Date()
                                                                }
                                                            }
                                                            queue = new Queue(queueObj);
                                                            await queue.save();

                                                            rest.call(
                                                                null,
                                                                callOptions,
                                                                async (err, response, body) => {

                                                                    try {
                                                                        log.debug("REST call returned from " + msConfig.services.zomeGatewayAgent.name + " service");

                                                                        if (response != undefined && response.statusCode == 200) {
                                                                            // if statusCode is 200 mean temperature is changed successfully then device status is on
                                                                            await Device.findOneAndUpdate({ device_id: data[i].device_id }, { status: "On" })
                                                                            log.debug("Status is....","On")
                                                                        }
                                                                    } catch (error) {
                                                                        // if statusCode is not 200 means command is failure then device status should be disconnected
                                                                        await Device.findOneAndUpdate({ device_id: data[i].device_id }, { status: "disconnected" })
                                                                        log.debug("Status is....","disconnected")
                                                                    }
                                                                })

                                                        }
                                                    } catch (error) {
                                                        log.debug(error)
                                                        // if statusCode is not 200 means command is failure then device status should be disconnected
                                                        await Device.findOneAndUpdate({ device_id: data[i].device_id }, { status: "disconnected" })
                                                        log.debug("Status is....","disconnected")
                                                    }

                                                });

                                        }

                                    }
                                }else{
                                    await Device.findOneAndUpdate({ device_id: data[i].device_id }, { status: "disconnected" })
                                    log.debug("Status is....","disconnected")
                                }

                            } catch (error) {
                                log.debug(error)
                                // if statusCode is not 200 means command is failure then device status should be disconnected
                                await Device.findOneAndUpdate({ device_id: data[i].device_id }, { status: "disconnected" })
                                log.debug("Status is....","disconnected")
                            }
                        });

                }
            } else {
                console.log(`It is not currently 2 AM in ${location}, current time is ${currentTime}`);
            }
        }

        // Here we call a function checkIs2AM which is responsible for fire command based on the specifice region local 2 AM.
        checkIs2AM(country_stateCity);

    }

});

// Schedule a cron job to run every 10 minutes
ScheduleTask.schedule('*/10 * * * *', () => {
    try {
        const bot = new IRC.Client();
        bot.connect({
            host: process.env.IRC_SERVER,
            port: 6667,
            nick: process.env.IRC_BOT_TEST_NICK + "_" + (Math.floor(Math.random() * 1000) + 1),
        });
        let buffers = [];
        bot.on('registered', function () {
            var channel = bot.channel('#zome-broadcast-feed');
            buffers.push(channel);

            channel.join();
            channel.say('Hi!');
            log.debug('connected to irc!');
            channel.updateUsers(async () => {
                let gatewayNameList = [];
                for (let i = 0; i < channel.users.length; i++) {
                    let gatewayName = channel.users[i].nick;

                    if (gatewayName.includes("_")) {
                        gatewayNameList.push(gatewayName.substring(0, gatewayName.lastIndexOf("_")));
                    } else {
                        gatewayNameList.push(gatewayName);
                    }

                }

                const connectionStatus3 = await isConnected();
                if (!connectionStatus3) {
                    return false;
                }
                let gateways = await Gateway.find({});
                log.debug("gatewayNameList from IRC");
                log.debug(gatewayNameList);
                log.debug("gateways from mongoDB");
                log.debug(gateways);

                /--Here we filter disconnected gateways--/
                const disconnectedGateways = gateways.filter(gateway => !gatewayNameList.includes(gateway.gateway_name));

                /--if gateways is not connected to IRC then we update gateway status to disconnect--/
                if (disconnectedGateways.length > 0) {

                    const gatewayNames = disconnectedGateways.map(gateway => gateway.gateway_name);
                    await Gateway.updateMany({ "gateway_name": gatewayNames }, { $set: { "status": "offline" } }, { new: true }, (err, doc) => {
                        if (err) {
                            log.error(`Error in updating gateway status: ${err}`);
                        } else {
                            log.debug(`Gateway status change for ${gatewayNames}`);
                            log.debug("Gateway status updated successfully");
                        }

                    })

                }

                var stream = channel.stream();
                stream.pipe(process.stdout);
                bot.quit("Quitting the IRC");
            });
        });
    } catch (error) {
        log.debug(error)
    }
});
module.exports = {
    proxyRequest: function (serviceName, url) {
        return function (req, res, next) {
            log.debug({ req: req }, "Proxy controller: forwarding the request to " + serviceName + " service " + JSON.stringify(req.headers));
            var options = {
                url: protocol + '://' + serviceHost + ':' + msConfig.services[serviceName].port + req.originalUrl,
                method: req.method,
                qs: req.query,
                followRedirect: false,
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            if (req.method.toLowerCase() === 'post' || req.method.toLowerCase() === 'put' || req.method.toLowerCase() === 'delete' || req.method.toLowerCase() === 'patch') {
                options.json = req.body;
            }

            return rest.call(
                req,
                options,
                function (err, response, body) {
                    log.debug({ req: req }, "Proxy controller: returned from " + serviceName + " service");

                    if (err) {
                        log.error({ req: req }, err);
                        return next(err);
                    }
                    if (!body) {
                        log.error({ req: req }, errLib.errorMessages.internalFailure.error.message)
                        return next(errLib.errorMessages.internalFailure);
                    }
                    var jsonBody = null;


                    try {
                        jsonBody = JSON.parse(body);
                    } catch (e) {
                        jsonBody = JSON.parse(JSON.stringify(body));
                    }

                    if (!jsonBody.status) {
                        log.error('Response is not in expected format : ' + body);
                        log.error({ req: req }, err);
                        return next(err);
                    }
                    if (jsonBody.status.toUpperCase() === 'ERROR' || jsonBody.statusCode !== 200) {
                        log.error({ req: req }, err);
                        return next(err);
                    }

                    return responseLib.handleSuccess(jsonBody.data, res);
                });
        }
    },

    isDeviceAvailable: async (req, res, next) => {
        try {
            var deviceId = req.query.deviceId;
            zomeserver.Connection("devZomePower");
            let findDevice = await Device.findOne({ device_id: deviceId }, { apartment_id: 1 })
            let deviceclone = await JSON.parse(JSON.stringify(findDevice))
            const { apartment_id } = deviceclone

            if (apartment_id == "" || apartment_id == undefined || apartment_id == null) {
                return res.status(200).send({ apartmentAssociated: false, msg: "Device Id is not associated with apartment or please try again" });
            } else {
                let apartment_name = await Apartment.find({ _id: apartment_id }, { name: 1 , ESID : 1})
                let aptName = apartment_name.map(apartmentName => apartmentName.name)
                let aptESID = apartment_name.map(apartmentesid => apartmentesid.ESID)
                return res.status(200).send({ isAvailable: true,apartment_id,aptName,aptESID,apartmentAssociated: true, msg: "Device Id is associated with any apartment." });

            }
        }
        catch (error) {
            return res.status(200).send({ isAvailable: false, msg: "Please enter valid device Id" });
        }
    },
   getMeterIdByApartmentName: async (req, res, next) => {
    try {
        zomeserver.Connection("devZomePower");
        var Apartment_name = req.params.Apartment_name;
        let findMeterNumber = await Apartment.findOne({ name: Apartment_name }, { meter_id: 1 , ESID : 1 })
        const meter_number =  findMeterNumber.meter_id;
        if (meter_number == "" || meter_number == undefined || meter_number == null) {
            return res.status(200).send({msg: "meter id is not available in the database" , flag:false});
        } else {
            return res.status(200).send({msg: "meter id is available in the database" , meter_number , flag:true});
        }
    }
    catch (error) {
        return res.status(200).send({ isAvailable: false, msg: "Please enter valid device Id" , flag:false });
    }
},


// ESID getting
getEsidByApartmentName: async (req, res, next) => {
    try {
        zomeserver.Connection("devZomePower");
        var _id = req.params.Apartment_name;
        let findESID = await Apartment.find({ _id : _id }, { ESID : 1 })

        let ESID = findESID.map(a => a.ESID)
        const esid = ESID[0];
        
        if (esid == "" || esid == undefined || esid == null) {
            return res.status(200).send({msg: "esid id is not available in the database" , flag:false});
        } else {
            return res.status(200).send({msg: "esid id is available in the database" , esid , flag:true});
        }
    }
    catch (error) {
        return res.status(500).send({ isAvailable: false, msg: "Internal server eror" , flag:false });
    }
},



getApartmentNameByMeterId: async (req, res, next) => {
    try {
        zomeserver.Connection("devZomePower");

        var meter_number = req.params.meter_id;

        let findApartmentByMeterId = await Apartment.find({ meter_id : meter_number },{name : 1});

        if (findApartmentByMeterId == "" || findApartmentByMeterId == undefined || findApartmentByMeterId == null) {
            return res.status(200).send({msg: "Apartments are not available in the database" , flag:false});
        } else {
            return res.status(200).send({msg: "Apartments are available in the database" , findApartmentByMeterId , flag:true});
        }

    }
    catch (error) {
        res.status(400).json(error);
    }
},

    getTenantUsers: async (req, res, next) => {
        try {
            const userId = req.user.userId;
            zomeserver.Connection("devZomePower");
            if(req.user.userRole === "TenantAdministratorUser"){
                let Apartment_Details = await User.findById( {_id : userId }, { apartment: 1});                               
                const clone = JSON.parse(JSON.stringify(Apartment_Details))
                let apartmentID = clone.apartment;
                console.log(clone , apartmentID,".....................details")
                 
                let Apartment_Name =  await Apartment.findById( {_id : apartmentID }, { name : 1});
                let aptName = Apartment_Name.name;
                let TenantUsers = await User.find({apartment : apartmentID},{firstName : 1, lastName:1, role : 1})
                mongoose.connection.close();
                return res.status(200).send({TenantUsers,aptName});
            }
     
        } catch (error) {
            return res.status(400).json(error.message);
        }
    },

      deleteTenantByAdmin  : async (req, res, next) => {
        try {
            zomeserver.Connection();
            let id = req.params.id;
            let userDetail = await User.findById(req.params.id);

            if(!userDetail){
                return res.status(200).send({ status: false,message:"User not found.", data:{},error:null  });
            }
            else if ( req.user.userId == req.params.id){
                const FindApartmentId = await User.find({_id : req.params.id},{apartment:1})
                const apartmentId = FindApartmentId.map(apartment=>apartment.apartment)
                const [aptId] = apartmentId
                const FindTenantUser = await User.find( {apartment : aptId });
                const tenant = FindTenantUser.filter(userRole => userRole.role != "TenantAdministratorUser" )

                if(tenant.length > 0){
                    mongoose.connection.close();
                    return res.status(200).send({ status: false,message:"Please assign a new Tenant Adminstrator.", data:{},error:null , flag : "TenantAdministratorUser" });
                }else{
                    let deviceId =  await User.findById({_id :req.user.userId },{deviceId:1});
                    const device_id = deviceId.deviceId;
                    let deleteUserFromDevice = await Device.findOneAndUpdate({ device_id: device_id }, { $pull: { users: id }}, { new: true });
                    let userRemoved = await User.findByIdAndDelete({ _id: req.user.userId });
                    mongoose.connection.close();
                    return res.status(200).send({ status: true, message: "User removed successfully!", data: {}, error: null , flag : "RemoveApartmentAssociation" });
                }
            }    
            else if (userDetail) {
                let deviceId =  await User.findById({_id : id },{deviceId:1});
                const device_id = deviceId.deviceId;
                let deleteUserFromDevice = await Device.findOneAndUpdate({ device_id: device_id }, { $pull: { users: id }}, { new: true });
                let userRemoved = await User.deleteOne({ _id: id });
                mongoose.connection.close();
                return res.status(200).send({ status: true, message: "User removed successfully!", data: {}, error: null });
            } 
            else {
                mongoose.connection.close();
                return res.status(200).send({ status: false, message: "User not found!", data: {}, error: null });
            }
        } catch (error) {
            mongoose.connection.close();
            return res.status(200).send({ status: false, message: "Something went wrong!", data: {}, error: null });
        }
    },
    
    
      tenantToAdmin  : async (req, res, next) => {
        try {
            zomeserver.Connection();
            let tenant_id = req.params.newTenantAdmin;
            let userDetail = await User.findById(tenant_id)
             if ( req.user.userId == tenant_id){
                mongoose.connection.close();
                return res.status(200).send({ status: false,message:"you can not re-assign yourself tenantAdmin, please select a new tenant", data:{},error:null , flag : "AdministratorUser" });
            }
            else if (userDetail) {
                const updateTenantRole = await User.findOneAndUpdate({ _id: tenant_id }, { role : "TenantAdministratorUser" });
                let userRemoved = await User.deleteOne({ _id: req.user.userId });
                mongoose.connection.close();
                return res.status(200).send({ status: true, message: "User removed successfully!", data: {}, error: null , flag : "userRemoved" });
            }
            else {
                mongoose.connection.close();
                return res.status(200).send({ status: false, message: "User not found!", data: {}, error: null });
            }
        } catch (error) {
            mongoose.connection.close();
            return res.status(200).send({ status: false, message: "Something went wrong!", data: {}, error: null });
        }
    },
    vacancyModeFeature: async (req, res, next) => {
        try {
            zomeserver.Connection("devZomePower");
            let allVacantUnit = await vacancyMode.find({})
            return res.status(200).json(allVacantUnit);
        } catch (error) {
            return res.status(400).json(error.message);
        }
    },
    propertiesByState: async (req, res, next) => {
        try {
            zomeserver.Connection("devZomePower");
            var selectedState = req.params.selectedState;
            let findPropertyByState = await Property.find({ state : selectedState },{name : 1,meter_id : 1});
            if (findPropertyByState == "" || findPropertyByState == undefined || findPropertyByState == null) {
                return res.status(200).send({msg: "Apartments are not available in the database" , flag:false});
            } else {
                return res.status(200).send({msg: "Apartments are available in the database" , findPropertyByState , flag:true});
            }
        }
        catch (error) {
            res.status(400).json(error);
        }
    },
    fetchAllPropertyDetails: async (req, res, next) => {

        // here if connection is not established then it will return false
        const connectionStatus = await isConnected();
        if (!connectionStatus) {
            return false;
        }
        let allProperties = await Property.find({})

        // here if connection is not established then it will return false
        const connectionStatus1 = await isConnected();
        if (!connectionStatus1) {
            return false;
        }
        let allBuildings = await Building.find({})

        // here if connection is not established then it will return false
        const connectionStatus2 = await isConnected();
        if (!connectionStatus2) {
            return false;
        }
        let allGateway = await Gateway.find({})


        // here if connection is not established then it will return false
        const connectionStatus3 = await isConnected();
        if (!connectionStatus3) {
            return false;
        }
        let allDevices = await Device.find({})

        // here if connection is not established then it will return false
        const connectionStatus4 = await isConnected();
        if (!connectionStatus4) {
            return false;
        }
        let allApartments = await Apartment.find({})

        //the below line used to calculate vacant unit column
        let vacancyUnitColumn = [];

        /--here take all property--/
        for (let i = 0; i < allProperties.length; i++) {
            const propertyVal = allProperties[i]._id;
            /--here we initially take value 0 for modeOn, modeOff for vacancyMode to calculate units in Vacancy View--/
            let modeOn = 0;
            let modeOff = 0;

            /--here we find all buildings which is under particular property--/
            const buildingWithSelectedPropertyId = allBuildings.filter(buildingPropertyId => buildingPropertyId.propertyId == `${propertyVal}`);

            /--here we get all gatewayId--/
            buildingWithSelectedPropertyId.map((gatewayArr) => {
                /--the below line used to store one building gatways uuid--/
                const gatewayUUID = [];
                gatewayArr.gateways.map((gatewayId) => {

                    /--here we find Gateway--/
                    const selectedGatewayArr = allGateway.filter(selectedGateways => selectedGateways._id == `${gatewayId}`)
                    selectedGatewayArr.map((gatewayObj) => {
                        const gatewayUuid = gatewayObj.gateway_uuid;
                        // console.log(gatewayUuid,"gatewayUuid")
                        gatewayUUID.push(gatewayObj.gateway_uuid);

                    })

                })
                // console.log(gatewayUUID,'gatewayUUID....')
                let allDeviceUnderGateways = []
                let AptIdArr = []
                gatewayUUID.map((uuid) => {
                    const selectedDevices = allDevices.filter(selectedDevices => selectedDevices.gateway_id == `${uuid}`);
                    if (selectedDevices.length > 0) {
                        allDeviceUnderGateways.push(...selectedDevices)
                    } else {
                        log.debug("Gateway have no devices found...")
                    }
                })

                allDeviceUnderGateways.map((AptId) => {
                    let findAptId = AptId.apartment_id
                    if (AptId.apartment_id != undefined) {
                        AptIdArr.push(AptId.apartment_id)
                    } else {
                        log.debug(AptId.apartment_id, "Device has not AptID")
                    }
                })
                let removeDuplicateAptId = AptIdArr.filter((aptId, index) => AptIdArr.indexOf(aptId) === index)

                if (removeDuplicateAptId.length > 0) {
                    let ApartmentArray = []
                    removeDuplicateAptId.map(aptId => {
                        const selectedDevices = allApartments.filter(selectedApartment => selectedApartment._id == `${aptId}`);
                        ApartmentArray.push(...selectedDevices)
                    })

                    ApartmentArray.map((apt) => {

                        if (apt.vacancyMode == "On") {
                            modeOn++;
                        } else {
                            modeOff++;
                        }

                    })
                }
            });

            /--here we push properties object one by one which contains all the vacant units and total units in properties--/
            vacancyUnitColumn.push({
                _id: allProperties[i]._id,
                propertyName: allProperties[i].name,
                propertyAddress: allProperties[i].address,
                vacantUnits: modeOn,
                totalUnits: modeOff + modeOn
            })
        }
        return res.send(vacancyUnitColumn)
        // return responseLib.handleSuccess("jsonBody.data", res);
    },
    fetchAllDevicesByPropertyId: async (req, res, next) => {
        /-- here we take muiltiple property id from frontend when user select properties --/
        const propertiesIDS = req.body.propertiesIds

        // here if connection is not established then it will return false
        const connectionStatus = await isConnected();
        if (!connectionStatus) {
            return false;
        }
        /--here we take all Properties from database--/
        let allProperties = await Property.find({})
        console.log(allProperties, "allProperties...")

        // here if connection is not established then it will return false
        const connectionStatus1 = await isConnected();
        if (!connectionStatus1) {
            return false;
        }
        /--here we take all Building from database--/
        let allBuildings = await Building.find({})

        // here if connection is not established then it will return false
        const connectionStatus2 = await isConnected();
        if (!connectionStatus2) {
            return false;
        }
        /--here we take all Gateway from database--/
        let allGateway = await Gateway.find({})


        // here if connection is not established then it will return false
        const connectionStatus3 = await isConnected();
        if (!connectionStatus3) {
            return false;
        }
        /--here we take all Device from database--/
        let allDevices = await Device.find({})

        // here if connection is not established then it will return false
        const connectionStatus4 = await isConnected();
        if (!connectionStatus4) {
            return false;
        }
        /--here we take all Apartment from database--/
        let allApartment = await Apartment.find({});

        //log.debug("all properties :: ", allProperties.length);
        //log.debug("all Buildings :: ", allBuildings.length);
        //log.debug("all gateways :: ", allGateway.length);
        //log.debug("all devices :: ", allDevices.length);    

        /--here we take units for selected properties--/
        let unitsForProperty = [];

        /--here we take empty property array--/
        let Properties = [];
        
        /--here we store all properties which is comming from frontend selected properties id--/
        propertiesIDS.map((IDS) => {
            const selectedProperty = allProperties.filter(selectProperties => selectProperties._id == `${IDS}`)
            if (selectedProperty.length > 0) {
                Properties.push(...selectedProperty)
            } else {
                console.log("selected properties have no corresponding properties in database")
            }
        });

        /--here we go through one by one property--/
        for (let i = 0; i < Properties.length; i++) {
            const propertyGateways = [];

            /--here we find all Buildings which come under particular property--/
            let findBuildings = allBuildings.filter((gatewayId) => gatewayId.propertyId == `${Properties[i]._id}`);

            /--here we go one by one building--/
            for (let j = 0; j < findBuildings.length; j++) {

                /--here we check if the building contain gatway array or not--/  
                if (findBuildings[j].gateways != undefined || findBuildings[j].gateways.length > 0) {

                    /--here we take all gatewayId from building--/
                    findBuildings[j].gateways.map((findGatId) => {

                        /--once we gate Gateway id we find that gateway in gateway collection--/
                        let findGatway = allGateway.filter((gatewayID) => gatewayID._id == `${findGatId}`);

                        /--check wether the gatway exist or not--/
                        if (findGatway.length > 0) {
                            propertyGateways.push(...findGatway)
                        } else {
                            console.log(findGatId, "cannot find Gatway id in gatway collection")
                        }
                    })
                } else {
                    console.log("Building have no Gatways, Building name : ", findBuildings.name)
                }
            }

            /--once we gate all gateways of property we go through one by one gateway--/
            for (let k = 0; k < propertyGateways.length; k++) {

                /--here we find all devices which come under particular Gateway--/
                const GatwayDevices = allDevices.filter((findDevices) => findDevices.gateway_id == propertyGateways[k].gateway_uuid);

                /--here we find that Gatway because we need gateway name--/
                const findGatway = allGateway.filter((gatewayuuid)=> gatewayuuid.gateway_uuid == propertyGateways[k].gateway_uuid);
                
                /--here we check if the Gateway contain devices or not--/
                if (GatwayDevices.length > 0) {

                    GatwayDevices.map((device)=>{

                        /--here we check weather devices contain apartmentId or not--/
                        if(device.apartment_id != undefined){

                            /--here we find that apartment--/
                            const findApartment = allApartment.filter(findApt => findApt._id == `${device.apartment_id}`)
                            console.log(findApartment[0].vacancyMode, "DevicesAll");

                            /--here we check weather devices come under vacancyMode or not--/
                            if (findApartment[0].vacancyMode == "Off") {
                                if(device.device_info.DeviceName == "Thermostatdevice"){
                                    /--here we push all details of thermostate--/
                                    unitsForProperty.push({
                                        _id: findApartment[0]._id,
                                        propertyName: Properties[i].name,
                                        gatewayName: findGatway[0].gateway_name,
                                        AptName: findApartment[0].name,
                                        DeviceType: device.device_info.DeviceType,
                                        deviceId: device.device_info.DeviceID,
                                        currentValue: device.device_info["Thermostat setpoint temp"] != undefined ? device.device_info["Thermostat setpoint temp"] : "--",
                                        status: device.status,
                                    })
                                }else{
                                    /--here we push all details of smart Switch--/
                                    unitsForProperty.push({
                                        _id: findApartment[0]._id,
                                        propertyName: Properties[i].name,
                                        gatewayName: findGatway[0].gateway_name,
                                        AptName: findApartment[0].name,
                                        DeviceType: device.device_info.DeviceType,
                                        deviceId: device.device_info.DeviceID,
                                        currentValue: device.device_info["Power State"] != undefined ? device.device_info["Power State"] : "--",
                                        status: device.status,
                                    })
                                }
                            } else {
                                console.log("Apartment is not in Vacancy mode")
                            }
                          
                           
                        }else{
                            console.log("Apartment Id is undefined")
                        }
                    })
                } else {
                    console.log("Gatway have no devices")
                }

            }

        }

        return res.send(unitsForProperty)
    },
    deleteVacantUnit: async (req, res, next) => {
        try {
            zomeserver.Connection("devZomePower");
            /--Find device and take only apartment_id--/            
            let findDevice = await vacancyMode.findById({ _id : req.body._id },{ apartment_id : 1});

            /--Delete all Vacant view devices which is come under particular apartment--/
            let findvacantunit = await vacancyMode.deleteMany({apartment_id : findDevice.apartment_id});

            /--Here we turn off VacancyMode mean it goes to vacant units--/
            let findApartment = await Apartment.findByIdAndUpdate({_id : findDevice.apartment_id},{ vacancyMode : "Off"});

            /--Here we update All device Status to turn on which is come under particular Apartment--/
            let findAndUpdateDeviceStatus = await Device.updateMany({ apartment_id : findDevice.apartment_id } , { status : "On" })
            
            res.status(200).send(findApartment)
        }
        catch (error) {
            console.log(error)
            // res.status(400).json(error);
        }
    },
    getAllDeviceByDeviceID: async (req, res, next) => {
        try {
         /--get device by device id--/
         let deviceInfo = await Device.findOne({device_id : req.params.deviceID});

         /--here we return device from database--/
         responseLib.handleSuccess(deviceInfo , res)
        }
        catch (error) {
            log.debug(error)
            res.status(400).json(error);
        }
    },
    dropDownProperty: async (req, res, next) => {
        try {
         /--get device by device id--/
         // here if connection is not established then it will return false(Mongodb connection)
        const connectionStatus = await isConnected();
        if (!connectionStatus) {
            return false;
        }
        let allProperties = await Property.findOne({ name : req.params.property_name })

        // here if connection is not established then it will return false(Mongodb connection)
        const connectionStatus1 = await isConnected();
        if (!connectionStatus1) {
            return false;
        }
        let allBuildings = await Building.find({})

        // here if connection is not established then it will return false(Mongodb connection)
        const connectionStatus2 = await isConnected();
        if (!connectionStatus2) {
            return false;
        }
        let allGateway = await Gateway.find({})
         
        // Here we take propertyId from restuested user
         const propertyVal = allProperties._id;

        // According to propertyId here we filter buildings and take all buildings associated with property
         const buildingWithSelectedPropertyId = allBuildings.filter(buildingPropertyId => buildingPropertyId.propertyId == `${propertyVal}`);

        //  gatewayUUID store all gateways uuid's
         const gatewayUUID = [];

        //  Here go through one by one building
         buildingWithSelectedPropertyId.map((gatewayArr) => {
            // Here we go through one by one gateways which is placed inside building collection
            gatewayArr.gateways.map((gatewayId) => {

                // Here we take gateway according to gateway id we get from building collection
                const selectedGatewayArr = allGateway.filter(selectedGateways => selectedGateways._id == `${gatewayId}`)

                // Here we go through gateway to take gateway uuid
                selectedGatewayArr.map((gatewayObj) => {
                    // Here we store gateway uuid
                    gatewayUUID.push(gatewayObj.gateway_uuid);

                })

            })    
        });

        // the below variable is used to store all gateway's of property
        const findPropertyGateways = []

        // Here we go through one by one gateway's uuid to find gateway's from gateway's collection
        gatewayUUID.map((gatewayUUID) => {
            // Here we destructure gateway's
            const [ obj ] = allGateway.filter(selectedGateways => selectedGateways.gateway_uuid == `${gatewayUUID}`)
            // Now push one by one gateway's into variable to show in webapp
            findPropertyGateways.push(obj)
        })

        return res.status(200).send(findPropertyGateways)
        
        }catch (error) {
            log.debug(error)
            res.status(400).json(error);
        }
    },
    selectedGatewaysDevices: async (req, res, next) => {
        try {
            zomeserver.Connection("devZomePower");

            // Here we go through one by one gateway whatever we get from requested user
            for (let i = 0; i < req.body.selectedGateways.length; i++) {
                let jobId = mongoose.Types.ObjectId();
                var callOptions = {
                    url: `http://localhost:30004/queues/add-job`,
                    method: 'POST',
                    body: {
                        queueId: req.body.selectedGateways[i] + "-sender",
                        jobName: "test-zomekit-sender",
                        jobPayload: {
                            jobId,
                            type: "api",
                            value: {
                                url: `http://localhost:30008/zomecloud/api/v1/command-to-gateway/${req.body.selectedGateways[i]}/5003`,
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
                    });
            }

            // Here we find All devices releted gateway's
            const devices = await Device.find({gateway_id : req.body.selectedGateways, is_deleted : false})
            res.status(200).send(devices)
        }
        catch (error) {
            console.log(error)
            // res.status(400).json(error);
        }
    },
    buildingForProperties: async (req, res, next) => {
        try {
            // here if connection is not established then it will return false(Mongodb connection)
            const connectionStatus = await isConnected();
            if (!connectionStatus) {
                return false;
            }

            /--Get All Buildings from database--/
            let buildings = await Building.find({});

            /--here we return all buildings--/
            return res.status(200).send(buildings)
        }
        catch (error) {
            log.debug(error)
            res.status(400).json(error);
        }
    },
    createApartment: async (req, res, next) => {
        try {
            // here if connection is not established then it will return false(Mongodb connection)
            const connectionStatus = await isConnected();
            if (!connectionStatus) {
                return false;
            }
 
            // Here we take every field frome requested user
            const { selectedProperty, selectedBuilding, apartmentName, meterId, address, ESID } = req.body

            // Here we create new Apartment in the database
            let newApartment = await new Apartment({
                property : selectedProperty,
                building : selectedBuilding,
                name : apartmentName,
                meter_id : meterId,
                address : address,
                ESID : ESID
            })

            // Save new data in database
            const savedApartment = await newApartment.save();    
            
            // return created new user
            return res.status(200).send(savedApartment)
        }
        catch (error) {
            log.debug(error)
            res.status(400).json(error);
        }
    },
    getAllApartment: async (req, res, next) => {
        try {

            // get All Apartment
            const apartment = await Apartment.find({},{name:1})

            // return all apartment
            return res.status(200).send(apartment)
        }
        catch (error) {
            log.debug(error)
            res.status(400).json(error);
        }
    },
    createTenantUserByAdmine: async (req, res, next) => {
        try {

            const {fullName, role, deviceId, selctedState, selectedProperty, selectedApartment, firstname, lastname, phoneNumber,email, ESID, meterID, EnergyCompanyName, userName,userPassword} = req.body;

            // Here we check any fields are empty, if yes then return
            if(!fullName, !role, !deviceId, !selctedState, !selectedProperty, !selectedApartment, !firstname, !lastname, !phoneNumber,!email, !ESID, !meterID, !EnergyCompanyName, !userName,!userPassword){
                return res.status(200).json({ message: 'All fields are required!' });
            }
            
            // Here we ensure database connection established successfully
            const connectionStatus = await isConnected();
            if (!connectionStatus) {
                return false;
            }
            
            // Here we find username or email exist or not in the database
            const isUserExist = await User.findOne({
                $or: [
                    { username:  userName},
                    { email: email }
                ]
            });
            
            // If the username or email already exist then return because it's always unique
            if(isUserExist){
                console.log(isUserExist,"Come exist")
                return res.status(200).json({ message: 'user already exist with given email or username' });
            }
            
            
            // Here we find device avaible in the database have association with apartment
            let findDevice = await Device.findOne({ device_id: deviceId }, { apartment_id: 1 })

            // here we copy object
            let deviceclone = await JSON.parse(JSON.stringify(findDevice))

            // Here we destructure apartment_id, _id from object
            const { apartment_id, _id } = deviceclone
            
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(userPassword, salt);
            
            console.log("Come.....")
            // Here we check device have association with apartment or not
            if (apartment_id == "" || apartment_id == undefined || apartment_id == null) {

                // Here we find Apartment from database
                let findApartment = await Apartment.findOne({name:selectedApartment},{_id:1})       

                // If there is no association with the device, then affiliation is performed.
                await Device.findOneAndUpdate({_id : _id},{ $set: { "apartment_id":  findApartment._id}})

                // Here we create user in the database
                    const newUser = new User({
                        full_name: fullName,
                        role: role == true ? "TenantAdministratorUser" : "tenant",
                        deviceId,
                        state : selctedState,
                        property : selectedProperty,
                        apartment: findApartment._id,
                        firstName : firstname,
                        lastName : lastname,
                        phone : phoneNumber,
                        email,
                        ESID,
                        meterId : meterID,
                        energyCompanyName : EnergyCompanyName,
                        username: userName,
                        password: hash,
                    });
                    savedUser = await newUser.save();
                    // return res.status(200).json({ message: 'user created successfully' });
            }else{

                   // If there is already association with device and apartment then we create user
                     const newUser = new User({
                        full_name: fullName,
                        role: role == true ? "TenantAdministratorUser" : "tenant",
                        deviceId,
                        state : selctedState,
                        property : selectedProperty,
                        apartment: apartment_id,
                        firstName : firstname,
                        lastName : lastname,
                        phone : phoneNumber,
                        email,
                        ESID,
                        meterId : meterID,
                        energyCompanyName : EnergyCompanyName,
                        username: userName,
                        password: hash,
                    });
                    savedUser = await newUser.save();
                    // return res.status(200).json({ message: 'user created successfully' });
            }


            // Here we set smtp configuration
            let smtpconfig = {
                service: "gmail",
                auth: {
                    user: "zomeservice@gmail.com",
                    pass: "ojxtnffvyinkhzws",
                },
                secure: true, // use SSL
            }
            var transporter = nodemailer.createTransport(smtpconfig);

            // If user created successfully then se send mail to user
            if (savedUser) {
                const mailOptions = {
                    from: "zomeservice@gmail.com",
                    to: email,
                    subject: "Welcome to zome ",
                    text: `Welcome to Zome-Power.Your account has been created successfully!
                            You can now login with the registered username/email and password.`
                }
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.log(error,"error-----")
                        mongoose.connection.close();
                        res.status(401).json({ status: 401, message: "email not sent" })
                    } else {
                        console.log("Email sent", info.response);
                        mongoose.connection.close();
                        res.status(201).json({ status: 201, message: "Email sent successfully." })
                    }
                })
            }
			
			// Here we check device have main user or not
            const checkUser = await Device.findOne({device_id: deviceId}, {main_user: 1})

            // if device have not any main user then we add main user
            if(checkUser.main_user == undefined || checkUser.main_user == null){
                await Device.findOneAndUpdate({ device_id: deviceId }, { main_user: savedUser._id }, { new: true });
            } else {
                // if user have main user then we simply add created userId to device user array
                await Device.findOneAndUpdate({ device_id: deviceId }, { $push: { users: savedUser._id }}, { new: true });
            }

            mongoose.connection.close()

            // finally we send response to successfully created user
            return res.status(200).json({ message: 'user created successfully' });
        }
        catch (error) {
            log.debug(error)
            res.status(400).json(error);
        }
    },
    signUpRequest: async (req, res, next) => {
        try {
            const { firstName, lastName, phone, password, email, userName, role, selectedApartment, deviceId, energyCompanyName } = req.body;
            zomeserver.Connection(); //DB require on company name demand
            if (!firstName || !lastName || !email || !password || !phone || !userName || !role || !selectedApartment || !deviceId || !energyCompanyName) {
                return res.status(400).json({ msg: "Please enter all fields" });
            }

            var user = await User.findOne({ email: email });
            if (user) {
                return res.status(200).json({ msg: "Email already exists" });
            }
            user = await User.findOne({ username: userName });
            if (user) {
                return res.status(200).json({ msg: "Username already exists" });
            }
            // *salting a password
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password, salt);

            let findUsersByApartment = await User.find({ apartment: selectedApartment }, { role: "TenantAdministratorUser" });
            let user_role = findUsersByApartment.map(role => role.role);
            let savedUser;
            let fullName = firstName + " " + lastName;
            if (user_role[0] == "TenantAdministratorUser") {
                const newUser = new User({
                    apartment: selectedApartment,
                    firstName,
                    full_name: fullName,
                    lastName,
                    username: userName,
                    email,
                    role: "tenant",
                    phone,
                    password: hash,
                    deviceId,
                    energyCompanyName
                });
                savedUser = await newUser.save();
            } else {
                const newUser = new User({
                    apartment: selectedApartment,
                    firstName,
                    full_name: fullName,
                    lastName,
                    username: userName,
                    email,
                    role,
                    phone,
                    password: hash,
                    deviceId,
                    energyCompanyName
                });
                savedUser = await newUser.save();
            }
            //const savedUser = await newUser.save();
             //send user creation mail to the email used during user creation 

             let smtpconfig = {
                service: "gmail",
                auth: {
                    user: "zomeservice@gmail.com",
                    pass: "ojxtnffvyinkhzws",
                },
                secure: true, // use SSL
            }
            var transporter = nodemailer.createTransport(smtpconfig);
            if (savedUser) {
                const mailOptions = {
                    from: "zomeservice@gmail.com",
                    to: email,
                    subject: "Welcome to zome ",
                    text: `Welcome to Zome-Power.Your account has been created successfully!
                            You can now login with the registered username/email and password.`
                }
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.log(error,"error-----")
                        mongoose.connection.close();
                        res.status(401).json({ status: 401, message: "email not sent" })
                    } else {
                        console.log("Email sent", info.response);
                        mongoose.connection.close();
                        res.status(201).json({ status: 201, message: "Email sent successfully." })
                    }
                })
            }
			
			
            console.log(savedUser,"user...created....");
            const checkUser = await Device.findOne({device_id: deviceId}, {main_user: 1})
            if(checkUser.main_user == undefined || checkUser.main_user == null){
                await Device.findOneAndUpdate({ device_id: deviceId }, { main_user: savedUser._id }, { new: true });
            } else {
                await Device.findOneAndUpdate({ device_id: deviceId }, { $push: { users: savedUser._id }}, { new: true });
            }
                const token = jwt.sign({
                userId: savedUser._id,
                email: savedUser.email,
                userRole: savedUser.role
            }, JWT_SECRET, {});
            mongoose.connection.close()
            return res.status(200).json({ token, apartment:savedUser.apartment, firstName:savedUser.firstName , lastName:savedUser.lastName,username: savedUser.username, email: savedUser.email, role: savedUser.role ,msg:"User has been created"});
        } catch (error) {
            res.status(400).json(error.message);
        }
    },
    addBulkUser: async (req, res, next) => {
        try {
                const csv = require('csvtojson')
                const csvFilePath = req.file.path
                const userJsonData = await csv().fromFile(csvFilePath);
                let errorMessages = [];
                zomeserver.Connection(); //DB require on company name demand
                for (let i = 0; i < userJsonData.length; i++) {
                    const user = userJsonData[i];
                    const { firstName, lastName, phone, username, email, password, device_id, role, property_id, building_id, apartment, energyCompanyName } = user;

                    if (role == "building-owner") {
                        if (!building_id) {
                            errorMessages.push(`Record no. ${i + 2} : Building Id is required`);
                            continue;
                        }
                    }
                    if (role == "site-owner") {
                        if (!property_id || !building_id) {
                            errorMessages.push(`Record no. ${i + 2} : Property and Building Id is required`);
                            continue;
                        }
                    }
                    if (role == "TENANT" || role == "tenant") {
                        if (!device_id) {
                            errorMessages.push(`Record no. ${i + 2} : Device Id is required`);
                            continue;
                        }
                    }

                    if (!firstName || !lastName || !email || !phone) {
                        errorMessages.push(`Record no. ${i + 2} : Please enter all fields`);
                        continue;
                    }

                    var userEmail = await User.findOne({ email: email });
                    if (userEmail) {
                        errorMessages.push(`Email already exists at record ${i + 2}`);
                        continue;
                    }

                    // if there is username then and then we query in database
                    if(username){
                        var userName = await User.findOne({ username: username });
                        if (userName) {
                            errorMessages.push(`Username already exists at record ${i + 2}`);
                            continue;
                        }
                    }

                    // if there is password then and then we allowed to store password
                    if(password){
                        // *salting a password
                        const salt = await bcrypt.genSalt(10);
                        var hash = await bcrypt.hash(password, salt);
                    }

                    let building = building_id ? [building_id] :  [];
                    let properties = property_id ? [property_id] : [];

                    const newUser = new User({
                        username : username ? username : "",
                        firstName,
                        lastName,
                        email,
                        phone: phone,
                        buildings: building,
                        properties: properties,
                        password: password ? hash : "",
                        role: role,
                        energyCompanyName: energyCompanyName,
                        apartment: apartment,
                    });
                    const savedUser = await newUser.save();

                    console.log(savedUser)

                    if (role == "TENANT" || role == "tenant") {
                        const checkUser = await Device.findOne({device_id: device_id}, {main_user: 1})
                        if(checkUser.main_user == undefined || checkUser.main_user == null){
                            await Device.findOneAndUpdate({ device_id: device_id }, { main_user: savedUser._id }, { new: true });
                        } else {
                            await Device.findOneAndUpdate({ device_id: device_id }, { $push: { users: savedUser._id }}, { new: true });
                        }
                        await Device.findOneAndUpdate({device_id:device_id},{apartment_id:apartment})
                    }
                }
                mongoose.connection.close()
                if (errorMessages.length > 0) {
                    return res.status(200).json({ errorMessages });
                } else {
                    return res.status(200).json({ msg: "User added successfully" });
                }
        } catch (error) {
            res.status(400).json(error.message);
        }
    },

    addSingleUser: async (req, res, next) => {
        try {
            zomeserver.Connection(); //DB require on company name demand

            const { full_name, username, email, password, device_id, role, property_id, building_id } = req.body;
            const isemail =  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            // if (!building_id) {
            //         if (role == "Property Manager" || role == "property-manager" || role == "property manager"   ) {
            //         return res.status(200).json({ msg: "Building Id is required" });
            //     }
            // }
            if (role == "site-owner") {
                if (!property_id || !building_id) {
                    return res.status(200).json({ msg: "Property and Building Id is required" });
                }
            }
            if (role == "TENANT" || role == "tenant") {
                if (!device_id) {
                    return res.status(200).json({ msg: "Device Id is required" });
                }
            }
            if (!full_name || !username || !email || !password) {
                return res.status(200).json({ msg: "Please enter all fields" });
            }

            var user = await User.findOne({ email: email });
            if (user) {
                return res.status(200).json({ msg: "Email already exists" });
            }
            user = await User.findOne({ username: username });
            if (user) {
                return res.status(200).json({ msg: "Username already exists" });
            }
            if (!isemail.test(email)) {
                return res.status(200).json({ msg: "Please enter valid email address" });
            } 
            if(property_id == "" || property_id == null || property_id == undefined){
                return res.status(200).json({ msg: "Please select a property" });
            }

            // *salting a password
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password, salt);

            let buildings = [];
            let properties = [];

            buildings.push(building_id);
            properties.push(property_id);

            let savedUser = {};
            if (buildings == "" || buildings == null || buildings == undefined) {

                let buildingfilter = {}
                buildingfilter['propertyId'] = { $in: properties }
                buildingList = await Building.find(buildingfilter);

                if (req.user.userRole === "support") {
                    savedUser = await User.create({
                        username,
                        full_name,
                        email,
                        buildings: buildingList,
                        properties,
                        password: hash,
                        role: role
                    }).catch(err => {
                        return res.status(400).json(err.message);
                    });
                } else {
                    savedUser = await User.create({
                        username,
                        full_name,
                        email,
                        // buildings,
                        properties,
                        password: hash,
                        role: role
                    }).catch(err => {
                        return res.status(400).json(err.message);
                    });
                }
            }
            else {
                savedUser = await User.create({
                    username,
                    full_name,
                    email,
                    buildings,
                    properties,
                    password: hash,
                    role: role
                }).catch(err => {
                    return res.status(400).json(err.message);
                });
            }
            if (role == "TENANT" || role == "tenant" || req.user.userRole == "TenantAdministratorUser") {
                const checkUser = await Device.findOne({device_id: device_id}, {main_user: 1})
                if(checkUser.main_user == undefined || checkUser.main_user == null){
                    await Device.findOneAndUpdate({ device_id: device_id }, { main_user: savedUser._id }, { new: true });
                } else {
                    await Device.findOneAndUpdate({ device_id: device_id }, { $push: { users: savedUser._id }}, { new: true });
                }
            }
            return res.status(200).json({ username: savedUser.username, email: savedUser.email, role: savedUser.role, full_name: savedUser.full_name });
            //mongoose.connection.close()
        } catch (error) {
            res.status(400).json(error.message);
        }
    },

    getUser: async (req, res, next) => {
        try {
            const userId = req.user.userId;
            zomeserver.Connection();
            const user = await User.findById(userId, { password: 0 });
            // mongoose.connection.close();
            return res.status(200).json(user);
        } catch (error) {
            return res.status(400).json(error.message);
        }
    },

    updateUser: async (req, res, next) => {
        try {

            const userId = req.user.userId;
            const { full_name, username, current_password, new_password = "", account_number, confirm_password, email } = req.body;

            zomeserver.Connection(); //DB require on company name demand
            const user = await User.findById(userId);

            log.debug(new_password, confirm_password, "newpass.................");
            if (new_password !== "") {
                const ismatch = await bcrypt.compare(current_password, user.password);
                const isContainsUppercase = /^(?=.*[A-Z]).*$/;
                const isContainsNumber = /^(?=.*[0-9]).*$/;
                const isContainsSymbol = /^(?=.*[~`!@#$%^&*()--+={}\[\]|\\:;"'<>,.?/_₹]).*$/;
                const isValidLength = /^.{3,16}$/;
                const isNonWhiteSpace = /^\S*$/;
                const isContainsLowercase = /^(?=.*[a-z]).*$/;

                if (!ismatch) {
                    return res.status(200).json({ msg: "Invalid current password" });
                } else if (!isNonWhiteSpace.test(new_password)) {
                    return res.status(200).json({ msg: "Password must not contain Whitespaces." });
                } else if (!isContainsUppercase.test(new_password)) {
                    return res.status(200).json({ msg: "Password must have at least one Uppercase Character" });
                } else if (!isContainsLowercase.test(new_password)) {
                    return res.status(200).json({ msg: "Password must have at least one Lowercase Character." });
                } else if (!isContainsNumber.test(new_password)) {
                    return res.status(200).json({ msg: "Password must contain at least one Digit." });
                } else if (!isContainsSymbol.test(new_password)) {
                    return res.status(200).json({ msg: "Password must contain at least one Special Symbol." });
                } else if (!isValidLength.test(new_password)) {
                    return res.status(200).json({ msg: "Password must be 3-16 Characters Long" });
                } else if (new_password !== confirm_password || confirm_password != new_password) {
                    return res.status(200).json({ msg: "new password and confirm password should be same" })
                }

                const salt = await bcrypt.genSalt(10);
                const hash = await bcrypt.hash(new_password, salt);

                if (username == user.username) {
                    if (email == user.email) {
                        await User.findByIdAndUpdate(userId, { password: hash, full_name: full_name || user.full_name, account_number: account_number || user.account_number }, { new: true });
                        return res.status(200).json({ msg: "User updated successfully", status: false, email: false });
                    } else {
                        const findEmail = await User.find({ email: email })

                        if (findEmail.length > 0) {
                             await User.findByIdAndUpdate(userId, { password: hash, full_name: full_name || user.full_name, account_number: account_number || user.account_number }, { new: true });
                            return res.status(200).json({ msg: "User updated successfully", status: false, email: true });
                        } else {
                            await User.findByIdAndUpdate(userId, { password: hash, full_name: full_name || user.full_name, account_number: account_number || user.account_number, email: email || user.email }, { new: true });
                            return res.status(200).json({ msg: "User updated successfully", status: false, email: false });

                        }
                    }
                } else {
                    let findUser = await User.find({ username: username })

                    if (findUser.length > 0) {
                        const findEmail = await User.find({ email: email })
                        if (findEmail.length > 0) {
                            await User.findByIdAndUpdate(userId, { password: hash, full_name: full_name || user.full_name, account_number: account_number || user.account_number }, { new: true });
                            return res.status(200).json({ msg: "User updated successfully", status: true, email: true });
                        } else {
                            await User.findByIdAndUpdate(userId, { password: hash, full_name: full_name || user.full_name, account_number: account_number || user.account_number, email: email || user.email }, { new: true });
                            return res.status(200).json({ msg: "User updated successfully", status: true, email: false });
                        }
                    } else {
                        const findEmail = await User.find({ email: email })

                        if (findEmail.length > 0) {
                            await User.findByIdAndUpdate(userId, { password: hash, full_name: full_name || user.full_name, username: username || user.username, username: username || user.username, account_number: account_number || user.account_number }, { new: true });
                            return res.status(200).json({ msg: "User updated successfully", status: false, email: true });
                        } else {
                            await User.findByIdAndUpdate(userId, { password: hash, full_name: full_name || user.full_name, username: username || user.username, email: email || user.email, account_number: account_number || user.account_number }, { new: true });
                            return res.status(200).json({ msg: "User updated successfully", status: false, email: false });
                        }
                    }
                }
            } else {

                if (username == user.username) {
                    if (email == user.email) {
                        await User.findByIdAndUpdate(userId, { full_name: full_name || user.full_name, account_number: account_number || user.account_number }, { new: true });
                        return res.status(200).json({ msg: "User updated successfully", status: false, email: false });
                    } else {
                        const findEmail = await User.find({ email: email })

                        if (findEmail.length > 0) {
                          await User.findByIdAndUpdate(userId, { full_name: full_name || user.full_name, account_number: account_number || user.account_number }, { new: true });
                            return res.status(200).json({ msg: "User updated successfully", status: false, email: true });
                        } else {
                            await User.findByIdAndUpdate(userId, { full_name: full_name || user.full_name, email: email || user.email, account_number: account_number || user.account_number }, { new: true });
                            return res.status(200).json({ msg: "User updated successfully", status: false, email: false });
                        }
                    }

                } else {
                    let findUser = await User.find({ username: username })

                    if (findUser.length > 0) {
                        const findEmail = await User.find({ email: email })
                        if (findEmail.length > 0) {

                            if (email == user.email) {
                                await User.findByIdAndUpdate(userId, { full_name: full_name || user.full_name, account_number: account_number || user.account_number }, { new: true });
                                return res.status(200).json({ msg: "User updated successfully", status: true, email: true });
                            } else {
                                await User.findByIdAndUpdate(userId, { full_name: full_name || user.full_name, account_number: account_number || user.account_number }, { new: true });
                                return res.status(200).json({ msg: "User updated successfully", status: true, email: false });
                            }
                        } else {
                            await User.findByIdAndUpdate(userId, { full_name: full_name || user.full_name, account_number: account_number || user.account_number, email: email || user.email }, { new: true });
                            return res.status(200).json({ msg: "User updated successfully", status: true, email: false });
                        }
                    } else {
                        const findEmail = await User.find({ email: email })

                        if (findEmail.length > 0) {
                            if (email == user.email) {
                                await User.findByIdAndUpdate(userId, { full_name: full_name || user.full_name, username: username || user.username, username: username || user.username, account_number: account_number || user.account_number }, { new: true });
                                return res.status(200).json({ msg: "User updated successfully", status: false, email: false });
                            } else {
                                await User.findByIdAndUpdate(userId, { full_name: full_name || user.full_name, username: username || user.username, username: username || user.username, account_number: account_number || user.account_number }, { new: true });
                                return res.status(200).json({ msg: "User updated successfully", status: false, email: true });
                            }
                        } else {
                            await User.findByIdAndUpdate(userId, { full_name: full_name || user.full_name, username: username || user.username, email: email || user.email, account_number: account_number || user.account_number }, { new: true });
                            return res.status(200).json({ msg: "User updated successfully", status: false, email: false });
                        }
                    }
                }
            }

        } catch (error) {
            log.debug(error)
            return res.status(400).json(error.message);
        }

    },

    updateUserPicture: async (req, res, next) => {
        try {
            const userId = req.user.userId;
            zomeserver.Connection(); //DB require on company name demand
            const updateUser = await User.findByIdAndUpdate(userId, { profile_pic: req.file.location }, { new: true });
            // mongoose.connection.close();
            return res.status(200).json({ msg: "User picture updated successfully" });
        } catch (error) {
            return res.status(400).json(error.message);
        }
    },

    loginRequest: async (req, res, next) => {
        try {
            //log.debug({req: req}, "Proxy controller: forwarding the request to " + serviceName + " service " + JSON.stringify(req.headers));
            const { userid, password, companyName } = req.body;//JSON.parse(Object.keys(req.body));

            zomeserver.Connection(companyName); //DB require on company name demand

            const uas = await User.find({});
            const user = await User.findOne({
                $or: [
                    { email: userid },
                    { username: userid }]
            });
            if (!user) {
                return res.status(200).json({ msg: "User does not exist" });
            }
            const ismatch = await bcrypt.compare(password, user.password);
            if (!ismatch) {
                return res.status(200).json({ msg: "Invalid credentials" });
            }
            const token = jwt.sign({
                userId: user._id,
                email: user.email,
                userRole: user.role
            }, JWT_SECRET, {});
            mongoose.connection.close()
            return res.status(200).json({ token, username: user.username, email: user.email, role: user.role, full_name: user.full_name });
        } catch (error) {
            log.error(error)
            return res.status(400).json(error.message);
        }
    },

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

            var callOptions = {
                url: urlString,
                method: 'POST',
                body: {}
            }

            rest.call(
                null,
                callOptions,
                async (err, response, body) => {

                    log.debug("REST call returned from " + msConfig.services.zomeGatewayAgent.name + " service");
                    log.error(err);
                    log.info(response.body);
                    log.info(body);
                    const responseBody = JSON.parse(body)
                    if (responseBody.status == "SUCCESS" || responseBody.response - type == "ADD" || responseBody.response - type == "ADD_DSK") {
                        // // zomeserver.Connection('devZomePower');
                        // const addDevice = await new Device(DeviceObject).save();
                        // // mongoose.connection.close();
                        return res.status(200).json({ msg: "success" });
                    } else {
                        return res.status(200).json([]);
                    }
                });


        } catch (error) {
            return res.status(400).json(error.message);
        }
    },

    editDeviceDescription: async (req, res, next) => {
        try {
            const { deviceId, description } = req.body;
            await // zomeserver.Connection('devZomePower');
            await Device.findOneAndUpdate({ device_id: deviceId }, { "device_info.desc": description });
            // mongoose.connection.close();
            return res.status(200).json({ msg: "success" });
        } catch (error) {
            return res.status(400).json(error.message);
        }
    },

    getAllDevice: async (req, res, next) => {
        try {

            const { gatewayId = "" } = req.params;

            if (req.user.userRole == "tenant" || req.user.userRole =="TenantAdministratorUser") {
                // zomeserver.Connection('devZomePower');
                const gatewayDeviceList = await Device.find({ $or: [{ users: req.user.userId},{main_user: req.user.userId}], is_deleted: false });
                if (gatewayDeviceList.length > 0) {
                    var callOptions = {
                        url: `http://localhost:30008/zomecloud/api/v1/command-to-gateway/${gatewayDeviceList[0].gatewayId}/5003`,
                        method: 'POST',
                        body: {}
                    }

                    rest.call(
                        null,
                        callOptions,
                        async (err, response, body) => {

                            log.debug("REST call returned from " + msConfig.services.zomeGatewayAgent.name + " service");
                            log.error(err);
                            log.info(response.body);
                            log.info(body);

                            if (JSON.parse(body).status === "SUCCESS") {
                                const DeviceList = await Device.find({ $or: [{ users: req.user.userId},{main_user: req.user.userId}], is_deleted: false });
                                // mongoose.connection.close();
                                return res.status(200).json(DeviceList);

                            } else {
                                return res.status(200).json([]);
                            }
                        });
                } else {
                    return res.status(200).json({ msg: "no device found" });
                }
            } else {
                var callOptions = {
                    url: `http://localhost:30008/zomecloud/api/v1/command-to-gateway/${gatewayId}/5003`,
                    method: 'POST',
                    body: {}
                }

                rest.call(
                    null,
                    callOptions,
                    async (err, response, body) => {

                        log.debug("REST call returned from " + msConfig.services.zomeGatewayAgent.name + " service");
                        log.error(err);
                        log.info(response.body);
                        log.info(body);

                        if (JSON.parse(body).status === "SUCCESS") {
                            // zomeserver.Connection('devZomePower');
                            const DeviceList = await Device.find({ gateway_id: gatewayId, is_deleted: false });
                            // mongoose.connection.close();
                            return res.status(200).json(DeviceList);
                        } else {
                            return res.status(200).json([]);
                        }
                    });
            }
        } catch (error) {
            return res.status(400).json(error.message);
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

            // zomeserver.Connection('devZomePower');


            const UpdateDevice = await Device.findOneAndUpdate({ device_uuid: deviceUuid }, DeviceObject, {
                new: true,
                upsert: true
            });

            mongoose.connection.close()
            return res.status(200).json(UpdateDevice);
        } catch (error) {
            return res.status(400).json(error.message);
        }
    },

    deleteDevice: async (req, res, next) => {
        try {
            const { deviceId, gatewayId } = req.body;
            log.info('deviceId');
            log.info(deviceId);
            var callOptions = {
                url: `http://localhost:30008/zomecloud/api/v1/command-to-gateway/${gatewayId}/5002`,
                method: 'POST',
                body: {}
            }

            rest.call(
                null,
                callOptions,
                async (err, response, body) => {
                    log.debug("REST call returned from " + msConfig.services.zomeGatewayAgent.name + " service");
                    log.error(err);
                    log.info(response.body);
                    log.info(body);
                    const responseBody = JSON.parse(body);
                    log.info('responseBody.status');
                    log.info(responseBody.status);
                    if (responseBody.status == "SUCCESS" || responseBody.response - type == "REMOVE") {
                        // zomeserver.Connection('devZomePower');
                        await Device.findOneAndUpdate({ device_id: deviceId.toString() }, { is_deleted: true });
                        // mongoose.connection.close();
                        return res.status(200).json({ msg: "Device delete successfully" });
                    } else {
                        // mongoose.connection.close();
                        return res.status(200).json([]);
                    }
                });

        } catch (error) {
            // mongoose.connection.close();
            return res.status(400).json(error.message);
        }
    },

    addGateway: async (req, res, next) => {
        try {
            const { gatewayId, gatewayName } = req.body;

            const GatewayObject = {
                gateway_uuid: gatewayId,
                gateway_name: gatewayName,
                createdAt: Date.now(),
                updatedAt: Date.now()
            }
            // zomeserver.Connection('devZomePower');
            const addGateway = await new Gateway(GatewayObject).save();
            // mongoose.connection.close();
            return res.status(200).json(addGateway);
        } catch (error) {
            return res.status(400).json(error.message);
        }
    },

    deviceDetails: async (req, res, next) => {
        try {

            const { deviceId, gatewayId } = req.body;
            // zomeserver.Connection('devZomePower');

            const lastCheck = await Device.findOne({ device_id: deviceId }, { last_check: 1 })

            var d = new Date();
            var d1 = new Date(lastCheck.last_check);
            var diff = (d.getTime() - d1.getTime()) / 1000;
            diff /= 60;

            checkAgo = Math.abs(Math.round(diff))

            if (checkAgo < 2) {
                let msg = false;
                // mongoose.connection.close();
                return res.status(200).json({ msg });
            } else {
                await Device.findOneAndUpdate({ device_id: deviceId }, { last_check: Date.now() });
                let msg = true;
                var callOptions = {
                    url: `http://localhost:30008/zomecloud/api/v1/command-to-gateway/${gatewayId}/5006?deviceID=${deviceId}`,
                    method: 'POST',
                    body: {}
                }

                rest.call(
                    null,
                    callOptions,
                    async (err, response, body) => {

                        log.debug("REST call returned from " + msConfig.services.zomeGatewayAgent.name + " service");
                        log.error(err);
                        log.info(response.body);
                        log.info(body);

                        if (JSON.parse(body).status === "SUCCESS") {
                            const deviceDetails = await Device.findOne({ "device_id": deviceId, "gateway_id": gatewayId });
                            let msg = true;
                            // mongoose.connection.close();
                            return res.status(200).json({ deviceDetails: deviceDetails, msg: msg });
                        } else {
                            return res.status(200).json([]);
                        }
                    });
            }

        } catch (error) {
            return res.status(400).json(error.message);
        }
    },

    smartSwitchControl: async (req, res, next) => {
        try {

            const { deviceId, gatewayId, switchStatus } = req.body;

            var callOptions = {
                url: `http://localhost:30008/zomecloud/api/v1/command-to-gateway/${gatewayId}/5004?command=71000&param1=${switchStatus}&deviceID=${deviceId}`,
                method: 'POST',
                body: {}
            }

            rest.call(
                null,
                callOptions,
                async (err, response, body) => {

                    log.debug("REST call returned from " + msConfig.services.zomeGatewayAgent.name + " service");
                    log.error(err);
                    log.info(response.body);
                    log.info(body);

                    if (JSON.parse(body).status === "SUCCESS") {
                        return res.status(200).json({ msg: "Switch status changed " });
                    } else {
                        return res.status(200).json([]);
                    }
                });
        } catch (error) {
            return res.status(400).json(error.message);
        }
    },

    sendMetricsSwitch: async (req, res, next) => {
        try {

            const { deviceId, gatewayId } = req.body;

            var callOptions = {
                url: `http://localhost:30008/zomecloud/api/v1/command-to-gateway/${gatewayId}/5014?deviceID=${deviceId}`,
                method: 'POST',
                body: {}
            }

            rest.call(
                null,
                callOptions,
                async (err, response, body) => {

                    log.debug("REST call returned from " + msConfig.services.zomeGatewayAgent.name + " service");
                    log.error(err);
                    log.info(response.body);
                    log.info(body);

                    if (JSON.parse(body).status === "SUCCESS") {
                        return res.status(200).json({ msg: "Send metrics switch success " });
                    } else {
                        return res.status(200).json([]);
                    }
                });
        } catch (error) {
            return res.status(400).json(error.message);
        }
    },

    instantTemperature: async (req, res, next) => {
        try {
            // zomeserver.Connection('devZomePower');

            const { deviceId, gatewayId, typeValue } = req.body;
            const userId = req.user.userId;
            var getModeCallOptions = {
                url: `http://localhost:30008/zomecloud/api/v1/command-to-gateway/${gatewayId}/5005?deviceID=${deviceId}&command=81015`,
                method: 'POST',
                body: {}
            }

            rest.call(
                null,
                getModeCallOptions,
                async (err, response, body) => {
                    log.error(err);
                    log.info(response.body);
                    log.info(body);
                    var getUnitCallOptions = {
                        url: `http://localhost:30008/zomecloud/api/v1/command-to-gateway/${gatewayId}/5005?deviceID=${deviceId}&command=81013`,
                        method: 'POST',
                        body: {}
                    }

                    rest.call(
                        null,
                        getUnitCallOptions,
                        async (err, response, body) => {
                            log.error(err);
                            log.info(response.body);
                            log.info(body);
                        });
                    
                    const modereolver = {
                        Heat: 1,
                        Cool: 2,
                        Auto: 1, //TODO: Need to figure from the op state
                        Off: 3,
                    };

                    let mode = 2;
                    setTimeout(async () => {
                        const deviceMode = await Device.findOne({ "device_id": deviceId, "gateway_id": gatewayId }, { device_info: 1 });
                        await HistoryLog.create({
                            action_details: "Display activated",
                            control: req.user.userEmail || "local user",
                            customFields: deviceMode.device_info,
                            device_id: deviceId,
                            user_id: userId
                        });

                        if (deviceMode.device_info["Thermostat mode"] && deviceMode.device_info["Thermostat mode"] != "" && deviceMode.device_info["Thermostat mode"] != null) {
                            mode = modereolver[deviceMode.device_info["Thermostat mode"]] == 3 ? 2 : modereolver[deviceMode.device_info["Thermostat mode"]];
                        } else {
                            mode = 2;
                        }

                        log.info("device------", deviceMode);
                        log.info("device------", deviceMode.device_info);
                        log.info("mode------------", mode);
                        var getTempCallOptions = {
                            url: `http://localhost:30008/zomecloud/api/v1/command-to-gateway/${gatewayId}/5005?deviceID=${deviceId}&command=81000&param1=${mode}`,
                            method: 'POST',
                            body: {}
                        }

                        rest.call(
                            null,
                            getTempCallOptions,
                            async (err, response, body) => {
                                log.error(err);
                                log.info(response.body);
                                log.info(body);
                                var getTstatModeCallOptions = {
                                    url: `http://localhost:30008/zomecloud/api/v1/command-to-gateway/${gatewayId}/5005?deviceID=${deviceId}&command=81017&param1=1`,
                                    method: 'POST',
                                    body: {}
                                }

                                rest.call(
                                    null,
                                    getTstatModeCallOptions,
                                    async (err, response, body) => {
                                        log.error(err);
                                        log.info(response.body);
                                        log.info(body);

                                        if (JSON.parse(body).status === "SUCCESS") {
                                            const deviceDetails = await Device.findOne({ "device_id": deviceId, "gateway_id": gatewayId });
                                            deviceDetails.device_info.updatedAt = deviceDetails.updated_at;
                                            // mongoose.connection.close();
                                            return res.status(200).json(deviceDetails);
                                        } else {
                                            return res.status(200).json([]);
                                        }
                                    });
                            });
                    }, 2000);
                });
        } catch (error) {
            return res.status(400).json(error.message);
        }
    },

    getGateway: async (req, res, next) => {
        try {
            // zomeserver.Connection('devZomePower');
            const withstatus = req.query.withstatus;
           
            if (!withstatus || withstatus == "false") {
                
                if(req.user.userRole === "property-owner" ){
                    let propertyfilter = {};
                    let meterfilter = {};
                    /-- get property_ids from user's collection --/
                   const userPropertyId = await User.find({ _id: req.user.userId }, { properties: 1 });
                   let propertyIdArray = userPropertyId.map(a => a.properties)
                   let properties = propertyIdArray[0];
                   let propertyList = [];                   
                /--    get properties from property collection --/
                   propertyfilter['_id'] = { $in: properties }    
                   propertyList = await Property.find(propertyfilter);                   
                   const meter_ids = propertyList.map(meters => meters.meter_id);
                   /-- get meterids from  properties --/       
                    meterfilter['meter_id'] = {$in : meter_ids};
                    gatewaymeterList = await Gateway.find(meterfilter,{ gateway_name: 1, status: 1, gateway_uuid: 1 });

                    if(gatewaymeterList.length === 0){
                      
                        gatewaymeterList = { msg: "User does not have any property." }
                        // mongoose.connection.close();
                        return res.status(201).json(gatewaymeterList);
                    }
                    else {
                        // mongoose.connection.close();
                        return res.status(200).json(gatewaymeterList);
                    } 
                    }
                
                if( req.user.userRole === "property-manager"){
                    let Buildingfilter = {};
                    let meterfilter = {};
                    /-- get buildingids from user's collection --/
                   const userBuildingId = await User.find({ _id: req.user.userId }, { buildings: 1 });
                   let buildingIdArray = userBuildingId.map(a => a.buildings)
                   let buildings = buildingIdArray[0];
                   let BuildingList = [];                   
                /--    get gateways array from buidling collection --/
                   Buildingfilter['_id'] = { $in: buildings }    
                   BuildingList = await building.find(Buildingfilter); 
                    const gateways_ids = BuildingList.map(gtways => gtways.gateways);
                   /-- get gateways  --/       
                   console.log(gateways_ids,"gateways_ids")
                   const gatewayarray  = gateways_ids.flat();
                   console.log(gatewayarray,"gatewayarray..")    
                    meterfilter['_id'] = {$in : gatewayarray};
                    gatewayList = await Gateway.find(meterfilter,{ gateway_name: 1, status: 1, gateway_uuid: 1 });
                    if(gatewayList.length === 0){
                      
                        gatewayList = { msg: "User does not have any property." }
                        // mongoose.connection.close();
                        return res.status(201).json(gatewayList);
                    }
                    // mongoose.connection.close();
                    return res.status(200).json(gatewayList);
                }
               if(req.user.userRole === "support"){
                    let gatewaysList = await Gateway.find({}, { gateway_name: 1, status: 1, gateway_uuid: 1 });
                    // mongoose.connection.close();
                    return res.status(200).json(gatewaysList);    
                }
            } else if (withstatus) {
                const bot = new IRC.Client();
                bot.connect({
                    host: process.env.IRC_SERVER,
                    port: 6667,
                    nick: process.env.IRC_BOT_TEST_NICK,
                });
                let buffers = [];
                bot.on('registered', function () {
                    var channel = bot.channel('#zome-broadcast-feed');
                    buffers.push(channel);

                    channel.join();
                    channel.say('Hi!');
                    log.debug('connected to irc!');
                    channel.updateUsers(async () => {
                        let gatewayNameList = [];
                        for (let i = 0; i < channel.users.length; i++) {
                            let gatewayName = channel.users[i].nick;

                            if (gatewayName.includes("_")) {
                                gatewayNameList.push(gatewayName.substring(0, gatewayName.lastIndexOf("_")));
                            } else {
                                gatewayNameList.push(gatewayName);
                            }

                        }

                        let gateways = await Gateway.find();
                        log.debug("gatewayNameList from IRC");
                        log.debug(gatewayNameList);
                        log.debug("gateways from mongoDB");
                        log.debug(gateways);
                        for (let j = 0; j < gateways.length; j++) {
                            for (let k = 0; k < gatewayNameList.length; k++ ) {
                                if (gatewayNameList[k] == gateways[j].gateway_name) {
                                    log.debug(`checking the status for the ${gateways[j].gateway_name}`);
                                    var callOptions = {
                                        url: `http://localhost:30008/zomecloud/api/v1/command-to-gateway/${gateways[j].gateway_uuid}/5003`,
                                        method: 'POST',
                                        body: {}
                                    }

                                    rest.call(
                                        null,
                                        callOptions,
                                        async (err, response, body) => {
                                            log.error(err);
                                            log.info(response.body);
                                            log.info(body);
                                        });
                                } else {
                                    Gateway.findOneAndUpdate({ "gateway_name": gateways[j].gateway_name }, { $set: { "status": "offline" } }, { new: true }, (err, doc) => {
                                        if (err) {
                                            log.error(`Error in updating gateway status: ${err}`);
                                        } else {
                                            log.debug(`Gateway status change for ${gateways[j].gateway_name}`);
                                            log.debug("Gateway status updated successfully");
                                        }
                                    });
                                }
                                break;
                            }
                        }

                        // Or you could even stream the channel messages elsewhere
                        var stream = channel.stream();
                        stream.pipe(process.stdout);
                        bot.quit("Quitting the IRC");
                        let gatewaysList = await Gateway.find({}, { gateway_name: 1, status: 1, gateway_uuid: 1 });
                        // mongoose.connection.close();
                        return res.status(200).json(gatewaysList);
                    });
                });
            }
        } catch (error) {
            // // mongoose.connection.close();
            return res.status(400).json(error.message);
        }
    },

    editTemperature: async (req, res, next) => {
        try {
            const { gatewayId, deviceId, type, unit, value } = req.body;
            const userId = req.user.userId;
            //type = 0 for heat, 1 for cool
            //unit = 0 for Celsius, 1 for Fahrenheit
            //value = Target temperature.... 35F to 95F, 2C to 34C

            if (unit == 1) {
                if (value < 35 || value > 95) {
                    return res.status(200).json({ msg: "select wrong value of Fahrenheit" })
                }
            } else {
                if (value < 2 || value > 34) {
                    return res.status(200).json({ msg: "select wrong value of Celsius" })
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
            var callOptions = {
                url: `http://localhost:30008/zomecloud/api/v1/command-to-gateway/${gatewayId}/5004?deviceID=${deviceId}&command=71006&type=${typeM}&unit=${unit}&value=${value}`,
                method: "POST",
                body: {},
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

                zomeserver.Connection("devZomePower");
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

                    await HistoryLog.create({
                        action_details: `Set point adjusted to temperature ${value} ${unitName}`,
                        control: req.user.userEmail || "local user",
                        customFields: updateDevice.device_info,
                        device_id: deviceId,
                        user_id: userId
                    });

                    // mongoose.connection.close();
                    return res.status(200).json({
                        msg: "temperature updated",
                        device: updateDevice,
                    });
                } else {
                    // mongoose.connection.close();
                    return res.status(200).json({
                        msg: "temperature not updated",
                    });
                }
            });
        } catch (error) {
            return res.status(400).json(error.message);
        }
    },

    smartSwitchStatus: async (req, res, next) => {
        try {
            const { gatewayId, deviceId } = req.params;
            var callOptions = {
                url: `http://localhost:30008/zomecloud/api/v1/command-to-gateway/${gatewayId}/5005?deviceID=${deviceId}&command=81018`,
                method: "POST",
                body: {},
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

                zomeserver.Connection("devZomePower");
                if (JSON.parse(body).status == "SUCCESS") {
                    const deviceStatus = await Device.findOne(
                        { device_id: deviceId }, { device_info: 1 }
                    );

                    if (deviceStatus.device_info["Power State"] == undefined || deviceStatus.device_info["Power State"] == null) {
                        deviceStatus.device_info["Power State"] = "Off"
                    }

                    res.status(200).json({
                        msg: "Fetch smart switch status",
                        device: deviceStatus.device_info,
                    });
                } else {
                    res.status(200).json({
                        msg: "Something went wrong.",
                    });
                }
                // mongoose.connection.close();
            }
            );
        } catch (error) {
            return res.status(400).json(error.message);
        }
    },

    removeNode: async (req, res, next) => {
        try {
            const { gatewayId, deviceId } = req.body;
            let jobId = mongoose.Types.ObjectId();
            let callOptions = {
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
            }
            rest.call(null, callOptions, async (err, response, body) => {
                log.debug(
                    "REST call returned from " +
                    msConfig.services.zomeGatewayAgent.name +
                    " service"
                );
                log.error(err);
                log.info(response?.body);
                log.info(body);

                res.status(200).json({
                    msg: "Remove node successfully",
                });
            }
            );
        } catch (error) {
            return res.status(400).json(error.message);
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

            // zomeserver.Connection('devZomePower');

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

            return res.status(200).json({ msg: "Success" })
        } catch (error) {
            return res.status(400).json(error.message);
        }
    },

    gatewaySearch: async (req, res, next) => {
        try {

            const { gatewayName } = req.query;
            // zomeserver.Connection('devZomePower');
           if(gatewayName.length === 0 )
           {
            if(req.user.userRole === "property-owner" || req.user.userRole === "property-manager"){
                let propertyfilter = {};
                let meterfilter = {};
                /-- get property_ids from user's collection --/
               const userPropertyId = await User.find({ _id: req.user.userId }, { properties: 1 });
               let propertyIdArray = userPropertyId.map(a => a.properties)
               let properties = propertyIdArray[0];
               let propertyList = [];                   
            /--    get properties from property collection --/
               propertyfilter['_id'] = { $in: properties }    
               propertyList = await Property.find(propertyfilter);                   
               const meter_ids = propertyList.map(meters => meters.meter_id);
               /-- get meterids from  properties --/       
                meterfilter['meter_id'] = {$in : meter_ids};
                gatewaymeterList = await Gateway.find(meterfilter,{ gateway_name: 1, status: 1, gateway_uuid: 1 });
                // mongoose.connection.close();
                return res.status(200).json(gatewaymeterList);
            } else if (req.user.userRole == "support") {
                const getAllGateway = await Gateway.find({ gateway_name: { $regex: gatewayName, $options: "i" } });
                // mongoose.connection.close();
                res.status(200).json(getAllGateway);
            }
           } else {
               const getAllGateway = await Gateway.find({ gateway_name: { $regex: gatewayName, $options: "i" } });
               // mongoose.connection.close();

               res.status(200).json(getAllGateway);
           }


        } catch (error) {
            return res.status(400).json(error.message);
        }
    },

  
    getAllUser: async (req, res, next) => {
        try {
            zomeserver.Connection('devZomePower');
            const { userRole } = req.user;
            let getAllUsers;
            if (userRole == "support") {
                getAllUsers = await User.find({}, { email: 1, username: 1, role: 1, date_created: 1 });

            } else if (userRole == "property-owner" || userRole == "property_owner"){
                let propertiesFilter = {}
                //  get property_ids from user's collection 

                const userPropertyId = await User.find({ _id: req.user.userId }, { properties: 1 });
                let propertyIdArray = userPropertyId.map(a => a.properties)
                let properties = propertyIdArray[0];
                propertiesFilter['properties'] = { $in: properties };

                let propertyfilter = {};
                let meterfilter = {};

                let propertyList = [];
                propertyfilter['_id'] = { $in: properties }
                propertyList = await Property.find(propertyfilter);
                const meter_ids = propertyList.map(meters => meters.meter_id);

                /-- get meterids from  properties --/
                meterfilter['meter_id'] = { $in: meter_ids };
                gatewaymeterList = await Gateway.find(meterfilter, { gateway_uuid: 1 });
                const gateway_ids = gatewaymeterList.map(gateways => gateways.gateway_uuid);

                /-- get tenants  from  gateways --/
                Tenantfilter = {}
                Tenantfilter['gateway_id'] = { $in: gateway_ids }

                TenantList = await Device.find(Tenantfilter);
                const tenantUsers = TenantList.map(tenants => tenants.users);
                tenants = tenantUsers[0];
                getAllUsers = await User.find({ $or: [ { "role": { "$in": ["property-manager",] }, "properties": { $in: properties } },{ "_id": { $in: tenants } }] });

            } else if (userRole == "property-manager" || userRole == "property_manager") {

                let propertiesFilter = {}
                const userPropertyId = await User.find({ _id: req.user.userId }, { properties: 1 });
                let propertyIdArray = userPropertyId.map(a => a.properties)
                let properties = propertyIdArray[0];

                propertiesFilter['properties'] = { $in: properties }

                let propertyfilter = {};
                let meterfilter = {};

                let propertyList = [];
                propertyfilter['_id'] = { $in: properties }
                propertyList = await Property.find(propertyfilter);
                const meter_ids = propertyList.map(meters => meters.meter_id);

                /-- get meterids from  properties --/
                meterfilter['meter_id'] = { $in: meter_ids };
                gatewaymeterList = await Gateway.find(meterfilter, { gateway_uuid: 1 });
                const gateway_ids = gatewaymeterList.map(gateways => gateways.gateway_uuid);

                /-- get tenants  from  gateways --/
                Tenantfilter = {}
                Tenantfilter['gateway_id'] = { $in: gateway_ids }

                TenantList = await Device.find(Tenantfilter);
                const tenantUsers = TenantList.map(tenants => tenants.users);

                tenants = tenantUsers[0];
                getAllUsers = await User.find({ "_id": { $in: tenants } })
            }
            else {
                getAllUsers = { msg: "You are not have authority role" }
            }
            mongoose.connection.close();

            res.status(200).json(getAllUsers);
        } catch (error) {
            return res.status(400).json(error.message);
        }
    },  

    getUsersByProperty: async (req, res, next) => {
        try {
            zomeserver.Connection("devZomePower");
            let getAllUsers;
            if (req.user.userRole == "support") {
                //get id from property
                const propertyName = req.body.property
                const propertyDetails = await Property.find({ "name": { $in: propertyName } }, { name: 1, meter_id: 1 });
                const propertyid = propertyDetails.map(id => id._id);
                const meter_id = propertyDetails.map(meterId => meterId.meter_id);
                let meter_Id = meter_id[0];
                let meterFilter = {};
                meterFilter['meter_id'] = { $in: meter_Id };
                let gatewaymeterList = await Gateway.find({ "meter_id": meter_Id }, { gateway_uuid: 1 });
                const gateway_ids = gatewaymeterList.map(gateways => gateways.gateway_uuid);
                //  get tenants  from  gateways 
                let gatewayidtenant = gateway_ids[0];
                Tenantfilter = {}
                Tenantfilter['gateway_id'] = { $in: gatewayidtenant }
                TenantList = await Device.find(Tenantfilter);
                const tenantUsers = TenantList.map(tenants => tenants.users);
                tenants = tenantUsers[0];
                getAllUsers = await User.find({ $or: [{ "role": { "$in": ["property-manager", "property-owner"] }, "properties": { $in: propertyid } }, { "_id": { $in: tenants } }] });

                mongoose.connection.close();
                res.status(200).json(getAllUsers);
            }


        } catch (error) {
            return res.status(400).json(error.message);
        }
    },
    addCpowerTestEvent: async (req, res, next) => {
        try {
          zomeserver.Connection("devZomePower");
            console.log(req.body);
          var callOptions = {
            url: "http://localhost:30005/zomecloud/api/v1/cpower-mock",
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
    
          res.status(200).json();
        } catch (error) {
           return res.status(400).json(error.message);
        }
      },
    getGatewaysByMeterId: async (req, res, next) => {
        try {
          zomeserver.Connection("devZomePower");
          let meter_ids = req.body.meterids;
          let meters = [];
          for (let i = 0; i < meter_ids.length; i++) {
            const gatewaysbymeter = await Gateway.find({ meter_id: meter_ids[i] });
            meters.push(gatewaysbymeter);
          }
          // mongoose.connection.close();
    
          res.status(200).json(meters);
        } catch (error) {
           return res.status(400).json(error.message);
        }
      },
      getGatewaysByProperty: async (req, res, next) => {
        try {
            zomeserver.Connection("devZomePower");
            let role = req.user.userRole;
            let gateways = [];
            let gatewayIDs = [];
            if (role === "support" || role === "property-owner") {
                // add to data like confirmdata
                let propertyIDs = req.body.propertyids;
                let gatewaysFound = await Building.find({ propertyId: { $in: propertyIDs } }, { gateways: 1 });
                for (let i = 0; i < gatewaysFound.length; i++){
                    for (let x = 0; x < gatewaysFound[i].gateways.length; x++) {
                        gatewayIDs.push(gatewaysFound[i].gateways[x]);
                    }
                }
                let gatewaysResult = await Gateway.find({ _id: { $in: gatewayIDs}}, { gateway_name: 1, status: 1, gateway_uuid: 1 });
                gateways.push(gatewaysResult);

                if (gatewaysResult.length > 0) {
                    res.status(200).json(gatewaysResult); 
                } else {
                    gatewayMessage = { msg: "User does not have any property." };
                    res.status(201).json(gatewayMessage);
                }     
            } else if (role === "property-manager") {
                let propertyIDs = req.body.propertyids;
                let totalBuildingsIDs = await Building.find({ propertyId: { $in: propertyIDs} }, { _id: 1});
                let validBuildingList = [];
                let gatewaysIDs = [];
                let validBuildingsFound = await User.find({_id: req.user.userId}, { buildings: 1});

                for (let i = 0; i< validBuildingsFound.length; i++) {
                    for (let x = 0; x < validBuildingsFound[i].buildings.length; x++) {
                        validBuildingList.push(validBuildingsFound[i].buildings[x]); 
                    }
                }
                let finalBuildingIDList = [];

                for (let i = 0; i< totalBuildingsIDs.length; i++) {
                    for (let x = 0; x < validBuildingList.length; x++) {
                        if (validBuildingList[x].toString() === totalBuildingsIDs[i]._id.toString()) {
                            finalBuildingIDList.push(totalBuildingsIDs[i]._id);
                        }
                    }
                }

                gatewayData = await Building.find({ _id : { $in: finalBuildingIDList} }, { gateways: 1, _id : 0});

                for (let i = 0; i < gatewayData.length; i ++) {
                    for (let x = 0; x < gatewayData[i].gateways.length; x++) {
                        gatewaysIDs.push(gatewayData[i].gateways[x]);
                    } 
                }
                let gatewayInfo = await Gateway.find({ _id: { $in: gatewaysIDs}}, { gateway_name: 1, status: 1, gateway_uuid: 1 });
                if (gatewayInfo.length > 0) {
                    res.status(200).json(gatewayInfo); 
                } else {
                    gatewayMessage = { msg: "User does not have any property." };
                    res.status(201).json(gatewayMessage);
                }    

            }
            else {
                gatewayMessage = { msg: "User does not have any property." };
                res.status(201).json(gatewayMessage);
            }
        } catch (error) {
            return res.status(400).json(error.message);
        }
      },

      getGatewaysByUser: async (req, res, next) => {
        try {
            zomeserver.Connection("devZomePower");
            if (req.user.userRole === "property-manager" || req.user.userRole === "property-owner") {
                let userID = req.user.userId;
                let user = await User.find({_id: userID});
                let properties = user[0].properties;
                let buildings = user[0].buildings;
                let gateways = [];
                for (let i = 0; i < buildings.length; i++) {
                    var buildingFound = await Building.find({_id: buildings[i]});
                    for (x = 0; x < buildingFound[0].gateways.length; x++) {
                        let gatewayID = buildingFound[0].gateways[x];
                        let gateway = await Gateway.find({_id: gatewayID}, { gateway_name: 1, status: 1, gateway_uuid: 1 });
                        gateways.push(gateway[0]);
                    }
                }
                if (gateways.length > 0) {
                    res.status(200).json(gateways);
                } else {
                    gatewayMessage = { msg: "User does not have any property." };
                    res.status(201).json(gatewayMessage);
                }

            } else {
                res.status(200).json("did not work");
            }

        } catch (error) {
            return res.status(400).json(error.message);
        }
    },


    showGatewaysByMeterId: async (req, res, next) => {
        try {
            zomeserver.Connection("devZomePower");

            if (req.user.userRole === "property-manager") {
                let meter_ids = JSON.parse(req.body.meterids);
                const properties = await Property.find({ meter_id: { $in: meter_ids } }, { _id: 1 });
                const GatewaysOfBuildings = await Building.find({ propertyId: { $in: properties } }, { gateways: 1 });
                const gateways_ids = GatewaysOfBuildings.map(gtways => gtways.gateways);
                let gatewayarray = gateways_ids[0];
                let gatewayfilter = {};
                gatewayfilter['_id'] = { $in: gatewayarray };
                let gatewaysbymeter = await Gateway.find(gatewayfilter, { gateway_name: 1, status: 1, gateway_uuid: 1 });

                if (gatewaysbymeter.length === 0) {
                    gatewaysbymeter = { msg: "User does not have any property." }
                    // mongoose.connection.close();
                    res.status(201).json(gatewaysbymeter);

                } else {
                    // mongoose.connection.close();
                    res.status(200).json(gatewaysbymeter);
                }

            }
            if (req.user.userRole === "property-owner" || req.user.userRole === "support") {
                let meter_ids = JSON.parse(req.body.meterids);
                let gatewaysbymeter = await Gateway.find({ meter_id: { $in: meter_ids } }, { gateway_name: 1, status: 1, gateway_uuid: 1 });

                if (gatewaysbymeter.length === 0) {
                    gatewaysbymeter = { msg: "User does not have any property." }
                    // mongoose.connection.close();
                    res.status(201).json(gatewaysbymeter);

                } else {
                    // mongoose.connection.close();
                    res.status(200).json(gatewaysbymeter);
                }
            }
        } catch (error) {
            return res.status(400).json(error.message);
        }
    },
    getDeviceByGateway: async (req, res, next) => {
        try {
            // zomeserver.Connection('devZomePower');
            const { gatewayId } = req.body;

            let Devices = [];
            for (let i = 0; i < gatewayId.length; i++) {
                const DeviceByGateway = await Device.find({ gateway_id: gatewayId[i], "device_info.DeviceType": '259' });
                Devices.push(DeviceByGateway);
                // Object.assign(Devices, DeviceByGateway)
            }
            // mongoose.connection.close();

            res.status(200).json(Devices);
        } catch (error) {
            return res.status(400).json(error.message);
        }
    },
    setPoinThermostateDevices: async (req, res, next) => {
        try {

            const { mode } = req.body;
            const zomeKitConnectorUrl = process.env.ZOMEKITCONNECTOR_API_URL;
            const setpointEndPoint = "zomekit-setpoint";
            let existingGateways = [];
            const gatewayIds = JSON.parse(req.body.gatewayIds);
            if (mode === "3" || mode === "2") {
                // zomeserver.Connection('devZomePower');
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

            }
            let msg = 'tmeparature updated';
            log.info("existingGateways==>", existingGateways);
            if (existingGateways.length > 0) {

                msg = `tmeparature updated and dispatch event for ${existingGateways} is not finished yet, so this will not include in this request`
            }
            res.status(200).json({ msg });
        } catch (error) {
            return res.status(400).json(error.message);
        }
    },

    getDispatchEventReport: async (req, res, next) => {
        try {
            // zomeserver.Connection('devZomePower');
            const connectionStatus = await isConnected();
            if (!connectionStatus) {
                return false;
            }
            const reports = await DispatchEventDetail.find({});

            res.status(200).json(reports);

        } catch (error) {
            return res.status(400).json(error.message);
        }
    },

    getVersion: async (req, res, next) => {
        try {
            const {gateway_uuid} = req.params;
            let jobId = mongoose.Types.ObjectId();
            let callOptions = {
                url: `http://localhost:30004/queues/add-job`,
                method: 'POST',
                body: { 
                    queueId: gateway_uuid + "-sender", 
                    jobName: "test-zomekit-sender", 
                    jobPayload:{
                        jobId: jobId,
                        type: "api",
                        value: {
                            url: `http://localhost:30008/zomecloud/api/v1/command-to-gateway/${gateway_uuid}/5015`,
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
                    log.error(err);
                    log.info(response?.body);
                    log.info(body);
                    jobId = mongoose.Types.ObjectId();
                    let callOptions = {
                        url: `http://localhost:30004/queues/add-job`,
                        method: 'POST',
                        body: { 
                            queueId: gateway_uuid + "-sender", 
                            jobName: "test-zomekit-sender", 
                            jobPayload:{
                                jobId: jobId,
                                type: "api",
                                value: {
                                    url: `http://localhost:30008/zomecloud/api/v1/command-to-gateway/${gateway_uuid}/5017`,
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
                            log.error(err);
                            log.info(response?.body);
                            log.info(body);
                            // zomeserver.Connection('devZomePower');
                            const connectionStatus = await isConnected();
                            if (!connectionStatus) {
                                return false;
                            }
                            let getVersion = await Gateway.findOne({ gateway_uuid: gateway_uuid }, { image_version: 1, ms_version: 1 });
                            // mongoose.connection.close();
                            return res.status(200).json(getVersion);
                        });
                });

        } catch (error) {
            return res.status(400).json(error.message);
        }
    },

    testAPI: async (req, res, next) => {
        try {
            zomeserver.Connection("devZomePower");
            mongoose.connection.close();
            return res.status(200).json({ msg: "Test API" });
        } catch (error) {
            return res.status(400).json(error.message);
        }
    },

    sysLogsUpload: async (req, res, next) => {
        try {
            var AWS = require("aws-sdk");
            const s3Config = {
                clientId: process.env.AWS_ACCESS_KEY,
                clientSecret: process.env.AWS_SECRET_KEY,
                region: process.env.REGION,
                bucket: process.env.LOGS_BUCKET
            }

            AWS.config.update({
                accessKeyId: s3Config.clientId,
                secretAccessKey: s3Config.clientSecret,
                region: s3Config.region,
            });
            const s3 = new AWS.S3({ params: { Bucket: s3Config.bucket } });
            const body = {
                Body: path.resolve(__dirname, '../../zome-gateway-app/log/dummy.log'),
                Key: '/syslogs/dummy.log',
            }
            await s3.putObject(body, function (err, data) {
                if (err) {
                    log.error(err);
                    log.info('Error uploading data: ', data);
                }
            })
        } catch (error) {
            return res.status(400).json(error.message);
        }
    },
    sendDispatchCommand: async (req, res, next) => {
        log.info("This is request------->",req.body);

        let dataTobeSent={

        }
        try {
            const { gatewayuuid,commandType } = req.body.params;
            const zomeKitConnectorUrl = process.env.ZOMEKITCONNECTOR_API_URL;
            const setpointEndPoint = "zomekit-sendcommand";
            let jobId = mongoose.Types.ObjectId();
            let callOptions = {
                url: `http://localhost:30004/queues/add-job`,
                method: 'POST',
                body: { 
                    queueId: gatewayId + "-sender", 
                    jobName: "test-zomekit-sender", 
                    jobPayload:{
                        jobId: jobId,
                        type: "api",
                        value: {
                            url: `http://localhost:30008/zomecloud/api/v1/dispatch-command-to-gateway`, // `${zomeKitConnectorUrl}/${setpointEndPoint}`,
                            method: 'POST',
                            body: req.body
                        }
                    } 
                }
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

            let msg = 'tmeparature updated';
            log.info("existingGateways==>", existingGateways);
            res.status(200).json({ msg });
        } catch (error) {
            return res.status(400).json(error.message);
        }
    },

    getHistoryLog: async (req, res, next) => {
        try {
            const userId = req.user.userId;
            zomeserver.Connection();

            const deviceList = await Device.find({ $or: [{ users: req.user.userId},{main_user: req.user.userId}]},{device_id: 1});

            const historyLogs = await HistoryLog.find({device_id: { $in: deviceList.map((device) => { return device.device_id }) }});

            // mongoose.connection.close();

            return res.status(200).json(historyLogs);
        } catch (error) {
            return res.status(400).json(error.message);
        }
    },

    restartServer: async (req, res, next) => {
        try{
            const userRole = req.user.userRole;
            if (userRole == "admin" || userRole == "siteowner" || userRole == "support") {
                const { exec } = require("child_process");
                exec("pm2 restart all");
                return res.status(200).json({ msg: "Server restarted" });
            } else {
                return res.status(400).json({ msg: "You are not have authority role" });
            }

        } catch (error) {
            return res.status(400).json(error.message);
        }
    },

    setRetryCount: async (req, res, next) => {
        try {
            const { retryCountStatus, retryCount } = req.body;
            // zomeserver.Connection('devZomePower');
            const setRetryCount = await Config.findOneAndUpdate({ type: "retry_count" }, { status: retryCountStatus, value: retryCount }, { upsert: true, new: true });

            // mongoose.connection.close();
            return res.status(200).json({data: setRetryCount, status: 200});
        } catch (error) {
            return res.status(400).json(error.message);
        }
    },

    getRetryCount: async (req, res, next) => {
        try {
            zomeserver.Connection();

            const retryCount = await Config.findOne({ type: "retry_count" });
            // mongoose.connection.close();

            return res.status(200).json({data: retryCount, status: 200});
        } catch (error) {
            return res.status(400).json(error.message);
        }
    },

    bullQueue: async (req, res, next) => {
        try {
            const { deviceId, gatewayId } = req.body;
            let callOptions = {
                url: `http://localhost:30004/queues/add-job`,
                method: 'POST',
                body: { 
                    queueId: gatewayId + "-sender", 
                    jobName: "test-zomekit-sender", 
                    jobPayload:{
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
                    log.debug("Error", err);
                });
            return res.status(200).json({ msg: "Job added" });
        } catch (error) {
            return res.status(400).json(error.message);
        }
    }
}
