var mongoose = require('zome-server').mongoose;
const Schema = mongoose.Schema;

let RoleSchema = new Schema({
    role_name: {
        type: String
    },
    permission: [],
    date_created: {
        type: Date,
        default: Date.now()
    },
    date_updated: {
        type: Date,
        default: Date.now()
    }
},{ versionKey: false });

module.exports = Role = mongoose.model('Role', RoleSchema, 'roles');