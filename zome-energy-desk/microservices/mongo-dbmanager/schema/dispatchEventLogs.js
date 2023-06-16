var mongoose = require('zome-server').mongoose;
const Schema = mongoose.Schema;


let DispatchEventLogsSchema = new Schema({
    irc_request_id: {
        type: String,        
    },
    event_name: {
        type: String,        
    },
    device_id: {
        type: String,        
    },
    command: {
        type: String,        
    },
    command_type: {
        type: String,        
    },
    command_description: {
        type: String,        
    },
    retry_count:{
        type: Number
    },    
    failure_json:{
        type: [String]
    },
    sucees_response_synch:{
        type: [String]
    },
    sucees_response_asynch:{
        type: [String]
    },
    is_success:{
        type:Boolean,
        default:false
    },
    company_id: {
        type: String
    },
    gateway_uuid: {
        type: String
    },
    location_id: {
        type: String
    },    
    is_deleted: {
        type: Boolean,
        default:false
    },
    created_at: {
        type: Date
    },
    updated_at: {
        type: Date,
        default: Date.now()
    },
    created_by: {
        type: String
    },
    reqParams: {
        type: String
    },
    updated_by: {
        type: String
    },
    last_check: {
        type: Date,
        default: Date.now()
    }
},{ versionKey: false });

module.exports = mongoose.model('DispatchEventLogs', DispatchEventLogsSchema);