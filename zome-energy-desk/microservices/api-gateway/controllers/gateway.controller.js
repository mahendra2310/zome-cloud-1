const IRC = require('irc-framework');
const zomeserver = require("zome-server");
var log = require("zome-server").logger.log;
var rest = require("zome-server").rest;
var errLib = require("zome-server").error;
var responseLib = require("zome-server").resp;
var msConfig = require('zome-config').microservices;
const Gateway = require("mongo-dbmanager").gatewaymodel;
var mongoose = require('zome-server').mongoose;

module.exports = {
    addGateway: async (req, res, next) => {
        try {
            const { gatewayId, gatewayName } = req.body;

            const GatewayObject = {
                gateway_uuid: gatewayId,
                gateway_name: gatewayName,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };
            zomeserver.Connection("devZomePower");
            const addGateway = await new Gateway(GatewayObject).save();
            mongoose.connection.close();
            return responseLib.handleSuccess(addGateway, res);
        } catch (error) {
            return errLib.internalFailure
        }
    },

    getGateway: async (req, res, next) => {
        try {
            zomeserver.Connection("devZomePower");
            // const withstatus = req.query.withstatus;
            // if (!withstatus || withstatus == "false") {
                let gatewaysList = await Gateway.find(
                    {},
                    { gateway_name: 1, status: 1, gateway_uuid: 1 }
                );
                mongoose.connection.close();
                return responseLib.handleSuccess(gatewaysList, res);
            // }
            // else if (withstatus) {
            //     const ircBot = new IRC.Client();
            //     ircBot.connect({
            //         host: process.env.IRC_SERVER,
            //         port: 6667,
            //         nick: process.env.IRC_BOT_TEST_NICK,
            //     });
            //     ircBot.on("registered", function () {
            //         var channel = ircBot.channel("#zome-broadcast-feed");

            //         channel.join();
            //         channel.say("Hi!");
            //         log.debug("connected to irc!");
            //         channel.updateUsers(async () => {
            //             let gatewayNameList = [];
            //             for (let i = 0; i < channel.users.length; i++) {
            //                 let gatewayName = channel.users[i].nick;

            //                 if (gatewayName.includes("_")) {
            //                     gatewayNameList.push(
            //                         gatewayName.substring(0, gatewayName.lastIndexOf("_"))
            //                     );
            //                 } else {
            //                     gatewayNameList.push(gatewayName);
            //                 }
            //             }

            //             let gateways = await Gateway.find();
            //             log.debug("gatewayNameList from IRC");
            //             log.debug(gatewayNameList);
            //             log.debug("gateways from mongoDB");
            //             log.debug(gateways);
            //             for (let j = 0; j < gateways.length; j++) {
            //                 for (let k = 0; k < gatewayNameList.length; k++) {
            //                     if (gatewayNameList[k] == gateways[j].gateway_name) {
            //                         log.debug(
            //                             `checking the status for the ${gateways[j].gateway_name}`
            //                         );
            //                         var callOptions = {
            //                             url: `http://localhost:30008/zomecloud/api/v1/command-to-gateway/${gateways[j].gateway_uuid}/5003`,
            //                             method: "POST",
            //                             body: {},
            //                         };

            //                         rest.call(null, callOptions, async (err, response, body) => {
            //                             log.error(err);
            //                             log.info(response.body);
            //                             log.info(body);
            //                         });
            //                     } else {
            //                         Gateway.findOneAndUpdate(
            //                             { gateway_name: gateways[j].gateway_name },
            //                             { $set: { status: "offline" } },
            //                             { new: true },
            //                             (err, doc) => {
            //                                 if (err) {
            //                                     log.error(`Error in updating gateway status: ${err}`);
            //                                 } else {
            //                                     log.debug(
            //                                         `Gateway status change for ${gateways[j].gateway_name}`
            //                                     );
            //                                     log.debug("Gateway status updated successfully");
            //                                 }
            //                             }
            //                         );
            //                     }
            //                     break;
            //                 }
            //             }

            //             // Or you could even stream the channel messages elsewhere
            //             var stream = channel.stream();
            //             stream.pipe(process.stdout);
            //             bot.quit("Quitting the IRC");
            //             let gatewaysList = await Gateway.find(
            //                 {},
            //                 { gateway_name: 1, status: 1, gateway_uuid: 1 }
            //             );
            //             mongoose.connection.close();
            //             return responseLib.handleSuccess(gatewaysList, res);
            //         });
            //     });
            // }
        } catch (error) {
            // mongoose.connection.close();
            return errLib.internalFailure
        }
    },

    gatewaySearch: async (req, res, next) => {
        try {
            const { gatewayName } = req.query;
            zomeserver.Connection("devZomePower");
            const getAllGateway = await Gateway.find({
                gateway_name: { $regex: gatewayName, $options: "i" },
            });
            mongoose.connection.close();

            return responseLib.handleSuccess(getAllGateway, res);
        } catch (error) {
            return errLib.internalFailure
        }
    },
};
