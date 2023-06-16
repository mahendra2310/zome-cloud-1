const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });


const allQueues = require('./create.queue').queues;

module.exports.queues = allQueues;
