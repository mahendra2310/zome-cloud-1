var mongoose = require('zome-server').mongoose;
const Schema = mongoose.Schema;

const feedbackSchema = new Schema({
    email:{
        type: String,
    }, 
    phoneNumber: {
        type: String,
    },
    deviceType: {
        type: String,
    }, 
    comment: {
        type: String,
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

module.exports = Feedback = mongoose.model('Feedback', feedbackSchema, 'feedbacks');