const { Job, QueueEvents, Queue, Worker } = require('bullmq');
const rest = require('zome-server').rest;
const log = require('zome-server').logger.log;

module.exports = {
    addJob: async (req, res, next) => {
        let { queueId = "", jobName = "", jobPayload = {} } = req.body;
        let allQueues = req.allQueues;
        // !Add job to queue
        allQueues[queueId].add(jobPayload);

        res.status(200).json({
            message: "Job added to queue",
            queueId: queueId,
            jobName: jobName,
            jobPayload: jobPayload
        });
    },

    requestToZC: async(job, done) => {
        if (job) {
            const { data } = job;
            console.log(data);
            if (data?.type == "api") {
                let callOptions = data.value;
                rest.call(
                    null,
                    callOptions,
                    async (err, response, body) => {
                        log.debug("Error", err);
                        done();
                        return true;
                    }
                );
            } else {
                done();
                return false;
            }
        }
    },

    processJob: async (req, res, next) => {
        try {
            let allQueues = req.allQueues;
            let setFailedReq = "";
            console.log("allQueues");
            console.log(Object.keys(allQueues));
            for (const queue in allQueues) {
                console.log(queue + 'is processing');
                allQueues[queue].process(async (job, done)=>{
                    if (job) {
                        const { data } = job;
                        if (data?.type == "api") {
                            let responseFromZKC = false;
                            let callOptions = data.value;
                            log.debug("setFailedReq", setFailedReq);
                            if(data?.reqId == setFailedReq){
                                done()
                                log.debug("Job failed");
                            } else {
                                setFailedReq = "";
                                rest.call(
                                    null,
                                    callOptions,
                                    async (err, response, body) => {
                                        responseFromZKC = true;
                                        log.debug("Error", err);
                                        if (err) {
                                            setFailedReq = data?.reqId;
                                        }
                                        log.debug("Data.reqId", data?.reqId);
                                        done();
                                    }
                                );
                                setTimeout(() => {
                                    if(!responseFromZKC) {
                                        done();
                                        setFailedReq = data?.reqId;
                                    }
                                }, 30000);
                            }
                        } else {
                            done();
                        }
                    }
                })
            }
        

            res.status(200).json({
                message: "Job processed"
            });
        } catch (err) {
            console.log(err);
        }
    }
};