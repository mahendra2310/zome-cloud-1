var mongoose = require('zome-server').mongoose;
const Schema = mongoose.Schema;

const HistoryLogSchema = new Schema({
    action_details: {
        type: String,
        required: true
    },
    control: {
        type: String,
        required: true
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    device_id: {
        type: String,
    },
    customFields: {
        type: Object,
        required: false
    },
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

module.exports = mongoose.model('HistoryLog', HistoryLogSchema);