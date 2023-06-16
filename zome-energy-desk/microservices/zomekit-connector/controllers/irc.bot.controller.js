//TODO: Use this file later for the awilix (DI) 
// IRCBot functions goes here
const log = require("zome-server").logger.log;

class IRCBotController {

  constructor(opts) {
    log.info("setting up the IRCBot");
  }

  async initializeAsyncIrcBot() {
    log.info("initializing the async IRC bot...");
    log.info("IRC async bot initializing process is completed");
  }

  async initializeSyncIrcBot() {
    log.info("initializing the sync IRC bot...");
    log.info("IRC sync bot initializing process is completed");
  }
}

module.exports = IRCBotController;
