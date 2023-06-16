var mongoose = require('zome-server').mongoose;
const Schema = mongoose.Schema;


let DeviceSchema = new Schema({
    device_uuid: {
        type: String,
        required: true
    },
    device_id: {
        type: String,
        unique: true,
        required: true
    },
    status : {
        type: String,
        default: "On"
    },
    device_info: {
        // DeviceName: String,
        // DeviceID: String,
        // DeviceUUID: String,
        // DeviceNodeID: Number,
        // DeviceType: Number,
        // DeviceAction: String,
        // DeviceBrightness: Number
        // Device status is new field which show current status of devices which is on/off/disconnected
    },
    company_id: {
        type: String
    },
    apartment_id: { 
        type: String
    },
    is_assigned: {
        type: Boolean,
        default: false
    },
    main_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    gateway_id: {
        type: String
    },
    location_id: {
        type: String
    },
    description: {
        type: String
    },
    meta: {},
    is_deleted: {
        type: Boolean
    },
    created_at: {
        type: Date
    },
    updated_at: {
        type: Date
    },
    created_by: {
        type: String
    },
    updated_by: {
        type: String
    },
    last_check: {
        type: Date
    }
},{ versionKey: false });

//In controller we are using with find document of UUID and call updateData with passing newData(object)
//Object required like this
// newData = {
//     deviceInfo: {},
//     companyId: "",
//     gatewayId: "",
//     locationId: "".
//     meta: {},
//     isDeleted: true||false,
//     createdBy: ""
//     updatedBy: ""
// }
DeviceSchema.methods.updateDevice = (newData) => {
    this.device_info.DeviceName = newData.DeviceName;
    this.device_info.DeviceID = newData.DeviceID;
    this.device_info.DeviceUUID = newData.DeviceUUID;
    this.device_info.DeviceNodeID = newData.DeviceNodeID;
    this.device_info.DeviceType = newData.DeviceType;
    this.device_info.DeviceAction = newData.DeviceAction;
    this.device_info.DeviceBrightness = newData.DeviceBrightness;
    this.updated_at = Date.now();
    //this.updated_by = newData.updatedBy;

    return this.save();
}


module.exports = mongoose.model('Devices', DeviceSchema);
