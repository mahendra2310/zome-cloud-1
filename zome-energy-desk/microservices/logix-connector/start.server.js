var server = require('zome-server').Server;
var msConfig = require('zome-config').microservices;

var logixConnector = new server(msConfig.services.logixConnector);

module.exports = logixConnector;