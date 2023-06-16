var mongoose = require('zome-server').mongoose;
const Schema = mongoose.Schema;


let DispatchEventSchemaCpower = new Schema({
    DemandEventSourceType: {
        type: String,
    },
    IsInternalTestEvent: {
        type: String,
    },
    ResourceId: {
        type: String,
    },
    endDate: {
        type: Date,
    },
    startDate: {
        type: Date,
    },
    eventId: {
        type: String,
    },
    facilityName: {
        type: String,
    },
    isoId: {
        type: String,
    },
    isoName: {
        type: String,
    },
    
    meterId: {
        type: String
    },
    meterName: {
        type: String
    },
    productTypeId: {
        type: String
    },
    productTypeName: {
        type: String
    },
    programName: {
        type: String
    },
    zoneId: {
        type: String
    },
    zoneName: {
        type: String
    },
    cronId: {
        type: String
    },
    gatewayUuid: {
        type: [String],
        default:['c83e36-41ab5a-a8d6-4f04NaN2a243b30','79e790-a56e16-291c-d039NaN1eefebff']
    },
    isCancelled: {
        type: Boolean,
        default: false
    },
    canceledDate: {
        type: Date
    },
    mode: {
        type: String,
        default: 3 //cool
    },
    tempratureValue: {
        type: String,
        default: 3 //cool
    },
    scheduleDate: {
        type: String
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date
    },
    updatedAt: {
        type: Date,
        default: Date.now()
    },
    createdBy: {
        type: String
    },
    updatedBy: {
        type: String
    },
    lastCheck: {
        type: Date,
        default: Date.now()
    },
    otherInfo: {
        type: [String]
    },
    isExcecuted: {
        type: Boolean,
        default: false
    },
}, { versionKey: false });

module.exports = mongoose.model('cpowerEventDetail', DispatchEventSchemaCpower);