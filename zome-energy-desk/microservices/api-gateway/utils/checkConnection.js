var mongoose = require('zome-server').mongoose;
// the below function check if mongoose connection established or not
 const isConnected = async()=>{
    let isConnected = false;
    let MONGO_URL = process.env.MONGO_URL
       await mongoose
      .connect(MONGO_URL,
      { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false, keepAlive: true })
          .then(() => {
            isConnected = true;
          })
          .catch((err) => {
            isConnected = false;
              mongoose.close();
          });
    return isConnected;
}


module.exports = { isConnected }