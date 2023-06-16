var mongoose = require('zome-server').mongoose;
const Schema = mongoose.Schema;

const ircFeedSchema = new Schema({
    requestId: { 
        type: String 
    },
    feed: {
        type: String
    },
    messageChunk: {
        type: Number
    },
    isBroadcast: { type: Boolean, default: false },
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
},{ versionKey: false, timestamps: true });

module.exports = ircFeed = mongoose.model('ircFeed', ircFeedSchema, 'ircFeed');