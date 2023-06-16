var server = require('zome-server').Server;
var msConfig = require('zome-config').microservices;

var webGateway = new server(msConfig.services.webGateway);

module.exports = webGateway;