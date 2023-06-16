let Queue = require('bull');
const zomeserver = require("zome-server");
zomeserver.Connection("mongodb://localhost:27017/zome-db");
const Gateway = require("mongo-dbmanager").gatewaymodel;

let allQueues = {};
let bullMQAdapter = [];
const initBullMQ = async() => {
    Gateway.find({}).then(gateways => {

        gateways.forEach(gateway => {
            let senderQueue = new Queue(gateway.gateway_uuid + "-sender");
            // let receiverQueue = new Queue(gateway.gateway_uuid + "-receiver");
            allQueues[gateway.gateway_uuid+"-sender"] = senderQueue;
            // allQueues[gateway.gateway_uuid+"-receiver"] = receiverQueue;
        });
    });
}

initBullMQ();
module.exports.queues = allQueues;