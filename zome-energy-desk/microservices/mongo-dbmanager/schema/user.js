var mongoose = require('zome-server').mongoose;
const Schema = mongoose.Schema;

let UserSchema = new Schema({
    apartment: {
        type: String,
        unique: true,
    },
    firstName: {
        type: String,
    },
    full_name: {
        type: String
    },
    lastName: {
        type: String
    },
    username: {
        type: String,
        // unique:true
    },
    role: { // super_admin , property-owner, property-manager, tenant
        type: String,
    },
    email: {
        type: String,
        unique: true,
    },
    password: {
        type: String,
    },
    phone: {
        type: String
    },
    account_number: {
        type: String
    },
    profile_pic: {
        type: String,
        default: null
    },
    otp:{
        type: String,
        unique: true,
        // required: true,
    }, 
    state: {
        type: String
    },
    property: {
        type: String
    },
    ESID: {
        type: String
    },
    meterId: {
        type: String
    },
    verifytoken:{
        type: String,
        // required: true,
    },
    // building_id: {
    //     type: String
    // },
    // property_id: {
    //     type: String
    // },
     // it will seet of property owner and property manager
     // it will have more then one for property owner
     // it will have  one for property manager
    properties:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Property' 
        }
    ],
    // it will set of property-manager
     // it will have more then one for property-manager
    buildings:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Building' 
        }
    ],
    // This key will set for Tenant type user
    deviceId:{
        type: String,
        unique: true,
    },
    energyCompanyName: {
        type: String
    },
    date_created: {
        type: Date,
        default: Date.now()
    },
    date_updated: {
        type: Date,
        default: Date.now()
    }, 
}, { versionKey: false });

// module.exports = UserSchema; 
module.exports = User = mongoose.model('User', UserSchema, 'users');
