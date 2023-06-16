var mongoose = require('zome-server').mongoose;
const Schema = mongoose.Schema;

let ConfigSchema = new Schema({
    type: {
        type: String,
        required: true
    },
    value: {
        type: Number,
        required: true,
        default: 0
    },
    status: {
        type: Boolean,
        required: true,
    },
}, { timestamp: true ,versionKey: false });

module.exports = Config = mongoose.model('Config', ConfigSchema, 'config');