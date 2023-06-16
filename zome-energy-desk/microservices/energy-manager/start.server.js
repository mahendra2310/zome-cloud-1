var server = require('zome-server').Server;
var msConfig = require('zome-config').microservices;

var energyManager = new server(msConfig.services.energyManager);

module.exports = energyManager;