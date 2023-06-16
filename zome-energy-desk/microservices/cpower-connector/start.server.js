require('newrelic');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
var server = require('zome-server').Server;
var msConfig = require('zome-config').microservices;

var cpowerConnector = new server(msConfig.services.cpowerConnector);

module.exports = cpowerConnector;