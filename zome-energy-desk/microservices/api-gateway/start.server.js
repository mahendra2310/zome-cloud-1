require('newrelic');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const zomeserver = require('zome-server');
var server = require('zome-server').Server;
var msConfig = require('zome-config').microservices;
zomeserver.Connection('devZomePower');

var apiGateway = new server(msConfig.services.apiGateway);
module.exports = apiGateway.service;