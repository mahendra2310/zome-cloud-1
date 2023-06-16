//List of constant variables to reduce string processing
const ADD_DEVICE             = '5000';
const ADD_DEVICE_DSK         = '5001';
const REMOVE_DEVICE          = '5002';
const GET_DEVICE_LIST        = '5003';
const SET_PARAMS             = '5004';
const GET_PARAMS             = '5005';
const GET_ALL_PARAMS_TSTAT   = '5006';
const CONTROLLER_UPDATE      = '5007';  /// not handled yet
const END_DEVICE_UPDATE      = '5008';
const ADD_TO_GROUP           = '5009';
const CONTROL_GROUP          = '5010'; /// not handled yet
const REMOVE_FROM_GROUP      = '5011';
const REMOVE_GROUP           = '5012';
const GROUP_INFO             = '5013'; /// not handled yet
const GET_ALL_PARAMS_SWITCH  = '5014';
const IMAGE_VERSION          = '5015';
const REMOVE_NODE            = '5016';
const MS_VERSION             = '5017';

// control_device <device_id> power on/off
// <deviceid> 5004 71005 90990 
const SET_POWER                          = '71000';
const SET_UTILITY_LOCK                   = '71001';
const SET_AUX_HEAT                       = '71002';
const SET_DISPLAY_UNIT                   = '71003';
const SET_FAN_TIMER                      = '71004';
const SET_MODE                           = '71005';
const SET_TEMPERATURE                    = '71006';
const SET_RECOVERY_MODE                  = '71007';
const SET_TEMP_CALIBRATION               = '71008';
const SET_HUMIDITY_THRESHOLD             = '71009';
const SET_TSTAT_SWING                    = '71010';
const SET_TEMP_REPORT_THRESHOLD          = '71011';
const SET_DIFFERENTIAL_TEMP_MODE         = '71012';
const SET_TEMP_REPORT_FILTER             = '71013';
const SET_POWER_NOTIF                    = '71014';

const GET_SET_POINT_TEMP_VAL             = '81000';
const GET_TEMP_REPORT_THRESHOLD          = '81001';
const GET_HVAC_SETTINGS                  = '81002';
const GET_UTILITY_LOCK                   = '81003';
const GET_TSTAT_POWER_SRC                = '81004';
const GET_HUMIDITY_REPORT_THRESHOLD      = '81005';
const GET_AUX_HEAT                       = '81006';
const GET_TSTAT_SWING                    = '81007';
const GET_DIFFERENTIAL_TEMP_MODE         = '81008';
const GET_TSTAT_RECOVERY_MODE            = '81009';
const GET_TEMP_REPORT_FILTER             = '81010';
const GET_FAN_TIMER                      = '81011';
const GET_TEMP_CALIBRATION               = '81012';
const GET_DISPLAY_UNIT                   = '81013';
const GET_BATTERY_STATUS                 = '81014';
const GET_TSTAT_MODE                     = '81015';
const GET_TSTAT_VERSION                  = '81016';
const GET_LIVE_TEMP                      = '81017';
const GET_POWER_STATUS                   = '81018';
const GET_POWER_NOTIF_STATUS             = '81019';



//All extra params for SET

const SET_TEMP_TYPE_HEATING              = '0';
const SET_TEMP_TYPE_COOLING              = '1';
const SET_TEMP_UNIT_CELSIUS              = '0';
const SET_TEMP_UNIT_FAHRENHEIT           = '1';

//Insert variable here which is define above
module.exports = {
    //Main Command types
    ADD_DEVICE,
    ADD_DEVICE_DSK,
    REMOVE_DEVICE,
    GET_DEVICE_LIST,
    SET_PARAMS,
    GET_PARAMS,
    GET_ALL_PARAMS_TSTAT,
    CONTROLLER_UPDATE,
    END_DEVICE_UPDATE,
    ADD_TO_GROUP,
    CONTROL_GROUP,
    REMOVE_FROM_GROUP,
    REMOVE_GROUP,
    GROUP_INFO,
    GET_ALL_PARAMS_SWITCH,
    IMAGE_VERSION,
    REMOVE_NODE,
    MS_VERSION,
    
    //SET PARAM options
    SET_POWER,
    SET_UTILITY_LOCK,
    SET_AUX_HEAT,
    SET_DISPLAY_UNIT,
    SET_FAN_TIMER,
    SET_MODE,
    SET_TEMPERATURE,
    SET_RECOVERY_MODE,
    SET_TEMP_CALIBRATION,
    SET_HUMIDITY_THRESHOLD,
    SET_TSTAT_SWING,
    SET_TEMP_REPORT_THRESHOLD,
    SET_DIFFERENTIAL_TEMP_MODE,
    SET_TEMP_REPORT_FILTER,
    SET_POWER_NOTIF,


    //GET PARAMS options
    GET_SET_POINT_TEMP_VAL,
    GET_TEMP_REPORT_THRESHOLD,
    GET_HVAC_SETTINGS,
    GET_UTILITY_LOCK,
    GET_TSTAT_POWER_SRC,
    GET_HUMIDITY_REPORT_THRESHOLD,
    GET_AUX_HEAT,
    GET_TSTAT_SWING,
    GET_DIFFERENTIAL_TEMP_MODE,
    GET_TSTAT_RECOVERY_MODE,
    GET_TEMP_REPORT_FILTER,
    GET_FAN_TIMER,
    GET_TEMP_CALIBRATION,
    GET_DISPLAY_UNIT,
    GET_BATTERY_STATUS,
    GET_TSTAT_MODE,
    GET_TSTAT_VERSION,
    GET_LIVE_TEMP,
    GET_POWER_STATUS,
    GET_POWER_NOTIF_STATUS,



    SET_TEMP_TYPE_HEATING,
    SET_TEMP_TYPE_COOLING,
    SET_TEMP_UNIT_CELSIUS,
    SET_TEMP_UNIT_FAHRENHEIT
    
}