var mongoose = require('zome-server').mongoose;
const Schema = mongoose.Schema;

const asyncAuditSchema = new Schema({
    device_id: {
        type: String,
    },
    gateway_id: {
        type: String,
    },
    asyncMsg: {
        type: Object,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
},{ versionKey: false });

module.exports = AsyncAudit = mongoose.model('AsyncAudit', asyncAuditSchema, 'asyncAudits');