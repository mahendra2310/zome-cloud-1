const awilix = require('awilix');
const IRCBotController = require('./controllers/irc.bot.controller');
const ZomekitController = require('./controllers/zomekit.connector.controller');

// Create the container and set the injectionMode to PROXY (which is also the default).
const container = awilix.createContainer();
container.register({
    ircBotController: awilix.asClass(IRCBotController),
    zomekitController: awilix.asClass(ZomekitController)
});

module.exports = {
  container
};
