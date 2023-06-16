var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var log = require('zome-lib').logger.log;
var baseUrl = '/zomecloud/api/v1';
var errLib = require('zome-lib').error;
var responseLib = require('zome-lib').resp;
var cors = require('cors');
// console test code


var factory = function (options) {
    this.service = express();
    this.service.use(cors());
    this.service.use(bodyParser.json({limit: 1024*1024*200, type:'application/json'}));
    this.service.use(bodyParser.urlencoded({extended: true}));
    this.service.use(cookieParser());

    this.service.use(express.static(path.join(__dirname, 'public')));

    this.service.all('*', function (req, res, next) {

        log.debug(req.method + '  ' + req.originalUrl);
        next();
    });

    this.service.use(baseUrl, require(options.routeIndex));

    /// Define error handling routes
    // catch 404 and forward to error handler
    this.service.use(function (req, res, next) {
        log.error(errLib.errorMessages.pageNotFound);
        next(errLib.errorMessages.pageNotFound);
    });


    //General error handler
    this.service.use(function (err, req, res, next) {
        log.error(err);
        responseLib.handleError(err, res);
    });

    return this.service;
}


exports.get = function (options) {
    if (!this.service) {
        this.service = factory(options);
    }
    return this.service;
}