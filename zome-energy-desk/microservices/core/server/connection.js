var log = require('zome-lib').logger.log;
var mongoose = require('mongoose');

// let MONGO_URL = "mongodb://127.0.0.1:27017/develop_zome_power?retryWrites=true&w=majority";
let MONGO_URL = process.env.MONGO_URL // || ``mongodb://dipak:dipak123@3.88.179.144:27017/develop_zome_power?retryWrites=true&w=majority`;

var Connection = async(companyName) => {
    await mongoose
    //.connect(`mongodb+srv://dipak:IswRJKtR2U2ksFUU@zomepower.7pfdj.mongodb.net/${companyName}`,
    .connect(MONGO_URL,
    { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false })
        .then(() => {
            //log.info("connected mongo " + companyName)
            log.info("Connected mongo");
        })
        .catch((err) => {
            log.info("error on connecting " + err)
        });
}

module.exports = Connection;