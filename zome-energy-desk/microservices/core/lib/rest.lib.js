var request = require('request');
var log = require('./logger.lib').log;
var errLib = require('./error.lib');

exports.call = function(req, options, cb) {

    log.info('options before the body');
    log.info(options);
    if(!options.url) {
        throw new Error('Url must be specified');
    }

    if (!options.method) {
        throw new Error ('Rest method must be specified.');
    }

    if (!options.headers) {
        options.headers = {
            'Content-Type': 'application/json'
        };
    }

    if (!options.timeout) {
        options.timeout = parseInt(process.env.CLIENT_TIMEOUT, 10)  || 300000;
    }
    if (!options.body) {
        options.body = {};
    }

    if (options.body) {
        options = {
            ...options,
            body: JSON.stringify(options.body)
        }
    }
    log.info('options for the request call');
    log.info(options);
    var timeStart=new Date();

    request(options, function(error, response, body){

        if (req) {
            log.info({
                totalTime: new Date()-timeStart,
                api:req.originalUrl,
                actualUrl:options.url,
                method: options.method,
                req: req
            }, "Service-ResponseTime");
        } else {
            log.info({
                totalTime: new Date()-timeStart,
                api: null,
                actualUrl:options.url,
                method: options.method,
                req: null
            }, "Service-ResponseTime");
        }

        if(error) {
            log.error({error: error}, "Service-ResponseError");
            if(error.code === 'ECONNREFUSED') {
                return cb(errLib.errorMessages.serviceDown, response);

            } else if (error.code === 'ENOTFOUND') {
                return cb(errLib.errorMessages.serviceDown, response);

            }
        }
        log.info("------------------------------------------- response rest");
        return cb(error, response, body);
    });
};
