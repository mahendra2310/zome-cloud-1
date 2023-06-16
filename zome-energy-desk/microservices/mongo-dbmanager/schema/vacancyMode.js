var mongoose = require('zome-server').mongoose;
const Schema = mongoose.Schema;

let VacancyModeSchema = new Schema({
    property_name: {
        type: String,
        required: true
    },
    gateway_name: {
        type: String,
        required: true,
    },
    gateway_uuid: {
        type: String,
        required: true,
    },
    apt_unit: {
        type: String,
        required: true
    },
    apartment_id: {
        type: String,
        required: true
    },
    device_name: {
        type: String,
        required: true
    },
    device_type: {
        type: String,
        required: true
    },
    device_id: {
        type: String,
        required: true,
    },
    current_value: {
        type: String,
        required: true
    },
    device_status: {
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

module.exports = VacancyMode = mongoose.model('VacancyMode', VacancyModeSchema, 'vacancyMode');