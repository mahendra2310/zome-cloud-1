var mongoose = require('zome-server').mongoose;
const Schema = mongoose.Schema;

const QueueSchema = new Schema({
    jobId: { type: mongoose.Schema.Types.ObjectId },
    request: {},
    response: {
        type: Object,
        default: {
            status: 'pending'
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { versionKey: false });

module.exports = Queue = mongoose.model('Queue', QueueSchema, 'queues');