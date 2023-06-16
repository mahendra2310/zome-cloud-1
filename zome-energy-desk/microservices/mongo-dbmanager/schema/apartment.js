var mongoose = require('zome-server').mongoose;
const Schema = mongoose.Schema;

let ApartmentSchema = new Schema({
    property: {
        type: String,
        required: true
    },
    building: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    meter_id: {
        type: String,
    required: false,
    }, 
    address: {
        type: String,
        required: true
    },
    ESID : {
        type : String
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    vacancyMode : {
        type : String,
        default : "On"
    },
    updatedAt: {
        type: Date,
        default: Date.now()
    }
}, { versionKey: false });

module.exports = Apartment = mongoose.model('Apartment', ApartmentSchema, 'apartment');