exports.errorMessages = {
    invalidRequest : {
        statusCode: 400,
        error : {
            code: 'M001',
            message : 'Invalid data provided.'
        }
    },
    pageNotFound : {
        statusCode: 404,
        error: {
            code: 'M002',
            message: 'Page not found.'
        }
    },
    tooManyRequests : {
        statusCode: 429,
        error: {
            code: 'M003',
            message: 'Too many requests'
        }
    },
    serviceUnavailable : {
        statusCode: 503,
        error: {
            code: 'M004',
            message: 'Service is currently unavailable. Please try again after some time'
        }
    },
    internalFailure : {
        statusCode: 500,
        error: {
            code: 'M004',
            message: 'Internal error occured. Server unreachable. Please contact support'
        }
    }
};


