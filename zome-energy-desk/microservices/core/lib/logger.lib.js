var bunyan = require('bunyan');
var PrettyStream = require('bunyan-prettystream');
var RotatingFileStream = require('bunyan-rotating-file-stream');
var createCWStream = require('bunyan-cloudwatch');
var AWS = require('aws-sdk');


var prettyStdOut = new PrettyStream();
prettyStdOut.pipe(process.stdout);
var logLevel = process.env.LOG_LEVEL || 'info';
var logSource = process.env.LOG_SOURCE || false;

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: 'us-east-1'
});

function reqSerializer(req) {
    if(req) {
        return {
            method: req.method,
            url: req.url
        }
    }
}

function logStreams() {
    if(!global.log) {
        let streamConfigs = [
            {
                level: 'debug',
                type: 'raw',
                stream: prettyStdOut
            },
            {
                type: 'raw',
                level: 'debug',
                stream: new RotatingFileStream({
                    path: './log/app.log',
                    period: '1d',          // daily rotation
                    totalFiles: 3,        // keep 10 back copies
                    rotateExisting: true,  // Give ourselves a clean file when we start up, based on period
                    threshold: '10m',      // Rotate log files larger than 10 megabytes
                    totalSize: '20m',      // Don't keep more than 20mb of archived log files
                    gzip: true             // Compress the archive log files to save space
                })
            },
            {
                type: 'raw',
                level: 'error',
                stream: new RotatingFileStream({
                    path: './log/error.log',
                    period: '1d',          // daily rotation
                    totalFiles: 3,        // keep 10 back copies
                    rotateExisting: true,  // Give ourselves a clean file when we start up, based on period
                    threshold: '10m',      // Rotate log files larger than 10 megabytes
                    totalSize: '20m',      // Don't keep more than 20mb of archived log files
                    gzip: true             // Compress the archive log files to save space
                })
            }
        ];
        return streamConfigs;
    } else {
        let streamConfigs = [
            {
                level: 'debug',
                type: 'raw',
                stream: prettyStdOut
            },
            {
                type: 'raw',
                level: 'debug',
                stream: new RotatingFileStream({
                    path: './log/app.log',
                    period: '1d',          // daily rotation
                    totalFiles: 3,        // keep 10 back copies
                    rotateExisting: true,  // Give ourselves a clean file when we start up, based on period
                    threshold: '10m',      // Rotate log files larger than 10 megabytes
                    totalSize: '20m',      // Don't keep more than 20mb of archived log files
                    gzip: true             // Compress the archive log files to save space
                })
            },
            {
                type: 'raw',
                level: 'error',
                stream: new RotatingFileStream({
                    path: './log/error.log',
                    period: '1d',          // daily rotation
                    totalFiles: 3,        // keep 10 back copies
                    rotateExisting: true,  // Give ourselves a clean file when we start up, based on period
                    threshold: '10m',      // Rotate log files larger than 10 megabytes
                    totalSize: '20m',      // Don't keep more than 20mb of archived log files
                    gzip: true             // Compress the archive log files to save space
                })
            },
            {
                type: 'raw',
                level: 'info',
                stream: createCWStream({
                    logGroupName: 'dev-zome-energy-desk-logs',
                    logStreamName: 'info-stream',
                    cloudWatchLogsOptions: {
                        region: 'us-east-1'
                    },
                    AWS: AWS
                })
            },
            {
                type: 'raw',
                level: 'error',
                stream: createCWStream({
                    logGroupName: 'dev-zome-energy-desk-logs',
                    logStreamName: 'error-stream',
                    cloudWatchLogsOptions: {
                        region: 'us-east-1'
                    }
                })
            },
            {
                type: 'raw',
                level: 'debug',
                stream: createCWStream({
                    logGroupName: 'dev-zome-energy-desk-logs',
                    logStreamName: 'debug-stream',
                    cloudWatchLogsOptions: {
                        region: 'us-east-1'
                    },
                    AWS: AWS
                })
            }
            // {
            //     type: 'rotating-file',
            //     path: './log/app.log',
            //     level: logLevel,
            //     period: '1d',
            //     count: 3
            // },
            // {
            //     type: 'rotating-file',
            //     path: './log/debug.log',
            //     level: 'debug',
            //     period: '1d',
            //     count: 3
            // }
        ];
        return streamConfigs;
    }
}

exports.log = bunyan.createLogger({
    name: 'ZomeLogger',
    src: true,
    serializers: {
        req: reqSerializer,
        err: bunyan.stdSerializers.err,
        res: bunyan.stdSerializers.res
    },
    streams: logStreams()
});