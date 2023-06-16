require('newrelic');

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const rest = require('zome-server').rest;
const { createBullBoard } = require('bull-board')
const { BullAdapter } = require('bull-board/bullAdapter')
const { BullMQAdapter } = require('bull-board/bullMQAdapter')


var express = require('zome-server').express;
const log = require('zome-server').logger.log;
const allQueues = require('./create.queue').queues;
const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


const queueRoutes = require('./routes/index.route');
setTimeout(() => {
    let bullMQAdapter = [];
    
    for (const queue in allQueues) {
        bullMQAdapter.push(new BullMQAdapter(allQueues[queue]));
        console.log(queue + 'is processing');
        allQueues[queue].process(async (job, done)=>{
            if (job) {
                let { data } = job;
                data.value.body.jobId = data.jobId;
                console.log(data);
                if (data?.type == "api") {
                    let responseFromZKC = false;
                    let callOptions = data.value;
                    rest.call(
                        null,
                        callOptions,
                        async (err, response, body) => {
                            responseFromZKC = true;
                            log.debug("Error", err);
                            done();
                        }
                    );
                    setTimeout(() => {
                        if(!responseFromZKC) {
                            done();
                        }
                    }, 30000);
                } else {
                    done();
                }
            }
        })
    }
    const { router, setQueues, replaceQueues, addQueue, removeQueue } = createBullBoard(bullMQAdapter);
    app.use('/bull-board', router);
    app.use('/queues', (req, res, next) => { req.allQueues = allQueues; next(); },queueRoutes);
    app.listen(30004, () => {
        console.log('listening on port 30004');
    });
}, 5000);