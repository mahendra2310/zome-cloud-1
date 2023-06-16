require('newrelic');
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const zomeserver = require("zome-server");
const log = require("zome-server").logger.log;
const server = require("zome-server").Server;
const msConfig = require("zome-config").microservices;
const { receiveMessage, onClose } = require("./controllers/functions/command/commands.from.irc.function");
const { estIrcBotConnection, estAsyncIrcBotConnection } = require("./controllers/functions/connection/irc.bot.connection.function");

zomeserver.Connection();

estAsyncIrcBotConnection().then(async (bot2) => {
  bot2.on("registered", (event) => {
    log.debug("event after register", event);
    let channel;
    channel = bot2.channel("#zome-broadcast-feed");
    channel.join();
    // channel.say("hello! from the broadcast feed bot");
  });
  await receiveMessage(bot2);
  await onClose(bot2);
});    


const zomekitConnector = new server(msConfig.services.zomekitConnector);

module.exports = zomekitConnector;
