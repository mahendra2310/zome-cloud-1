var server = require('zome-server').Server;
var msConfig = require('zome-config').microservices;

var metricsAggregator = new server(msConfig.services.metricsAggregator);

module.exports = metricsAggregator;