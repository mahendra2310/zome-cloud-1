var server = require('zome-server').Server;
var msConfig = require('zome-config').microservices;
const schedule = require('node-schedule');

const log = require("zome-server").logger.log;
const rest = require("zome-server").rest;
const job = schedule.scheduleJob('*/1 * * * *', function(){
    console.log('schedule job');
    let callOptions = {
        url: "http://localhost:30005/zomecloud/api/v1/cpower-connector",
        method: 'GET',
        body: {}
    }

    rest.call(
        null,
        callOptions,
        async (err, response, body) => {
            log.debug("=================================================");
            log.debug("Body", body);
            log.debug("Error", response);
            log.debug("Error", err);
            log.debug("=================================================");
        });
});

// This method is running get method every 25 seconds to poll c power api, retreive XML, and port to DB as dispatch event/meter ID
// Uncomment to test c-power API link every 25 seconds

const checkCpowerForEvent = schedule.scheduleJob('0-59/25 * * * * *', function(){
    
    let callOptions = {
        url: "http://localhost:30005/zomecloud/api/v1/cpower-api",
        method: 'GET',
        body: {}
    }

    rest.call(
        null,
        callOptions,
        async (err, response, body) => {
            log.debug("=================================================");
            log.debug("Body", body);
            log.debug("Error", response);
            log.debug("Error", err);
            log.debug("=================================================");
        });

});

var scheduler = new server(msConfig.services.scheduler);

module.exports = scheduler;