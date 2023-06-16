var serviceFactory = require('./service');
var http = require('http');
var https = require('https');
var fs = require('fs');
var path = require('path');
var minTLSVersion = require('minimum-tls-version');
var log = require('zome-lib').logger.log;
// console test code

var Server = function(options) {
    /**
     * Get port from environment and store in Express.
     */

    this.service = serviceFactory.get(options);
    var port = normalizePort(process.env.PORT || options.port);
    this.service.set('port', port);

    var protocol = process.env.PROTOCOL || 'http';
    log.fields.service = options.name;
    var server;

    /**
     * Create HTTP server.
     */
    if (protocol.toString().trim() == 'https') {
        log.info("Starting HTTPS Server with " + (process.env.UV_THREADPOOL_SIZE || 4) + " threads");

        var serverCertsPath = path.join(__dirname,'certs', 'server');
        var caCertsPath = path.join(__dirname,'certs', 'ca');

        require('ssl-root-cas').inject().addFile(path.join(caCertsPath , 'ca.crt.pem'));

        var options = {
            key: fs.readFileSync(path.join(serverCertsPath, 'server.key.pem')),
            cert: fs.readFileSync(path.join(serverCertsPath, 'server.crt.pem')),
            crl: fs.readFileSync(path.join(caCertsPath,'ca.crl.pem')),
            requestCert: true,
            secureOptions: minTLSVersion('tlsv12')
        };

        server = https.createServer(options, service);
    } else {
        log.info("Starting HTTP Server with " + (process.env.UV_THREADPOOL_SIZE || 4) + " threads");
        server = http.createServer(service);
    }


    /*
     * Set server timeout to 5 mins. Default is 2 mins
     */
    server.timeout = parseInt(process.env.SERVER_TIMEOUT, 10) || 300000;

    /**
     * Listen on provided port, on all network interfaces.
     */

    server.listen(port);

    /**
     * Event listener for HTTP server "error" event.
     */
    server.on('error', function (error) {
        if (error.syscall !== 'listen') {
            throw error;
        }

        var bind = typeof port === 'string'
            ? 'Pipe ' + port
            : 'Port ' + port;

        // handle specific listen errors with friendly messages
        switch (error.code) {
            case 'EACCES':
                log.error(bind + ' requires elevated privileges');
                process.exit(1);
                break;
            case 'EADDRINUSE':
                log.error(bind + ' is already in use');
                process.exit(1);
                break;
            default:
                throw error;
        }
    });

    /**
     * Event listener for HTTP server "listening" event.
     */
    server.on('listening', function () {
        var addr = server.address();
        var bind = typeof addr === 'string'
            ? 'pipe ' + addr
            : 'port ' + addr.port;
        log.info('Listening on ' + bind);
    });
}

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort (val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}


module.exports = Server;