require('newrelic');
global.log = false;
var server = require('zome-server').Server;
var msConfig = require('zome-config').microservices;

var zomeGatewayAgent = new server(msConfig.services.zomeGatewayAgent);

module.exports = zomeGatewayAgent;