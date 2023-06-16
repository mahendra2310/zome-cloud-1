var mongoose = require('zome-server').mongoose;
const Schema = mongoose.Schema;

let BuildingSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    propertyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property'
    }, 
    gateways: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Gateway'
        }
    ],
    block: {
        type: String,
        required: true
    },
    address: {
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

module.exports = Gateway = mongoose.model('Building', BuildingSchema, 'building');