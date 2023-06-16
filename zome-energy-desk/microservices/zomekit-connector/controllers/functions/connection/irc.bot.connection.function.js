const log = require("zome-server").logger.log;
const IRC = require("irc-framework");

const estIrcBotConnection = async () => {
  log.info("setting up the IRC bot using IRC Client for datafeed");
  const bot = new IRC.Client();
  bot.connect({
    host: process.env.IRC_SERVER,
    port: 6667,
    nick: process.env.IRC_BOT_SYNC_NAME + "_" + (Math.floor(Math.random() * 1000) + 1),
  });
  log.info("IRC bot set up completed for datafeed and connected to IRC server");
  return bot;
};

const estAsyncIrcBotConnection = async () => {
  log.info("setting up the IRC bot using IRC Client for broadcast feed");
  const bot2 = new IRC.Client();
  bot2.connect({
    host: process.env.IRC_SERVER,
    port: 6667,
    nick: process.env.IRC_BOT_ASYNC_NAME + "_" + (Math.floor(Math.random() * 1000) + 1),
  });
  log.info("IRC bot set up completed for broadcast feed and connected to IRC server. bot name: ",bot2.user.nick);
  return bot2;
};

module.exports = {
  estIrcBotConnection,
  estAsyncIrcBotConnection
};
