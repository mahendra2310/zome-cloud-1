var mongoose = require('zome-server').mongoose;
const Schema = mongoose.Schema;


let DispatchEventSchema = new Schema({
    irc_request_id_get_device_list: {
        type: String,        
    },
    irc_request_id: {
        type: String,        
    },
    minutes: {
        type: String,        
    },
    cronId: {
        type: String,        
    },
    event_name: {
        type: String,        
    },
    reset_done: {
        type: Boolean,
        default:false
    },
    schedular_date:{
        type: String
    },    
    irc_response:{
        type: String
    },
    excluded_device: [String],
    gateway_devices: [{
        irc_request_id:String,
        set_mod_request_id:String,
        device_id:String,
        device_type:String,
        device_name:String,
        device_uuid:String,
        other_info:String,
        get_mode:{type:Boolean,default:false},
        set_temprature:{type:Boolean,default:false},
        previouse_temprature_info:{
            set_point_type:String,
            set_point_unit:String,
            set_point_temp:String,
            set_point_mode:String

        },
        currunt_mode_temprature_info:{
            set_point_type:String,
            set_point_unit:String,
            set_point_temp:String,
            set_point_mode:String
        },
        final_temprature_info:{
            set_point_type:String,
            set_point_unit:String,
            set_point_temp:String,
            set_point_mode:String
        },
        failed_reason:String,
        dispatch_start_time:String,
        dispatch_end_time:String,
        dispatch_done:{type:Boolean,default:false},
        reset_dispatch_done:{type:Boolean,default:false},
        final_state:String,
        current_state:String,
        previous_state:String,
    }],   

    temprature_mode: {
        type: String
    },
    temprature_value: {
        type: String
    },

    status: {
        type: Number,
        default : 2 // 1= success, 0 = fail 2= in progess, 3 = partial success
    },
    status_description: {
        type: String
    },

    dispatch_type: {
        type: String,
        enums: ["manual", "cpower"],
        default: "cpower"
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
    reset_date_at:{
        type: Date,
        default: Date.now()
    },
    created_at: {
        type: Date,
        default: Date.now()
    },
    updated_at: {
        type: Date,
        default: Date.now()
    },
    created_by: {
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

module.exports = mongoose.model('DispatchEventDetail', DispatchEventSchema);