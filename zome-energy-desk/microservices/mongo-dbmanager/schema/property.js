var mongoose = require('zome-server').mongoose;
const Schema = mongoose.Schema;

let PropertySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    meter_id: {
        type: String,
        unique: true,
        required: true
    },
    latitude: {
        type: String,
        required: true
    },
    longitude: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    city:{
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    pincode: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    updatedAt: {
        type: Date,
        default: Date.now()
    }
}, { versionKey: false });

module.exports = Gateway = mongoose.model('Property', PropertySchema, 'property');