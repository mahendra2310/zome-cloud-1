var server = require('zome-server').Server;
var msConfig = require('zome-config').microservices;

var tenancyManager = new server(msConfig.services.tenancyManager);

module.exports = tenancyManager;