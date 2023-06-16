var log = require("zome-server").logger.log;
var mongoose = require('zome-server').mongoose;
const Gateway = require('mongo-dbmanager').gatewaymodel;
var zomeserver = require('zome-server');
var rest = require('zome-server').rest;
var log = require('zome-server').logger.log;
const IRC = require('irc-framework');

module.exports = async () => {

    var bot = new IRC.Client();
    bot.connect({
        host: process.env.IRC_SERVER,
        port: 6667,
        nick: process.env.IRC_BOT_TEST_NICK,
    });

    var buffers = [];
    bot.on('registered', function () {
        var channel = bot.channel('#zome-broadcast-feed');
        buffers.push(channel);

        channel.join();
        channel.say('Hi!');

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
            zomeserver.Connection('devZomePower');
            let gateways = await Gateway.find();

            for (let j = 0; j < gateways.length; j++) {
                gatewayNameList.find((item) => {
                    if (item == gateways[j].gateway_name) {
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
                                log.error("Error in updating gateway status");
                            } else {
                                log.debug("Gateway status updated successfully");
                            }
                        });
                    }
                })
            }

            // Or you could even stream the channel messages elsewhere
            var stream = channel.stream();
            stream.pipe(process.stdout);
            let gatewaysList = await Gateway.find({}, { gateway_name: 1, status: 1, gateway_uuid: 1 });
            bot.on("close", () => {
                log.info("Connection closed");
            });
            mongoose.connection.close();
            return gatewaysList;
        });

    });
}