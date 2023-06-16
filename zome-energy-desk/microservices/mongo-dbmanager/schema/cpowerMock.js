var mongoose = require('zome-server').mongoose;
const Schema = mongoose.Schema;

let CpowerMockSchema = new Schema({
    meterId: String,
    xmlObj: {
        type: String,
        required: true
    },
    eventId: {
        type: String,
    },
    scheduleTime: {
        type: Date,
    },
    endDate: {
        type: Date,
    },
    startDate: {
        type: Date,
    },
    // this field made for tracking process there is three state initially pending to running to done
    status :{
        type: String,
        default : "pending"
    },
    createdAt: {
        type: Date,
    },
    updatedAt: {
        type: Date,
        default: Date.now()
    },
}, { versionKey: false });

module.exports = CpowerMock = mongoose.model('CpowerMock', CpowerMockSchema, 'cpowerMock');