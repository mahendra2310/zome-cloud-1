var mongoose = require('zome-server').mongoose;
const Schema = mongoose.Schema;

let GatewaySchema = new Schema({
    gateway_uuid: {
        type: String,
        unique: true,
        required: true
    },
    gateway_name: {
        type: String,
        required: true
    },
    image_version: {
        type: String,
        default: ""
    },
    ms_version: {
        type: String,
        default: ""
    },
    createdAt: {
        type: Date
    },
    updatedAt: {
        type: Date,
        default: Date.now()
    },
    meterId: {
        type: String,
        required: false,
    },
    status: {
        type: String
    },
    country: {
        type: String
    },
    city_state: {
        type: String
    },
    property_id: {
        type:  String,
        required: false
    }
}, { versionKey: false });

module.exports = Gateway = mongoose.model('Gateway', GatewaySchema, 'gateway');