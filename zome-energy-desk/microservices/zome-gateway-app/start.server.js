require('newrelic');
global.log = false;
var server = require('zome-server').Server;
var msConfig = require('zome-config').microservices;

var zomeGatewayApp = new server(msConfig.services.zomeGatewayApp);

var zomeApp = require('../zome-gateway-app/controllers/zome.gateway.app.controller');
zomeApp.AsyncTcpChan();
zomeApp.SyncTcpChan();

module.exports = zomeGatewayApp;