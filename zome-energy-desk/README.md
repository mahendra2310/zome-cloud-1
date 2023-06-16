[![Dev - Upload Zome Backend Application](https://github.com/Zome-Energy-Networks/zome-energy-desk/actions/workflows/dev.yml/badge.svg)](https://github.com/Zome-Energy-Networks/zome-energy-desk/actions/workflows/dev.yml)

# Zome-Energy-Desk
SaaS platform for Zome's Energy Desk, includes Cloud and Device applications

Pre-Req:
Install Node v14 and NPM v6

To run a microservice :
    a. goto microservices/<component> directory using any shell
    b. Run "npm install"
    c. Run "node start.server.js"

Understanding the codebase:

- All the common code is located under core directory
- Information on ports can be found under core/config/microservices.config.js
- Routes to be defined under routes directory of each microservice
- Controllers for each route to be implemented under controllers directory of each microservice
- Logs (info, debug, error) are written under logs directory of each microservice
- Sample API (send-irc-message) is implemented in zomekit-connector.
    To test invoke POST on endpoint http://localhost:30008/zomecloud/api/v1/send-irc-message with below payload
    {
        "channel" : "#datafeed",
        "message" : "message from postman"
    }


![codecov](https://codecov.io/gh/Zome-Energy-Networks/zome-energy-desk/branch/codecov/graph/badge.svg?token=C2WR54N1IN)
