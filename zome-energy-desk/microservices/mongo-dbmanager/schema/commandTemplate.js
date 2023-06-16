var mongoose = require('zome-server').mongoose;
const Schema = mongoose.Schema;

const commandTemplateSchema = new Schema({
    bundleName: {
        type: String,
        required: true
    },
    commandsSequence: {
        type: Array,
        required: true
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
},{ versionKey: false, timestamps: true });

module.exports = commandTemplate = mongoose.model('commandTemplate', commandTemplateSchema, 'commandTemplate');