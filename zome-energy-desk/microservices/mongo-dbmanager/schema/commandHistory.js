var mongoose = require('zome-server').mongoose;
const Schema = mongoose.Schema;

//** Model for command history */
const CommandHistorySchema = new Schema({
    request_id: {
        type: String
    },
    gateway_uuid: {
        type: String
    },
    device_id: {
        type: String
    },
    status: {
        type: String
    },
    command_type: {
        type: String
    }
},{ timestamps: true, versionKey: false });

module.exports = mongoose.model('CommandHistory', CommandHistorySchema);