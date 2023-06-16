var log = require('./logger.lib').log;
var errLib = require('./error.lib');


exports.handleError = function(err, res) {
    var statusCode = err.statusCode || 200;
    return res.status(statusCode).json({
        status: 'ERROR',
        statusCode: statusCode,
        language: 'en_US',
        data : null,
        error : err.error || err.message || err
    });
}

exports.handleSuccess = function(data, res) {
    return res.status(200).json({
        status: 'SUCCESS',
        statusCode: 200,
        language: 'en_US',
        'data' : data,
        error : null
    });
}

var handleJsonResponse = function (err, response, body, cb) {
    //handle error
    if (err) {
        // log.error(err);
        console.error(err);
        if (cb) {
            // log.error(err);
            console.error(err);
            return cb(errLib.errorMessages.systemError);
        } else {
            return;
        }
    }

    //JSON parsing is not needed in all cases. Mainly get apis are returned as document and it needs parsing
    var jsonBody = body;
    if (!body.status) {
        jsonBody = jsonParseSafe(body);
    }

    if (!jsonBody.status) {
        // log.error('Response is not in expected format : ' + body);
        console.error('Response is not in expected format : ' + body);
        if (cb) {
            return cb(errLib.errorMessages.invalidResponse);
        } else {
            return;
        }
    }
    //Handle API error
    if (jsonBody.status.toUpperCase() === 'ERROR' || jsonBody.statusCode !== 200) {
        // log.error(jsonBody);
        console.error(jsonBody);
        if (cb) {
            return cb(jsonBody);
        } else {
            return;
        }
    }

    if (cb) {
        return cb(null, jsonBody.data);
    } else {
        return;
    }
};
