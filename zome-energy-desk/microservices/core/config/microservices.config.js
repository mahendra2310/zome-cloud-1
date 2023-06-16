
var MODULE_PREFIX = process.env.MODULE_PREFIX || "../../";

exports.services = {
    //Zome SaaS Platform Components
    apiGateway : {
        name: 'apiGateway',
        port: 30000,
        routeIndex: MODULE_PREFIX +'api-gateway/routes/index.route'
    },
    tenancyManager : {
        name: 'tenancyManager',
        port: 30001,
        routeIndex: MODULE_PREFIX +'tenancy-manager/routes/index.route'
    },
    securityManager : {
        name: 'securityManager',
        port: 30002,
        routeIndex: MODULE_PREFIX +'security-manager/routes/index.route'
    },
    scheduler : {
        name: 'scheduler',
        port: 30003,
        routeIndex: MODULE_PREFIX +'scheduler/routes/index.route'
    },
    jobManager : {
        name: 'jobManager',
        port: 30004,
        routeIndex: MODULE_PREFIX +'job-manager/routes/index.route'
    },
    cpowerConnector : {
        name: 'cpowerConnector',
        port: 30005,
        routeIndex: MODULE_PREFIX +'cpower-connector/routes/index.route'
    },
    logixConnector : {
        name: 'logixConnector',
        port: 30006,
        routeIndex: MODULE_PREFIX +'logix-connector/routes/index.route'
    },
    energyManager : {
        name: 'energyManager',
        port: 30007,
        routeIndex: MODULE_PREFIX +'energy-manager/routes/index.route'
    },
    zomekitConnector : {
        name: 'zomekitConnector',
        port: 30008,
        routeIndex: MODULE_PREFIX +'zomekit-connector/routes/index.route'
    },
    metricsAggregator : {
        name: 'metricsAggregator',
        port: 30009,
        routeIndex: MODULE_PREFIX +'metrics-aggregator/routes/index.route'
    },
    mongoDBManager : {
        name: 'mongoDBManager',
        port: 30010,
        routeIndex: MODULE_PREFIX +'mongo-dbmanager/routes/index.route'
    },
    webGateway : {
        name: 'webGateway',
        port: 30011,
        routeIndex: MODULE_PREFIX +'web-gateway/routes/index.route'
    },
    dispatchPrpcessor : {
        name: 'webGateway',
        port: 30012,
        routeIndex: MODULE_PREFIX +'dispatch-processor/routes/index.route'
    },

    //Zome Gateway Components
    zomeGatewayApp : {
        name: 'zomeGatewayApp',
        port: 40000,
        routeIndex: MODULE_PREFIX +'zome-gateway-app/routes/index.route'
    },
    zomeGatewayAgent : {
        name: 'zomeGatewayAgent',
        port: 40001,
        routeIndex: MODULE_PREFIX +'zome-gateway-agent/routes/index.route'
    }

};

