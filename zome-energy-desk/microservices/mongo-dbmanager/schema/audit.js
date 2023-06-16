var mongoose = require('zome-server').mongoose;
const Schema = mongoose.Schema;

const auditSchema = new Schema({
    action: {
        type: String,
    },
    device_info: {
        type: Object,
    },
    command: {
        type: Object,
    },
    command_type: {
        type: String,
    },
    event_id: {
        type: String,
    },
    retry_count: {
        type: Number,
    },
    request_id: {
        type: String,
    },
    request: [],
    response: [],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    createdBy: {
        type: String
    },
    updatedBy: {
        type: String
    },
    meta: {
        type: Object
    },
    isDeleted: {
        type: Boolean,
    }
},{ versionKey: false });

module.exports = Audit = mongoose.model('Audit', auditSchema, 'audits');