require('newrelic');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
var server = require('zome-server').Server;
const zomeserver = require('zome-server');
var msConfig = require('zome-config').microservices;
const schedule = require('node-schedule');

const log = require("zome-server").logger.log;
const rest = require("zome-server").rest;
var dispatchPrpcessor = new server(msConfig.services.dispatchPrpcessor);


zomeserver.Connection("devZomePower");

module.exports = dispatchPrpcessor;

/--The below function run every one minutes can call checkDispatchEvent Api--/
const job = schedule.scheduleJob('*/1 * * * *', function(){
    console.log('schedule job');
    let callOptions = {
        url: "http://localhost:30012/zomecloud/api/v1/checkDispatchEvent",
        method: 'GET',
        body: {}
    }

    rest.call(
        null,
        callOptions,
        async (err, response, body) => {
            // log.debug("=================================================");
            // log.debug("Body", body);
            // log.debug("Error", response);
            // log.debug("Error", err);
            // log.debug("=================================================");
        });
});
