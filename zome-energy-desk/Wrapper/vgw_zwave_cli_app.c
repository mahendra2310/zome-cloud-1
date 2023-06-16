#include"../include/vgw_zwave_cli_app.h"
#include "vgw_devmgr_zwave_lib.h"

#include <stdio.h>
#include <string.h>
#include <stdlib.h>

#include <arpa/inet.h>    //close  
#include <sys/types.h>  
#include <sys/socket.h> 
#include <netinet/in.h>  
#include <sys/time.h> //FD_SET, FD_ISSET, FD_ZERO macros

#define MAX_CMD_LEN 200
#define MAX_ARG_CNT 10
#define MAX_KEY_LEN 50
#define KEY_LEN     5
#define SUCCESS     0
#define FAIL        1

//List of #defined variables to reduce string processing
#define ADD_DEVICE              5000
#define ADD_DEVICE_DSK          5001
#define REMOVE_DEVICE           5002
#define GET_DEVICE_LIST         5003
#define SET_PARAMS              5004
#define GET_PARAMS              5005
#define GET_ALL_PARAMS_TSTAT    5006
#define CONTROLLER_UPDATE       5007
#define END_DEVICE_UPDATE       5008
#define ADD_TO_GROUP            5009
#define CONTROL_GROUP           5010
#define REMOVE_FROM_GROUP       5011
#define REMOVE_GROUP            5012
#define GROUP_INFO              5013
#define GET_ALL_PARAMS_SWITCH   5014
#define IMAGE_VERSION           5015
#define REMOVE_NODE 		5016

// control_device <device_id> power on/off
// <deviceid> 5004 71005 90990 
#define SET_POWER                           71000
#define SET_UTILITY_LOCK                    71001
#define SET_AUX_HEAT                        71002
#define SET_DISPLAY_UNIT                    71003
#define SET_FAN_TIMER                       71004
#define SET_MODE                            71005
#define SET_TEMPERATURE                     71006
#define SET_RECOVERY_MODE                   71007
#define SET_TEMP_CALIBRATION                71008
#define SET_HUMIDITY_THRESHOLD              71009
#define SET_TSTAT_SWING                     71010
#define SET_TEMP_REPORT_THRESHOLD           71011
#define SET_DIFFERENTIAL_TEMP_MODE          71012
#define SET_TEMP_REPORT_FILTER              71013
#define SET_POWER_NOTIF                     71014

#define GET_SET_POINT_TEMP_VAL              81000
#define GET_TEMP_REPORT_THRESHOLD           81001
#define GET_HVAC_SETTINGS                   81002
#define GET_UTILITY_LOCK                    81003
#define GET_TSTAT_POWER_SRC                 81004
#define GET_HUMIDITY_REPORT_THRESHOLD       81005
#define GET_AUX_HEAT                        81006
#define GET_TSTAT_SWING                     81007
#define GET_DIFFERENTIAL_TEMP_MODE          81008
#define GET_TSTAT_RECOVERY_MODE             81009
#define GET_TEMP_REPORT_FILTER              81010
#define GET_FAN_TIMER                       81011
#define GET_TEMP_CALIBRATION                81012
#define GET_DISPLAY_UNIT                    81013
#define GET_BATTERY_STATUS                  81014
#define GET_TSTAT_MODE                      81015
#define GET_TSTAT_VERSION                   81016
#define GET_LIVE_TEMP                       81017
#define GET_POWER_STATUS                    81018
#define GET_POWER_NOTIF_STATUS              81019

#define PORT 9090
#define PORT_ASYNC 9091
#define PORT_SYNC  9092

char key[MAX_KEY_LEN] = "";

char asyncGlobalStr[2048] = "";

int globCount = 0;

static void exit_app(int signum)
{
    printf("Exiting..\n");
    vgw_dev_mgr_zwave_deinit();
    exit(0);
}

void vgw_zwave_test_app_help()
{
	printf("\n------------------------------------\n");
	printf("add_zwave_device <for S0 device>\n");
    printf("add_zwave_device <dsk for S2 device>\n"); 
    printf("remove_zwave_device\n");
    printf("status_all\n");
    printf("control_device <device_id> <control_type> <param 1> <param 2>...\n");
	printf("<control type> <param n>:\n");
	printf("\t power <ON/OFF> \n");
	printf("\t utility_lock <1/0> //1 for Enable, 0 for Disable \n");
	printf("\t aux_heat <1/0> //1 for Enable, 0 for Disable \n");
	printf("\t set_unit <unit> //0 for Fahrenheit, 1 for Celsius\n");
	printf("\t set_fan_timer <timer> //0 for always ON, 1 for 15, 2 for 30, 3 for 60 mins\n");
	printf("\t set_mode <mode> //1.OFF 2.HEAT 3.COOL 4.AUTO\n");
	printf("\t set_temp <type> <unit> <temp_val> // <type> - 0 for heating, 1 for cooling \n\t\t"
							"<unit> - 0 for Celsius and 1 for Fahrenheit\n\t\t"
							"<temp_val> - 35F to 95F, 2C to 34C\n");							
	printf("\t set_recovery_mode <mode> //1 for fast, 2 for economy mode\n");
	printf("\t temp_calibration <degree> //range from -6 to 6 degree Fahrenheit\n");
	printf("\t set_humidity_thr <threshold> \n\t\t0 for disable, "
	"1 for 3 percent, 2 for 5 percent and 3 for 10 percent relative humidity\n");
	printf("\t tstat_swing <degree> //range from 1 to 8 degree Fahrenheit\n"
			"\t\tNote: Temperature will be set by (degree/2) value\n");
	printf("\t temp_rpt_thr <threshold> //range from 1 to 4 degree Fahrenheit\n"
			"\t\tNote: Temperature will be set by (degree/2) value\n");
	printf("\t set_diff_temp <mode><temp> \n\t\t<mode> - 0 for Heat mode " 
		"/ 1 for cool mode\n\t\t<temp> - diff temp range valid for 2 to 6 degree Fahrenheit\n");	
	printf("\t set_temp_rpt_filter <lower_bound_temp_filter> <upper_bound_temp_filter>\n"
			"\t\t<filter> - 0F to 124F\n");
	printf("\t set_cur_overload_prot <1/0> //1 for Enable, 0 for Disable \n");
	printf("\t led_status //0 for last status, 1 for always on, 2 for always off\n");
	printf("\t set_watt_report <1/0> //1 for Enable, 0 for Disable \n");
	printf("\t set_wattage_rpt_thr <thr> // valid from from 0 to 32767 watt\n");
	printf("\t set_wattage_rpt_per_thr <per> // valid from  0 to 100 percent\n");
	printf("\t set_lock_config <1/0> //1 for Enable, 0 for Disable \n");
	printf("\t set_partner_id <id> //0 for Aeotec standard product, 1 to 255 for Others \n");
    printf("get_params <device_id> <param>\n");
	printf("<param>:\n");
	printf("\t temp_val <mode> // 1 for heating  2 for cooling\n");
	printf("\t temp_rpt_thr\n\t hvac_settings\n\t utility_lock\n");
	printf("\t tstat_power_src\n\t humidity_rpt_thr\n");
	printf("\t aux_heat\n\t tstat_swing\n\t diff_mode_and_temp\n");
	printf("\t tstat_recovery_mode\n\t temp_rpt_filter\n");
	printf("\t fan_timer\n\t temp_calibration\n\t display_unit\n");
	printf("\t battery\n\t tstat_modes\n");
	printf("\t tstat_sw_ver\n\t energy_cons\n");
	printf("\t current_overload_prot\n\t led_status\n");
	printf("\t get_watt_report\n");
	printf("\t wattage_rpt_thr\n\t wattage_rpt_per_thr\n");
	printf("\t partner_id\n\t lock_config\n");
	printf("get_all_params_tstat <device_id> \n");
	printf("get_all_params_smartswitch <device_id> \n");
    printf("controller_update <file_path> \n");
    printf("end_device_update <node_id> <file_path> \n");
    printf("add_to_group <group_no> <device_id> \n");
    printf("control_group <group_no> <ON/OFF> \n");
    printf("remove_from_group <group_no> <device_id> \n");
    printf("remove_group <group_no> \n");
    printf("group_info\n");
    printf("------------------------------------\n");
}

static void vgw_zwave_hvac_setting(vgw_dm_zwave_rpt_data_t *hvac_data)
{
	uint8_t lower_nibble, upper_nibble, byte = 0;
	for(byte = 0; byte < 4; byte ++)
	{
		lower_nibble = hvac_data->data[byte] & 0x0F;
		upper_nibble = (hvac_data->data[byte] & 0xF0) >> 4;

		/* For Byte 1 */
		if(byte == 0)
		{
			if(lower_nibble == 0x00)
				sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"HVAC Heating Type : None\n");
			if(lower_nibble == 0x01)
				sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"HVAC Heating Type : ForcedAir\n");
			if(lower_nibble == 0x02)
				sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"HVAC Heating Type : Heat-Pump\n");
			if(lower_nibble == 0x03)
				sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"HVAC Heating Type : Radiator\n");

			if(upper_nibble == 0x00)
				sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"HVAC Cooling Type : None\n");
			if(upper_nibble == 0x01)
				sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"HVAC Cooling Type : AirCon\n");
			if(upper_nibble == 0x02)
				sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"HVAC Cooling Type : Heat-Pump\n");
			if(upper_nibble == 0x03)
				sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"HVAC Cooling Type : Evaporative\n");
		}
		
		/* For Byte 2 */
		if(byte == 1)
		{
			if(lower_nibble == 0x01)
				sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"HVAC Heat/Aux Stages : 1\n");
			if(lower_nibble == 0x02)
				sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"HVAC Heat/Aux Stages : 2\n");

			if(upper_nibble == 0x01)
				sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"HVAC Heating Fuel : Gas\n");
			if(upper_nibble == 0x02)
				sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"HVAC Heating Fuel : Electric\n");
			if(upper_nibble == 0x03)
				sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"HVAC Heating Fuel : Oil\n");
			if(upper_nibble == 0x04)
				sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"HVAC Heating Fuel : Geothermal\n");
			if(upper_nibble == 0x05)
				sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"HVAC Heating Fuel : Propane\n");
		}

		/* For Byte 3 */
		if(byte == 2)
		{
			if(lower_nibble == 0x00)
				sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"HVAC Heat Pump Stages : None\n");
			if(lower_nibble == 0x01)
				sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"HVAC Heat Pump Stages : 1\n");
			if(lower_nibble == 0x02)
				sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"HVAC Heat Pump Stages : 2\n");

			if(upper_nibble == 0x01)
				sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"HVAC A Terminal : Humidify\n");
			if(upper_nibble == 0x02)
				sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"HVAC A Terminal : Dehumidify\n");
			if(upper_nibble == 0x03)
				sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"HVAC A Terminal : EX\n");
			if(upper_nibble == 0x03)
				sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"HVAC A Terminal : W3\n");
		}

		/* For Byte 4 */
		if(byte == 3)
		{
			if(lower_nibble == 0x00)
				sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"HVAC Cooling Stages : None\n");
			if(lower_nibble == 0x01)
				sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"HVAC Cooling Stages : 1\n");
			if(lower_nibble == 0x02)
				sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"HVAC Cooling Stages : 2\n");

			if(upper_nibble == 0x01)
				sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"HVAC O/B Terminal : O\n");
			if(upper_nibble == 0x02)
				sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"HVAC O/B Terminal : B\n");
		}
	}
}

void vgw_zwave_test_app_report_callback(void* user_data, vgw_dm_zwave_rpt_data_t *report_data)
{
	int sock = 0;
    struct sockaddr_in serv_addr;
		
	//Create a socket and ready it
	
	if ((sock = socket(AF_INET, SOCK_STREAM, 0)) < 0)
    {
        printf("\n Socket creation error \n");
        return;
    }
		
	serv_addr.sin_family = AF_INET;
    serv_addr.sin_port = htons(PORT_ASYNC);
	
	if(inet_pton(AF_INET, "127.0.0.1", &serv_addr.sin_addr)<=0) 
    {
        printf("\nInvalid address/ Address not supported \n");
        return;
    }
   
    if (connect(sock, (struct sockaddr *)&serv_addr, sizeof(serv_addr)) < 0)
    {
        printf("\nConnection Failed \n");
        return;
    }

	strcpy(asyncGlobalStr, "");
	//We have created the socket. Now add all the info in a buff to send it out to the Agent.
		
	if((strcmp(report_data->device_id, "") == 0) || (strcmp(report_data->device_id, "NONE") == 0)){
                if(report_data->report == VGW_DM_ZWAVE_REPORT_SW_VER)
                {
			sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Controller Version : %s\n", report_data->data);
			send(sock , asyncGlobalStr , strlen(asyncGlobalStr) , 0 );
			close(sock);
			return;
                }
		else{
			close(sock);
			return;
		}
	}

	//memset(asyncGlobalStr, 0, 2048);
	
	if( report_data->report ){
	sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"device id : %s\n", report_data->device_id);
	}

	if(report_data->report == VGW_DM_ZWAVE_REPORT_TEMP_RPT_THR)
	{
		if(report_data->data[0] == 0x00)
			sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Temperature reporting threshold : Disable Reporting \n");
		else if(report_data->data[0] == 0x01)
			sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Temperature reporting threshold : 0.5 degree Fahrenheit \n");
		else if(report_data->data[0] == 0x02)
			sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Temperature reporting threshold : 1.0 degree Fahrenheit \n");
		else if(report_data->data[0] == 0x03)
			sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Temperature reporting threshold : 1.5 degree Fahrenheit \n");
		else if(report_data->data[0] == 0x04)
			sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Temperature reporting threshold : 2.0 degree Fahrenheit \n");
	}
	else if(report_data->report == VGW_DM_ZWAVE_REPORT_HVAC_SETTINGS)
	{
		vgw_zwave_hvac_setting(report_data);
	}
	else if(report_data->report == VGW_DM_ZWAVE_REPORT_UTILITY_LOCK)
	{
		if(report_data->data[0] == 0x00)
			sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Utility Lock : Disabled \n");
		else if(report_data->data[0] == 0x03)
			sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Utility Lock : Enabled \n");
	}
	else if(report_data->report == VGW_DM_ZWAVE_REPORT_TSTAT_PWR_SRC)
	{
		if(report_data->data[0] == 0x01)
			sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Power source : C-Wire \n");
		else if(report_data->data[0] == 0x02)
			sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Power source : Batteries \n");
	}
	else if(report_data->report == VGW_DM_ZWAVE_REPORT_HUMIDITY_RPT_THR)
	{ 
		if(report_data->data[0] == 0x00)
			sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Humidity reporting Threshold : Disabled \n");
		else if(report_data->data[0] == 0x01)
			sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Humidity reporting Threshold : 3 percent Relative Humidity \n");
		else if(report_data->data[0] == 0x02)
			sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Humidity reporting Threshold : 5 percent Relative Humidity \n");
		else if(report_data->data[0] == 0x03)
			sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Humidity reporting Threshold : 10 percent Relative Humidity \n");
	}
	else if(report_data->report == VGW_DM_ZWAVE_REPORT_AUX_HEAT)
	{ 
		if(report_data->data[0] == 0x00)
			sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Auxiliary Heat : Disabled \n");
		else if(report_data->data[0] == 0x01)
			sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Auxiliary Heat : Enabled \n");
	}
	else if(report_data->report == VGW_DM_ZWAVE_REPORT_TSTAT_SWING)
	{ 
		if(report_data->data[0] == 0x00)
			sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Swing Temperature : Not supported \n");
		else if(report_data->data[0] == 0x01)
			sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Swing Temperature : 0.5 degree Fahrenheit \n");
		else if(report_data->data[0] == 0x02)
			sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Swing Temperature : 1.0 degree Fahrenheit \n");
		else if(report_data->data[0] == 0x03)
			sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Swing Temperature : 1.5 degree Fahrenheit \n");
		else if(report_data->data[0] == 0x04)
			sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Swing Temperature : 2.0 degree Fahrenheit \n");
		else if(report_data->data[0] == 0x05)
			sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Swing Temperature : 2.5 degree Fahrenheit \n");
		else if(report_data->data[0] == 0x06)
			sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Swing Temperature : 3.0 degree Fahrenheit \n");
		else if(report_data->data[0] == 0x07)
			sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Swing Temperature : 3.5 degree Fahrenheit \n");
		else if(report_data->data[0] == 0x08)
			sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Swing Temperature : 4.0 degree Fahrenheit \n");
	}
	else if(report_data->report == VGW_DM_ZWAVE_REPORT_DIFF_MODE_AND_TEMP)
	{
		sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Heating Differential Temperature : %d degree Fahrenheit\n",
											((report_data->data[0])/2));
		sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Cooling Differential Temperature : %d degree Fahrenheit\n",
											((report_data->data[1])/2));
	}
	else if(report_data->report == VGW_DM_ZWAVE_REPORT_TSTAT_RECOVERY_MODE)
	{ 
		if(report_data->data[0] == 0x01)
			sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Recovery Mode : Fast Mode \n");
		else if(report_data->data[0] == 0x02)
			sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Recovery Mode : Economy Mode \n");
	}
	else if(report_data->report == VGW_DM_ZWAVE_REPORT_TEMP_RPT_FILTER)
	{ 
		sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Lower Bound Temperature Filter : %d degree Fahrenheit \n", 
														report_data->data[0]);
		sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Upper Bound Temperature Filter : %d degree Fahrenheit \n", 
														report_data->data[1]);
	}
	else if(report_data->report == VGW_DM_ZWAVE_REPORT_FAN_TIMER)
	{ 
		if(report_data->data[0] == 0x00)
			sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Fan timer : Always ON \n");
		else if(report_data->data[0] == 0x0F)
			sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Fan timer : 15 minutes \n");
		else if(report_data->data[0] == 0x1E)
			sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Fan timer : 30 minutes \n");
		else if(report_data->data[0] == 0x3C)
			sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Fan timer : 60 minutes \n");
	}
	else if(report_data->report == VGW_DM_ZWAVE_REPORT_TEMP_CALIBRATION)
	{ 
		if(report_data->data[0] == 0xFA)
			sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Temperature Calibration : -6.0 degree Fahrenheit \n");
		else if(report_data->data[0] == 0xFB)
			sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Temperature Calibration : -5.0 degree Fahrenheit \n");
		else if(report_data->data[0] == 0xFC)
			sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Temperature Calibration : -4.0 degree Fahrenheit \n");
		else if(report_data->data[0] == 0xFD)
			sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Temperature Calibration : -3.0 degree Fahrenheit \n");
		else if(report_data->data[0] == 0xFE)
			sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Temperature Calibration : -2.0 degree Fahrenheit \n");
		else if(report_data->data[0] == 0xFF)
			sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Temperature Calibration : -1.0 degree Fahrenheit \n");
		else if(report_data->data[0] == 0x00)
			sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Temperature Calibration : +0.0 degree Fahrenheit \n");
		else if(report_data->data[0] == 0x01)
			sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Temperature Calibration : +1.0 degree Fahrenheit \n");
		else if(report_data->data[0] == 0x02)
			sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Temperature Calibration : +2.0 degree Fahrenheit \n");
		else if(report_data->data[0] == 0x03)
			sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Temperature Calibration : +3.0 degree Fahrenheit \n");
		else if(report_data->data[0] == 0x04)
			sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Temperature Calibration : +4.0 degree Fahrenheit \n");
		else if(report_data->data[0] == 0x05)
			sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Temperature Calibration : +5.0 degree Fahrenheit \n");
		else if(report_data->data[0] == 0x06)
			sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Temperature Calibration : +6.0 degree Fahrenheit \n");               
	}
	else if(report_data->report == VGW_DM_ZWAVE_REPORT_DISPLAY_UNIT)
	{
		if(report_data->data[0] == 0x00)
			sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Display Units : Fahrenheit \n");
		else if(report_data->data[0] == 0x01)
			sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Display Units : Celsius \n");
	}
	else if(report_data->report == VGW_DM_ZWAVE_REPORT_FAN_MODE_LOW)
		sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Fan Mode : Low \n");
	else if(report_data->report == VGW_DM_ZWAVE_REPORT_FAN_MODE_AUTO_LOW)
		sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Fan Mode : Auto Low \n");
	else if(report_data->report == VGW_DM_ZWAVE_REPORT_FAN_STATE_IDLE)
		sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Fan State : Idle \n");
	else if(report_data->report == VGW_DM_ZWAVE_REPORT_FAN_STATE_RUNNING_LOW)
		sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Fan State : Running \n");
	else if(report_data->report == VGW_DM_ZWAVE_REPORT_THERMO_OP_STATE_IDLE)
		sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Thermostat OpState : Idle \n");
	else if(report_data->report == VGW_DM_ZWAVE_REPORT_THERMO_OP_STATE_HEAT)
		sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Thermostat OpState : Heat \n");
	else if(report_data->report == VGW_DM_ZWAVE_REPORT_THERMO_OP_STATE_COOL)
		sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Thermostat OpState : Cool \n");
	else if(report_data->report == VGW_DM_ZWAVE_REPORT_THERMO_OP_STATE_FAN)
		sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Thermostat OpState : Fan \n");
	else if(report_data->report == VGW_DM_ZWAVE_REPORT_THERMO_MD_OFF)
		sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Thermostat mode : Off \n");
	else if(report_data->report == VGW_DM_ZWAVE_REPORT_THERMO_MD_HEAT)
		sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Thermostat mode : Heat \n");
	else if(report_data->report == VGW_DM_ZWAVE_REPORT_THERMO_MD_COOL)
		sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Thermostat mode : Cool \n");
	else if(report_data->report == VGW_DM_ZWAVE_REPORT_THERMO_MD_AUTO)
		sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Thermostat mode : Auto \n");
	else if(report_data->report == VGW_DM_ZWAVE_REPORT_THERMO_SETP_TYPE_HEATING)
	{
		sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Thermostat setpoint type : Heating \n");
		if(report_data->data[0])
			sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Thermostat setpoint unit : Fahrenheit \n");
		else
			sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Thermostat setpoint unit : Celsius \n");	
		sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Thermostat setpoint temp : %d\n", report_data->data[1]);
	}
	else if(report_data->report == VGW_DM_ZWAVE_REPORT_THERMO_SETP_TYPE_COOLING)
	{
		sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Thermostat setpoint type : Cooling \n");
		if(report_data->data[0])
			sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Thermostat setpoint unit : Fahrenheit \n");
		else
			sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Thermostat setpoint unit : Celsius \n");
		sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Thermostat setpoint temp : %d\n", report_data->data[1]);
	}
	else if(report_data->report == VGW_DM_ZWAVE_REPORT_THERMO_TEMP)
        {
                uint16_t temp_val = ((report_data->data[0] << 0x08) | (report_data->data[1]));
                if(report_data->unit == 0x00)
			sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Thermostat temp: %d Celsius\n", temp_val);
                else
			sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Thermostat temp: %d Fahrenheit\n", temp_val);
        }
	else if(report_data->report == VGW_DM_ZWAVE_REPORT_THERMO_HUMI)
	{
		uint16_t humi_val = ((report_data->data[0] << 0x08) | (report_data->data[1]));
		sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Thermostat humi : %d \n", humi_val);
	}
	else if(report_data->report == VGW_DM_ZWAVE_REPORT_BATTERY)
        {
		if(report_data->data[0] == 0xFF)
			sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Battery Warning : Low Battery !! \n");
		else
			sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Thermostat battery level : %d \n", report_data->data[0]);
	}
       
	else if(report_data->report == VGW_DM_ZWAVE_REPORT_ENERGY_CONSUMPTION)
    {
		float result;
		result =(float)(((report_data->data[0] << 24) + (report_data->data[1] << 16) 
											+ (report_data->data[2] << 8)+ (report_data->data[3]))/1000.f); 
		sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Energy consumption in KWH : %f \n", result);
    }
	
	else if(report_data->report == VGW_DM_ZWAVE_REPORT_NODE_RESET)
		sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Device reset : Ongoing\n");

	else if(report_data->report == VGW_DM_ZWAVE_REPORT_SW_VER)
	{
		sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Software Version : device id: %s\n", report_data->device_id);
		sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Version Info : Z-V%d.%d\n", report_data->data[0], report_data->data[1]);
		sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Software Version : PD-%s\n", report_data->ver);
	}
	else if(report_data->report == VGW_DM_ZWAVE_REPORT_OVERLOAD_PROTECTION)
	{
		if(report_data->data[0] == 0x00)
			sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Current Overload Protection: Disabled \n");
		else if(report_data->data[0] == 0x01)
			sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Current Overload Protection: Enabled \n");
	}
	else if(report_data->report == VGW_DM_ZWAVE_REPORT_LED_STATUS)
	{
		if(report_data->data[0] == 0x00)
			sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"LED status: Last status \n");
		else if(report_data->data[0] == 0x01)
			sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"LED status: Always ON \n");
		else if(report_data->data[0] == 0x02)
			sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"LED status: Always OFF \n");
	}
	else if(report_data->report == VGW_DM_ZWAVE_REPORT_CONFIG_WATTAGE_CHANGE_RPT)
	{
		if(report_data->data[0] == 0x00)
			sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Change in wattage :  Disabled \n");
		else if(report_data->data[0] == 0x01)
			sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Change in wattage : Enabled \n");
	}
	else if(report_data->report == VGW_DM_ZWAVE_REPORT_CHANGE_IN_WATT)
	{
		sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Minimum change in wattage : %d\n", 
							((report_data->data[1] << 0x08) | report_data->data[0]));
	}
	else if(report_data->report == VGW_DM_ZWAVE_REPORT_CHANGE_IN_WATT_PER)
	{
		sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Minimum change in wattage percent : %d\n", 
							report_data->data[0]);
	}
	else if(report_data->report == VGW_DM_ZWAVE_REPORT_PARTNER_ID)
	{
		if(report_data->data[0] == 0x00)
			sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Partner ID: Aeotec Standard Product \n");
		else 
			sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Partner ID: %d (Others)\n", report_data->data[0]);
	}
	else if(report_data->report == VGW_DM_ZWAVE_REPORT_LOCK_CONFIG)
	{
		if(report_data->data[0] == 0x00)
			sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Lock configuration: Disabled \n");
		else if(report_data->data[0] == 0x01)
			sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Lock configuration: Enabled \n");
	}
	else if(report_data->report == VGW_DM_ZWAVE_REPORT_SMART_SWITCH_STATUS)
	{
		if(report_data->data[0] == 0x00)
			sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Power State : Off \n");
		else if(report_data->data[0] == 0xFF)
			sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Power State : On \n");
	}
	else if(report_data->report == VGW_DM_ZWAVE_REPORT_SMART_SWITCH_STATUS_SETTING)
	{
		if(report_data->data[0] == 0x00)
			sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Power State Notification : Disabled \n");
		else 
			sprintf(asyncGlobalStr+strlen(asyncGlobalStr),"Power State Notification : Enabled \n");
	}
	

	printf("%s\n", asyncGlobalStr);
	send(sock , asyncGlobalStr , strlen(asyncGlobalStr) , 0 );
	close(sock);
}

char *vgw_read_string(char *buff){
    char * token = strtok(buff+globCount, " ");
    globCount = globCount + strlen(token) + 1;
    return token;
}

int iTotalCharCount = 0;

void zome_write_buffer(char **buffer, char *toCatStr)
{
	int offset = iTotalCharCount;

	iTotalCharCount = iTotalCharCount + strlen(toCatStr);
	*buffer = (char *) realloc (*buffer, iTotalCharCount);
	memcpy(*buffer+offset, toCatStr, strlen(toCatStr));
}


void vgw_zwave_execute(char *buffer, int val) 
{
    int fd = 0;
    struct sockaddr_in serv_addr;


	//Create a socket and ready it
	
	if ((fd = socket(AF_INET, SOCK_STREAM, 0)) < 0)
    {
        printf("\nSync Socket creation error \n");
        return;
    }
		
	serv_addr.sin_family = AF_INET;
    serv_addr.sin_port = htons(PORT_SYNC);
	
	if(inet_pton(AF_INET, "127.0.0.1", &serv_addr.sin_addr)<=0) 
    {
        printf("\nsync - Invalid address/ Address not supported \n");
        return;
    }
   
    if (connect(fd, (struct sockaddr *)&serv_addr, sizeof(serv_addr)) < 0)
    {
        printf("\nsync - Connection Failed \n");
        return;
    }

	int option = -1;
	int status = 0;
	char send_buf[2048] = {0};
	char *send_buff_2 = (char *) malloc (0);
	int index = 0;

	vgw_dm_zwave_control_t dev;
	globCount = 0;
	vgw_dm_zwave_report_t dev_status;
	
	char *commandType = vgw_read_string(buffer);
	option = atoi(commandType);

	char *requestID = vgw_read_string(buffer);

	printf("option %d\n", option);
	memset(key, '\0', MAX_KEY_LEN);

        vgw_dm_zwave_node_info_by_index_res_t node_info;
	vgw_dm_remove_failed_node_t rem_fail_node;
	switch(option)
	{
		case ADD_DEVICE:
			status = vgw_dev_mgr_zwave_add();
			char *description = vgw_read_string(buffer);
			strcat(send_buf, "Response-type : ADD\n");
			if(status != VGW_DM_ZWAVE_SUCCESS){
			strcat(send_buf, "status : Failed to add the device\n");
			}
			else{

				strcat(send_buf, "status : SUCCESS\n");
				sprintf(send_buf+strlen(send_buf), "desc    : %s\n", description);
				memset(&node_info, 0, sizeof(node_info));
				vgw_dev_mgr_zwave_db_get_last_added_node_info(&node_info);
				sprintf(send_buf+strlen(send_buf), "DeviceID    : %s\n",node_info.deviceId);
				sprintf(send_buf+strlen(send_buf), "RequestID   : %s\n", requestID);
			}
			break;
		case ADD_DEVICE_DSK : {
			strcat(send_buf, "Response-type : ADD_DSK\n");
			char *DSK = vgw_read_string(buffer);
			char *description = vgw_read_string(buffer);
			strncpy(key, DSK , KEY_LEN);
			if(strlen(key) == KEY_LEN)
			printf("key length correct");
			else  {
				strcat(send_buf, "status : FAILED - Invalid DSK\n");
			        break;
			}

			status = vgw_dev_mgr_zwave_add();
			if(status != VGW_DM_ZWAVE_SUCCESS){
				strcat(send_buf, "status : FAILED\n");
			}
			else{
				strcat(send_buf, "status : SUCCESS\n");
				sprintf(send_buf+strlen(send_buf), "desc    : %s\n", description);
				sprintf(send_buf+strlen(send_buf), "dsk     : %s\n", key);
				memset(&node_info, 0, sizeof(node_info));
				vgw_dev_mgr_zwave_db_get_last_added_node_info(&node_info);
				sprintf(send_buf+strlen(send_buf), "DeviceID    : %s\n",node_info.deviceId);
				sprintf(send_buf+strlen(send_buf), "RequestID   : %s\n", requestID);
			}
			break;
			}
		case REMOVE_DEVICE:
                        status = vgw_dev_mgr_zwave_remove();
			strcat(send_buf, "Response-type : REMOVE\n");
                        if(status != VGW_DM_ZWAVE_SUCCESS){
				strcat(send_buf, "status : FAILED\n");
                        }
                        else{
				strcat(send_buf, "status : SUCCESS\n");
		        }
			sprintf(send_buf+strlen(send_buf), "RequestID   : %s\n", requestID);
		        break;
		case GET_DEVICE_LIST:

			zome_write_buffer(&send_buff_2, "Response-type : GET_DEVICE_LIST\n");
			zome_write_buffer(&send_buff_2, "RequestID   : ");
			zome_write_buffer(&send_buff_2, requestID);
			zome_write_buffer(&send_buff_2, "\n");

			for(index=0, node_info.nodeId=0xff; node_info.nodeId != 0; index++)
			{
				char tmpBuff[300] = {0};
				printf("Reached status all \n" );  
				memset(&node_info, 0, sizeof(node_info));
				vgw_dev_mgr_zwave_db_get_node_info_by_index((uint8_t*)&index, &node_info);
				if(node_info.deviceId == NULL)
				{
					printf("No device information available!\n");
					strcat(tmpBuff, "Status : No device Info available\n");
				}
				if(node_info.nodeId != 0)
				{
					if(node_info.deviceType == 516)
					strcat(tmpBuff, "\nDeviceName : Door Sensor\n");
					else if(node_info.deviceType == 716)
					strcat(tmpBuff, "\nDeviceName : MultiSensor device\n");
					else if(node_info.deviceType == 616)
					strcat(tmpBuff, "\nDeviceName : Motion device\n");
					else if(node_info.deviceType == 65536)
					strcat(tmpBuff, "\nDeviceName : Zwave Range Extender device\n");
					else if(node_info.deviceType == 256)
					strcat(tmpBuff, "\nDeviceName : Smart switch\n");
					else if(node_info.deviceType == 257)
					strcat(tmpBuff, "\nDeviceName : Bulb device\n");
					else if(node_info.deviceType == 259)
					strcat(tmpBuff, "\nDeviceName : Thermostat device\n");
					else if(node_info.deviceType == 0)
					strcat(tmpBuff, "\nDeviceName : Unknown device\n");

					strcat(tmpBuff, "*******************************\n");
					sprintf(tmpBuff+strlen(tmpBuff), "DeviceID    : %s\n",node_info.deviceId);
					sprintf(tmpBuff+strlen(tmpBuff), "DeviceUUID  : %s\n",node_info.deviceUUID);
					sprintf(tmpBuff+strlen(tmpBuff), "DeviceNodeID: %d\n",node_info.nodeId);
					sprintf(tmpBuff+strlen(tmpBuff), "DeviceType  : %d\n",node_info.deviceType);
					sprintf(tmpBuff+strlen(tmpBuff), "DeviceAction: %d\n",node_info.deviceAction);

				}
				else if (index==0)
				{
					printf("No device Connected!\n");
					strcat(tmpBuff, "Status : No device Connected\n");
					zome_write_buffer(&send_buff_2, tmpBuff);
					break;
				}


				zome_write_buffer(&send_buff_2, tmpBuff);
			

			}
			printf("%s\n", send_buff_2);
			send(fd, send_buff_2,iTotalCharCount, 0);

			free(send_buff_2);	
			iTotalCharCount = 0;
			close(fd);
			return;

			break;
		case GET_ALL_PARAMS_TSTAT : {
								
			char *deviceID = vgw_read_string(buffer);
			strcat(send_buf, "Response-type : GET_ALL_PARAMS_TSTAT\n");
												
			status = vgw_dev_mgr_zwave_tstat_get_all(deviceID);
			if(status != VGW_DM_ZWAVE_SUCCESS)
			{
				sprintf(send_buf+strlen(send_buf), "Status : Execution failed for %s\n", deviceID);
			} else {
				sprintf(send_buf+strlen(send_buf), "Status : SUCCESS \n");
			}	
			sprintf(send_buf+strlen(send_buf), "RequestID   : %s\n", requestID);
			break;
		    }
		case GET_ALL_PARAMS_SWITCH : {
					
			char *deviceID = vgw_read_string(buffer);
			strcat(send_buf, "Response-type : GET_ALL_PARAMS_SWITCH\n");
												
			status = vgw_dev_mgr_zwave_smartswitch_get_all(deviceID);
			if(status != VGW_DM_ZWAVE_SUCCESS)
			{
				sprintf(send_buf+strlen(send_buf), "Status : Execution failed for %s\n", deviceID);
			} else {
				sprintf(send_buf+strlen(send_buf), "Status : SUCCESS \n");
			}
			sprintf(send_buf+strlen(send_buf), "RequestID   : %s\n", requestID);
			break;
		}
		case SET_PARAMS : {
			
			char *command = vgw_read_string(buffer);
			switch(atoi(command)) {
				case SET_TEMPERATURE : {
					strcat(send_buf, "Response-type : SET_TEMP\n");

					char *type = vgw_read_string(buffer);
					char *unit = vgw_read_string(buffer);
					char *value = vgw_read_string(buffer);
					char *deviceID = vgw_read_string(buffer);

					strcpy(dev.dev_id, deviceID);
					dev.control_type = VGW_DM_ZWAVE_CONTROL_TYPE_TSTAT_TEMP;

					if(((atoi(unit) == 0) && (atoi(value) >= 2) && (atoi(value) <= 34)
						&& ((atoi(type) == 0) || (atoi(type) == 1))) ||
						((atoi(unit) == 1) && (atoi(value) >= 35) && (atoi(value) <= 95)
						&& ((atoi(type) == 0) || (atoi(type) == 1))))
					{
						dev.mode = atoi(type);
						dev.unit = atoi(unit);
						dev.temp = atoi(value);
						status = vgw_dev_mgr_zwave_control(&dev);
						if(status != VGW_DM_ZWAVE_SUCCESS)
						{
							strcat(send_buf,"Status : FAILED\n");
						}
						else
						{
							strcat(send_buf,"status : SUCCESS\n");
						}
					}
					else
						strcat(send_buf,"Status : FAILED\n");
					
					sprintf(send_buf+strlen(send_buf), "RequestID   : %s\n", requestID);

					break;
				}
				case SET_POWER : {
					strcat(send_buf, "Response-type : SET_POWER\n");
					char *power = vgw_read_string(buffer);
					char *deviceID = vgw_read_string(buffer);
						
					if(atoi(power) != 0 && atoi(power) != 1) {
						sprintf(send_buf+strlen(send_buf),"status : Invalid power arguments\n");
						break;
					}
					dev.device_action = atoi(power);
					dev.control_type = VGW_DM_ZWAVE_CONTROL_TYPE_DEVICE_ACTION;

					strcpy(dev.dev_id, deviceID);
					status = vgw_dev_mgr_zwave_control(&dev);

					if(status != VGW_DM_ZWAVE_SUCCESS)
					{
						strcat(send_buf,"Status : FAILED\n");
					}
					else 
						strcat(send_buf,"status : SUCCESS\n");
					sprintf(send_buf+strlen(send_buf), "RequestID   : %s\n", requestID);
					break;	
				 }
				 case SET_MODE : {
					strcat(send_buf, "Response-type : SET_MODE\n");

					char *mode = vgw_read_string(buffer);
					char *deviceID = vgw_read_string(buffer);
					
					if(!((atoi(mode) > 0) && (atoi(mode) < 5))) {
						strcat(send_buf,"status : Invalid mode arguments\n");
						break;
					}

					dev.control_type = VGW_DM_ZWAVE_CONTROL_TYPE_TSTAT_MODES;
					dev.mode = (uint8_t)atoi(mode);
					strcpy(dev.dev_id, deviceID);

					status = vgw_dev_mgr_zwave_control(&dev);

					if(status != VGW_DM_ZWAVE_SUCCESS)
					{
						strcat(send_buf,"Status : FAILED\n");
					}
					else 
						strcat(send_buf,"status : SUCCESS\n");
					sprintf(send_buf+strlen(send_buf), "RequestID   : %s\n", requestID);
					break;	
				}
				case SET_POWER_NOTIF : {
					strcat(send_buf, "Response-type : SET_POWER_NOTIF\n");

					char *value = vgw_read_string(buffer);
					char *deviceID = vgw_read_string(buffer);

					dev.control_type = VGW_DM_ZWAVE_CONTROL_TYPE_POWER_STATE;
					strcpy(dev.dev_id, deviceID);

					if((atoi(value) == 0) || (atoi(value) == 2))
					{
						dev.mode = atoi(value);
						status = vgw_dev_mgr_zwave_control(&dev);
						if(status != VGW_DM_ZWAVE_SUCCESS)
						{
							strcat(send_buf,"Status : FAILED\n");
						}
						else 
							strcat(send_buf,"status : SUCCESS\n");
						sprintf(send_buf+strlen(send_buf), "RequestID   : %s\n", requestID);

					}
					else
					{
						strcat(send_buf,"Status : FAILED\n");
						strcat(send_buf,"Reason : Wrong parameter\n");
						sprintf(send_buf+strlen(send_buf), "RequestID   : %s\n", requestID);
					}

					break;

				}
				case SET_DISPLAY_UNIT : {
					strcat(send_buf, "Response-type : SET_DISPLAY_UNIT\n");

					char *value = vgw_read_string(buffer);
					char *deviceID = vgw_read_string(buffer);

					dev.control_type = VGW_DM_ZWAVE_CONTROL_TYPE_DISPLAY_UNIT;
					strcpy(dev.dev_id, deviceID);

					if((atoi(value) == 0) || (atoi(value) == 1))
					{
						dev.unit = (uint8_t)atoi(value);
						status = vgw_dev_mgr_zwave_control(&dev);
						if(status != VGW_DM_ZWAVE_SUCCESS)
						{
							strcat(send_buf,"Status : FAILED\n");
						}
						else 
							strcat(send_buf,"status : SUCCESS\n");
						sprintf(send_buf+strlen(send_buf), "RequestID   : %s\n", requestID);

					}
					else
					{
						strcat(send_buf,"Status : FAILED\n");
						strcat(send_buf,"Reason : Wrong parameter\n");
						sprintf(send_buf+strlen(send_buf), "RequestID   : %s\n", requestID);
					}

					break;
				}
				default :
					strcat(send_buf, "Response-type : NOT_SUPPORTED\n");
					sprintf(send_buf+strlen(send_buf), "RequestID   : %s\n", requestID);
					break;

			}
			break;
	         }
		case GET_PARAMS: {
			char *command = vgw_read_string(buffer);

			switch(atoi(command)) {
				case GET_SET_POINT_TEMP_VAL : {
					strcat(send_buf, "Response-type : GET_SETPOINT_TEMP\n");
					char *setpoint = vgw_read_string(buffer);
					char *deviceID = vgw_read_string(buffer);

					strcpy(dev_status.dev_id, deviceID);

					if((atoi(setpoint) == 1) || (atoi(setpoint) == 2))
					{
						dev_status.param_num = DEVICE_STATUS_SETPOINT_TEMP;
						dev_status.data = atoi(setpoint);
					}
					else
					{ 
						strcat(send_buf,"Status : Invalid parameter\n");
						sprintf(send_buf+strlen(send_buf), "RequestID   : %s\n", requestID);
						break;
					}
					status = vgw_dev_mgr_zwave_get(&dev_status);
					if(status != VGW_DM_ZWAVE_SUCCESS)
					{
						strcat(send_buf,"Status : FAILED\n");
					} else {
						strcat(send_buf,"Status : SUCCESS\n");
					}
					sprintf(send_buf+strlen(send_buf), "RequestID   : %s\n", requestID);
					break;
				}
				case GET_LIVE_TEMP : {
					strcat(send_buf, "Response-type : GET_LIVE_TEMP\n");
					char *display_unit = vgw_read_string(buffer);
					char *deviceID = vgw_read_string(buffer);
					
					strcpy(dev_status.dev_id, deviceID);

					if((atoi(display_unit) == 0) || (atoi(display_unit) == 1))
					{
						dev_status.param_num = DEVICE_STATUS_MULTI_SENSOR_TEMP;
						dev_status.data = atoi(display_unit);
					}
					else
					{
					        strcat(send_buf,"Status : Invalid parameter\n");
						sprintf(send_buf+strlen(send_buf), "RequestID   : %s\n", requestID);
					        break;
				        }
					status = vgw_dev_mgr_zwave_get(&dev_status);
					if(status != VGW_DM_ZWAVE_SUCCESS)
					{
						strcat(send_buf,"Status : FAILED\n");
					} else {
						strcat(send_buf,"Status : SUCCESS\n");
					}
					sprintf(send_buf+strlen(send_buf), "RequestID   : %s\n", requestID);
					break;
				}
				//All options which do not need additional paramters are to be added under this
				case GET_TSTAT_MODE : {
					strcat(send_buf, "Response-type : GET_TSTAT_MODE\n");
					char *deviceID = vgw_read_string(buffer);
					strcpy(dev_status.dev_id, deviceID);

					dev_status.param_num = DEVICE_STATUS_DIFFERENTIAL_MODES;

					status = vgw_dev_mgr_zwave_get(&dev_status);
					if(status != VGW_DM_ZWAVE_SUCCESS)
					{
						strcat(send_buf,"Status : FAILED\n");
					} else {
						strcat(send_buf,"Status : SUCCESS\n");
					}
					sprintf(send_buf+strlen(send_buf), "RequestID   : %s\n", requestID);
					break;
				}
				case GET_POWER_STATUS : {
							    
					strcat(send_buf, "Response-type : GET_POWER_STATUS\n");
					char *deviceID = vgw_read_string(buffer);
					strcpy(dev_status.dev_id, deviceID);
					
					dev_status.param_num = DEVICE_STATUS_BASIC_MODE;

					status = vgw_dev_mgr_zwave_get(&dev_status);
					if(status != VGW_DM_ZWAVE_SUCCESS)
					{
						strcat(send_buf,"Status : FAILED\n");
					} else {
						strcat(send_buf,"Status : SUCCESS\n");
					}
					sprintf(send_buf+strlen(send_buf), "RequestID   : %s\n", requestID);
					break;
							    
							   
				}
				case GET_POWER_NOTIF_STATUS : {

					strcat(send_buf, "Response-type : GET_POWER_NOTIF_STATUS\n");
					char *deviceID = vgw_read_string(buffer);

					strcpy(dev_status.dev_id, deviceID);

					dev_status.param_num = DEVICE_STATUS_CONFIG_SMART_SWITCH;

					status = vgw_dev_mgr_zwave_get(&dev_status);
					if(status != VGW_DM_ZWAVE_SUCCESS)
					{
						strcat(send_buf,"Status : FAILED\n");
					} else {
						strcat(send_buf,"Status : SUCCESS\n");
					}
					sprintf(send_buf+strlen(send_buf), "RequestID   : %s\n", requestID);
					break;

				}
				case GET_DISPLAY_UNIT : {
					strcat(send_buf, "Response-type : GET_DISPLAY_UNIT\n");
					char *deviceID = vgw_read_string(buffer);

					strcpy(dev_status.dev_id, deviceID);

					dev_status.param_num = DEVICE_STATUS_CONFIG_DISPLAY_UNITS;

					status = vgw_dev_mgr_zwave_get(&dev_status);
					if(status != VGW_DM_ZWAVE_SUCCESS)
					{
						strcat(send_buf,"Status : FAILED\n");
					} else {
						strcat(send_buf,"Status : SUCCESS\n");
					}
					sprintf(send_buf+strlen(send_buf), "RequestID   : %s\n", requestID);
					break;
				}
				default :{ 
					strcat(send_buf, "Response-type : NOT_SUPPORTED\n");
					strcat(send_buf,"status : Command not supported\n");
					sprintf(send_buf+strlen(send_buf), "RequestID   : %s\n", requestID);
			                break;
					 }
			}
			break;
		}
		case IMAGE_VERSION :
				 {
					 strcat(send_buf, "Response-type : GET_IMAGE_VERSION\n");

					 FILE *fp = fopen("/usr/local/etc/fw_version.txt", "r");
					 if (fp == NULL)
					 {
						 strcat(send_buf,"Status : FAILED\n");
					 }
					 else
					 {
						 char buff[128] = {0};	
						 int len = 0;

						 fseek(fp, 0, SEEK_END);

						 len = ftell(fp);
						 fseek(fp, 0, SEEK_SET);

						 fread(buff, len, 1, fp); 
						 fclose(fp);
						 sprintf(send_buf+strlen(send_buf),"Image Version : %s\n", buff);
						 printf("%s\n", buff);
					 }
					 sprintf(send_buf+strlen(send_buf), "RequestID   : %s\n", requestID);
					 break;
				 }
		case REMOVE_NODE  :
				 {
					strcat(send_buf, "Response-type : REMOVE_NODE\n");
					char *deviceID = vgw_read_string(buffer);

					strcpy(rem_fail_node.remove_failed_devid, deviceID);

					if(rem_fail_node.remove_failed_devid != 0)
			                        status = vgw_dev_mgr_zwave_remove_failed_node_by_index(&rem_fail_node);

					if(status == VGW_DM_ZWAVE_SUCCESS)
					{
						strcat(send_buf,"Status : SUCCESS\n");
					}
					else if(status == VGW_DM_ZWAVE_ERR_NODE_IS_ONLINE)
					{
						strcat(send_buf,"Status : FAILED\n");
						strcat(send_buf,"Reason : Device is online\n");
					}
					else if(status == VGW_DM_ZWAVE_ERR_NOT_VALID_DEVID_FOR_GRP)
					{
						strcat(send_buf,"Status : FAILED\n");
						strcat(send_buf,"Reason : Wrong DeviceID\n");
					}
					else
					{
						strcat(send_buf,"Status : FAILED\n");
						strcat(send_buf,"Reason : Unknown\n");

					}

					sprintf(send_buf+strlen(send_buf), "RequestID   : %s\n", requestID);
					break;

				 }
		default:
			{
	                strcat(send_buf,"Error : Invalid choice\n");
			sprintf(send_buf+strlen(send_buf), "RequestID   : %s\n", requestID);
	                break;
			}
	}
	//send reply to the socket
	printf("sending result\n");
	printf("fd is %d\n", fd);
	printf("out is %s\n", send_buf);
	send(fd, send_buf, strlen(send_buf), 0);
	close(fd);
	return;
}

void vgw_zwave_test_app_notification_callback(void* user_data, vgw_dm_zwave_notf_data_t *notify)
{
}

int isnum(char *num)
{
	int count = 0;
	for(count = 0; num[count] != '\0'; count++)
	{
		if(num[count] < '0' || num[count] > '9')
			return 0;
	}
	return 1;
}

void vgw_zwave_test_app_dsk_callback(void* user_data, char* dsk)
{
    int wait_count = 3000; /* Wait for 3 seconds */
    while (1)
    {
        if ((wait_count--) == 0)
            break;
        usleep(1000);
    }
    strcat(key, dsk);
    printf("DSK: %s\n", key);
    vgw_dev_mgr_zwave_add_with_dsk(key);
}

int main() 
{
    vgw_dm_zwave_init_t  zwaveinitparams;
    //int status = 0;
    //int index = 0;
	//int arg_num = 0;
    //char *arg_list[MAX_ARG_CNT];
//	char cmd[MAX_CMD_LEN];
//	vgw_dm_zwave_control_t dev;
    //vgw_dm_zwave_report_t dev_status;
    //vgw_dm_zwave_node_info_by_index_res_t node_info;	
	//vgw_dm_zwave_control_group_t  group_control;	
	//vgw_dm_rf_ota_t end_device_ota;	

    zwaveinitparams.user        = NULL;
    zwaveinitparams.app_name    = "zwavetestapp";
    zwaveinitparams.notify      = vgw_zwave_test_app_notification_callback;
	zwaveinitparams.rpt			= vgw_zwave_test_app_report_callback;
    zwaveinitparams.dsk_req     = vgw_zwave_test_app_dsk_callback;
	
    signal(SIGINT, exit_app);
    signal(SIGQUIT, exit_app);
    signal(SIGTERM, exit_app);

    while ((vgw_dev_mgr_zwave_init(&zwaveinitparams) != 0))
    {
        printf("Failed to init zwave device manager init\n");
        printf("Waiting for zwave device manager init\n");
        sleep(1);
    }

	//vgw_zwave_test_app_help();
	int master_socket , addrlen , new_socket , client_socket[30] ,  
	             max_clients = 30 , activity, i , valread , sd;  
	int max_sd; 
	struct sockaddr_in address;

	//set of socket descriptors
	fd_set readfds; 

	//initialise all client_socket[] to 0 so not checked 	
	for (i = 0; i < max_clients; i++)  
	{
		client_socket[i] = 0;
	}

	//create master socket
	if( (master_socket = socket(AF_INET , SOCK_STREAM , 0)) == 0)
	{
		perror("socket failed");
		exit_app(1);  
	}

	//type of socket
	address.sin_family = AF_INET; 
	address.sin_addr.s_addr = INADDR_ANY;  
	address.sin_port = htons( PORT );   

	// bind
	if (bind(master_socket, (struct sockaddr *)&address, sizeof(address))<0)
	{
		perror("bind failed");   
		exit_app(1);
	}

	printf("Listener on port %d \n", PORT); 
	//try to specify maximum of 3 pending connections for the master socket  
	if (listen(master_socket, 3) < 0)  
	{
		perror("listen");  
		exit_app(1);   
	}

	//accept the incoming connection 
	addrlen = sizeof(address);
	puts("Waiting for connections ...");

	while(1)
	{
		FD_ZERO(&readfds);
		FD_SET(master_socket, &readfds);  
		max_sd = master_socket;   
		
		for ( i = 0 ; i < max_clients ; i++)
		{
			sd = client_socket[i];
			if(sd > 0)
				FD_SET( sd , &readfds);
			if(sd > max_sd)   
				max_sd = sd;
		}
		//wait for an activity on one of the sockets , timeout is 1 seconds
		struct timeval tv;
		tv.tv_sec = 1;
		activity = select( max_sd + 1 , &readfds , NULL , NULL , &tv);

		if ((activity < 0) && (errno!=EINTR))
			printf("select error");
	       	//If something happened on the master socket ,  
	        //then its an incoming connection
		if (FD_ISSET(master_socket, &readfds))
		{
			if ((new_socket = accept(master_socket,  
	                    (struct sockaddr *)&address, (socklen_t*)&addrlen))<0) 
			{   
        	                perror("accept");   
	                        exit_app(1);  
	                }   

			//inform user of socket number - used in send and receive commands
			printf("New connection , socket fd is %d , ip is : %s , port : %d \n" , new_socket , inet_ntoa(address.sin_addr) , ntohs 
					                  (address.sin_port));

			//add new socket to array of sockets
			
			for (i = 0; i < max_clients; i++)
			{
				//if position is empty
				if( client_socket[i] == 0 )
				{
         				client_socket[i] = new_socket;   
	         	                printf("Adding to list of sockets as %d\n" , i);  

					break;
				}
			}
		}

		//else its some IO operation on some other socket
		for (i = 0; i < max_clients; i++)
		{
			sd = client_socket[i];
			if (FD_ISSET( sd , &readfds))
			{
				//Check if it was for closing , and also read the  
				//incoming message
				char buffer[2048] = {0};
				printf("fd at join %d\n", sd);
				if ((valread = read( sd , buffer, 2048)) == 0) 
				{
					getpeername(sd , (struct sockaddr*)&address ,(socklen_t*)&addrlen);   
					printf("Host disconnected , ip %s , port %d \n" ,  
		                          inet_ntoa(address.sin_addr) , ntohs(address.sin_port)); 
					
					//Close the socket and mark as 0 in list for reuse 
 	                                close( sd );   
	                                client_socket[i] = 0;
				}

				//If not a new connection or a disconnect, process command 
				else 
		                {   
				    printf("Executing command %s\n", buffer); 
				    send(sd, "Command Received", 16, 0);
				    close(sd);
		                    vgw_zwave_execute(buffer, valread);    
				    printf("killing connection\n");
	                            client_socket[i] = 0;
                                }   
			}
		}
		/*
		printf("\nEnter Command:\n");

		fgets(cmd, MAX_CMD_LEN, stdin);
		arg_num = 0;
		arg_list[arg_num] = strtok(cmd, " ");
		while(arg_list[arg_num] != NULL)
		{
			arg_num++;
			arg_list[arg_num] = strtok(NULL, " ");
		}
		
        arg_list[arg_num - 1][(strlen(arg_list[arg_num - 1]))-1] = '\0';

		if((strncmp((arg_list[0]), "help", 4) == 0) && (arg_num == 1))
		{
			vgw_zwave_test_app_help();
            continue;
		}
		else if((strncmp((arg_list[0]), "add_zwave_device", 16) == 0) && (arg_num <= 2))
		{
			memset(key, '\0', MAX_KEY_LEN);
			if(arg_num == 2)
			{
				if(strlen((char*)arg_list[1]) == KEY_LEN)
				{
					strncpy(key, (char*)arg_list[1], KEY_LEN);           
				}    
				else
				{
					printf("Invalid DSK \r\n");
					continue;
				}    
			}
			status = vgw_dev_mgr_zwave_add();
			if(status != VGW_DM_ZWAVE_SUCCESS)
				printf("Failed to add the device\n");
			else
			{
				printf("Device added successfully\n");
				memset(&node_info, 0, sizeof(node_info));
				vgw_dev_mgr_zwave_db_get_last_added_node_info(&node_info);
				
				if(node_info.deviceType == 516)
					printf("\nDeviceName : Door Sensor\n");
				else if(node_info.deviceType == 716)
					printf("\nDeviceName : MultiSensor device\n");
				else if(node_info.deviceType == 616)
					printf("\nDeviceName : Motion device\n");
				else if(node_info.deviceType == 65536)
					printf("\nDeviceName : Zwave Range Extender device\n");
				else if(node_info.deviceType == 256)
					printf("\nDeviceName : Smart switch\n");
				else if(node_info.deviceType == 257)
					printf("\nDeviceName : Bulb device\n");
				else if(node_info.deviceType == 259)
					printf("\nDeviceName : Thermostat device\n");
				else if(node_info.deviceType == 0)
					printf("\nDeviceName : Unknown device\n");

				printf("*******************************\n");
				printf("DeviceID    : %s\n",node_info.deviceId);
				printf("DeviceUUID  : %s\n",node_info.deviceUUID);
				printf("DeviceNodeID: %d\n",node_info.nodeId);
				printf("DeviceType  : %d\n",node_info.deviceType);	
			}
		}
		else if((strncmp((arg_list[0]), "remove_zwave_device", 19) == 0) && (arg_num == 1))
		{
			status = vgw_dev_mgr_zwave_remove();
			if(status != VGW_DM_ZWAVE_SUCCESS)
				printf("Failed to remove the device\n");
			else
				printf("Device removed successfully\n");
		}
		else if((strncmp((arg_list[0]), "status_all", 10) == 0) && (arg_num == 1))
		{
			for(index=0, node_info.nodeId=0xff; node_info.nodeId != 0; index++)
			{
				memset(&node_info, 0, sizeof(node_info));
				vgw_dev_mgr_zwave_db_get_node_info_by_index((uint8_t*)&index, &node_info);
				if(node_info.deviceId == NULL)
				{
					printf("No device information available!\n");
				}

				if(node_info.nodeId != 0)
				{
					if(node_info.deviceType == 516)
						printf("\nDeviceName : Door Sensor\n");
					else if(node_info.deviceType == 716)
						printf("\nDeviceName : MultiSensor device\n");
					else if(node_info.deviceType == 616)
						printf("\nDeviceName : Motion device\n");
					else if(node_info.deviceType == 65536)
						printf("\nDeviceName : Zwave Range Extender device\n");
					else if(node_info.deviceType == 256)
						printf("\nDeviceName : Smart switch\n");
					else if(node_info.deviceType == 257)
						printf("\nDeviceName : Bulb device\n");
					else if(node_info.deviceType == 259)
						printf("\nDeviceName : Thermostat device\n");
					else if(node_info.deviceType == 0)
						printf("\nDeviceName : Unknown device\n");

					printf("*******************************\n");
					printf("DeviceID    : %s\n",node_info.deviceId);
					printf("DeviceUUID  : %s\n",node_info.deviceUUID);
					printf("DeviceNodeID: %d\n",node_info.nodeId);
					printf("DeviceType  : %d\n",node_info.deviceType);
					printf("DeviceAction: %d\n",node_info.deviceAction);
					printf("DeviceBrightness: %d\n\n",node_info.deviceBrightness);
				}
				else if (index==0)
				{
					printf("No device information available!\n");
					continue;
				}
			}
		}
		else if(((strncmp((arg_list[0]), "control_device", 14) == 0)) && ((arg_num >= 4) || (arg_num <= 6)))
		{
			if(arg_num == 4)
			{
				strcpy(dev.dev_id, arg_list[1]);
				if((strncmp(arg_list[2], "power", 5) == 0) && (strncmp(arg_list[3], "ON", 2) == 0))
				{
					dev.control_type = VGW_DM_ZWAVE_CONTROL_TYPE_DEVICE_ACTION;
					dev.device_action = 1;
					status = vgw_dev_mgr_zwave_control(&dev);
					if(status != VGW_DM_ZWAVE_SUCCESS)
					{
						printf("Failed to on device\n");
					}
					else
					{
						printf("Device on successfully\n");
					}
				}
				else if((strncmp(arg_list[2], "power", 5) == 0) && (strncmp(arg_list[3], "OFF", 3) == 0))
				{
					dev.control_type = VGW_DM_ZWAVE_CONTROL_TYPE_DEVICE_ACTION;
					dev.device_action = 0;
					status = vgw_dev_mgr_zwave_control(&dev);
					if(status != VGW_DM_ZWAVE_SUCCESS)
					{
						printf("Failed to off device\n");
					}
					else
					{
						printf("Device off successfully\n");
					}
				}
				else if(strncmp(arg_list[2], "Brightness", 10) == 0)
				{
					dev.control_type = 2;
					if((atoi(arg_list[3]) > 0) && (atoi(arg_list[3]) < 99))
					{ 
						dev.device_brightness = atoi(arg_list[3]);
						status = vgw_dev_mgr_zwave_control(&dev);
						if(status != VGW_DM_ZWAVE_SUCCESS)
						{
							printf("Failed to set brightness\n");
						}
						else
						{
							printf("Device brightness set successfully\n");
						}
					}
					else
						printf("Invalid argument\n");
				}
				else if(strncmp(arg_list[2], "utility_lock", 12) == 0)
				{
					dev.control_type = VGW_DM_ZWAVE_CONTROL_TYPE_UTILITY_LOCK;
					if((atoi(arg_list[3]) == 0) || (atoi(arg_list[3]) == 1))
					{
						if((atoi(arg_list[3]) == 0))
							dev.utility_lock = 0x00;
						else 
							dev.utility_lock = 0x03;
						status = vgw_dev_mgr_zwave_control(&dev);
						if(status != VGW_DM_ZWAVE_SUCCESS)
						{
							printf("Failed to set utility lock\n");
						}
						else
						{
							printf("Device utility lock set successfully\n");
						}		
					}
					else
						printf("Invalid argument\n");
				}
				else if(strncmp(arg_list[2], "aux_heat", 8) == 0)
				{
					dev.control_type = VGW_DM_ZWAVE_CONTROL_TYPE_AUX_HEAT;
					if((atoi(arg_list[3]) == 0) || (atoi(arg_list[3]) == 1))
					{ 
						dev.aux_heat = (uint8_t)(atoi(arg_list[3]));
						status = vgw_dev_mgr_zwave_control(&dev);
						if(status != VGW_DM_ZWAVE_SUCCESS)
						{
							printf("Failed to set aux heat\n");
						}
						else
						{
							printf("Device aux heat set successfully\n");
						}
					}
					else
						printf("Invalid argument\n");
				}
				else if(strncmp(arg_list[2], "set_unit", 8) == 0)
				{
					dev.control_type = VGW_DM_ZWAVE_CONTROL_TYPE_DISPLAY_UNIT;
					if((atoi(arg_list[3]) == 0) || (atoi(arg_list[3]) == 1))
					{ 
						dev.unit = (uint8_t)atoi(arg_list[3]);
						status = vgw_dev_mgr_zwave_control(&dev);
						if(status != VGW_DM_ZWAVE_SUCCESS)
						{
							printf("Failed to set display unit\n");
						}
						else
						{
							printf("Device display unit set successfully\n");
						}
					}
					else
						printf("Invalid argument\n");
				}
				else if(strncmp(arg_list[2], "set_fan_timer", 13) == 0)
				{
					dev.control_type = VGW_DM_ZWAVE_CONTROL_TYPE_FAN_TIMER;
					if(atoi(arg_list[3]) == 0)
					{ 
						dev.timer = 0x00;
					}
					else if(atoi(arg_list[3]) == 1)
					{ 
						dev.timer = 0x0F;
					}
					else if(atoi(arg_list[3]) == 2)
					{ 
						dev.timer = 0x1E;
					}
					else if(atoi(arg_list[3]) == 3)
					{ 
						dev.timer = 0x3C;
					}
					else
					{
						printf("Invalid argument\n");
						continue;
					}
					status = vgw_dev_mgr_zwave_control(&dev);
					if(status != VGW_DM_ZWAVE_SUCCESS)
					{
						printf("Failed to set fan timer\n");
					}
					else
					{
						printf("Device fan timer set successfully\n");
					}
				}
				else if(strncmp(arg_list[2], "set_mode", 8) == 0)
				{
					dev.control_type = VGW_DM_ZWAVE_CONTROL_TYPE_TSTAT_MODES;
					if((atoi(arg_list[3]) > 0) && (atoi(arg_list[3]) < 5))
					{ 
						dev.mode = (uint8_t)atoi(arg_list[3]);
						status = vgw_dev_mgr_zwave_control(&dev);
						if(status != VGW_DM_ZWAVE_SUCCESS)
						{
							printf("Failed to set tstat mode\n");
						}
						else
						{
							printf("Device tstat mode set successfully\n");
						}
					}
					else
						printf("Invalid argument\n");
				}
				else if(strncmp(arg_list[2], "set_recovery_mode", 17) == 0)
				{
					dev.control_type = VGW_DM_ZWAVE_CONTROL_TYPE_RECOVERY_MODE;
					if((atoi(arg_list[3]) == 1) || (atoi(arg_list[3]) == 2))
					{ 
						dev.mode = (uint8_t)atoi(arg_list[3]);
						status = vgw_dev_mgr_zwave_control(&dev);
						if(status != VGW_DM_ZWAVE_SUCCESS)
						{
							printf("Failed to set recovery mode\n");
						}
						else
						{
							printf("Device recovery mode set successfully\n");
						}
					}
					else
						printf("Invalid argument\n");
				}
				else if(strncmp(arg_list[2], "temp_calibration", 16) == 0)
				{
					dev.control_type = VGW_DM_ZWAVE_CONTROL_TYPE_TEMP_CALIBRATION;
					if((atof(arg_list[3]) >= -6) && (atof(arg_list[3]) <= 6))
					{ 
						float cal_val = atof(arg_list[3]);
						int int_val = (int)cal_val;
						float val = (cal_val - int_val);

						if(((cal_val > 0) && (val > 0)) || ((cal_val < 0) && (val < 0)))
							printf("Invalid argument\n");
						else
						{	
							dev.temp = (int)atoi(arg_list[3]);
							status = vgw_dev_mgr_zwave_control(&dev);
							if(status != VGW_DM_ZWAVE_SUCCESS)
							{
								printf("Failed to set temp calibration\n");
							}
							else
							{
								printf("Device temp calibration set successfully\n");
							}
						}
					}
					else
						printf("Invalid argument\n");					
				}
				else if(strncmp(arg_list[2], "set_humidity_thr", 18) == 0)
				{
					dev.control_type = VGW_DM_ZWAVE_CONTROL_TYPE_HUMIDITY_THRESHOLD;
					if((atoi(arg_list[3]) >= 0) && (atoi(arg_list[3]) <= 3))
					{ 
						dev.threshold = (int)atoi(arg_list[3]);
						status = vgw_dev_mgr_zwave_control(&dev);
						if(status != VGW_DM_ZWAVE_SUCCESS)
						{
							printf("Failed to set humidity threshold\n");
						}
						else
						{
							printf("Device humidity threshold set successfully\n");
						}
					}
					else
						printf("Invalid argument\n");
				}
				else if(strncmp(arg_list[2], "tstat_swing", 16) == 0)
				{
					dev.control_type = VGW_DM_ZWAVE_CONTROL_TYPE_TSTAT_SWING;
					if((atoi(arg_list[3]) > 0) && (atoi(arg_list[3]) <= 8))
					{ 
						dev.temp = (uint8_t)atoi(arg_list[3]);
						status = vgw_dev_mgr_zwave_control(&dev);
						if(status != VGW_DM_ZWAVE_SUCCESS)
						{
							printf("Failed to set tstat swing\n");
						}
						else
						{
							printf("Device tstat swing set successfully\n");
						}
					}
					else
						printf("Invalid argument\n");
				}
				else if(strncmp(arg_list[2], "temp_rpt_thr", 12) == 0)
				{
					dev.control_type = VGW_DM_ZWAVE_CONTROL_TYPE_TEMP_RPT_THR;
					if((atoi(arg_list[3]) > 0) && (atoi(arg_list[3]) <= 4))
					{ 
						dev.temp = (uint8_t)atoi(arg_list[3]);
						status = vgw_dev_mgr_zwave_control(&dev);
						if(status != VGW_DM_ZWAVE_SUCCESS)
						{
							printf("Failed to set temp reporting threshold\n");
						}
						else
						{
							printf("Device temp reporting threshold set successfully\n");
						}
					}
					else
						printf("Invalid argument\n");
				}
				else if(strncmp(arg_list[2], "set_cur_overload_prot", 21) == 0)
				{
					dev.control_type = VGW_DM_ZWAVE_CONTROL_TYPE_CUR_OVERLOAD_PROT;
					if((atoi(arg_list[3]) == 0) || (atoi(arg_list[3]) == 1))
					{
						dev.overload = (atoi(arg_list[3]));
						 
						status = vgw_dev_mgr_zwave_control(&dev);
						if(status != VGW_DM_ZWAVE_SUCCESS)
						{
							printf("Failed to set current overload protection\n");
						}
						else
						{
							printf("Current overload protection configuration set successfully\n");
						}		
					}
					else
						printf("Invalid argument\n");
				}
				else if(strncmp(arg_list[2], "led_status", 10) == 0)
				{
					dev.control_type = VGW_DM_ZWAVE_CONTROL_TYPE_LED_STATUS;
					if((atoi(arg_list[3]) >= 0) && (atoi(arg_list[3]) <= 2))
					{
						dev.mode = (atoi(arg_list[3]));
						status = vgw_dev_mgr_zwave_control(&dev);
						if(status != VGW_DM_ZWAVE_SUCCESS)
						{
							printf("Failed to set led status configuration\n");
						}
						else
						{
							printf("LED status configuration set successfully\n");
						}
					}
					else
						printf("Invalid argument\n");
				}
				else if(strncmp(arg_list[2], "set_watt_report", 15) == 0)
				{
					dev.control_type = VGW_DM_ZWAVE_CONTROL_TYPE_CONFIG_WATT_REPORT;
					if((atoi(arg_list[3]) == 0) || (atoi(arg_list[3]) == 1))
					{
						dev.mode = (atoi(arg_list[3]));
						status = vgw_dev_mgr_zwave_control(&dev);
						if(status != VGW_DM_ZWAVE_SUCCESS)
						{
							printf("Failed to set wattage report configuration\n");
						}
						else
						{
							printf("Wattage report configuration set successfully\n");
						}		
					}
					else
						printf("Invalid argument\n");
				}
				else if(strncmp(arg_list[2], "set_wattage_rpt_per_thr", 23) == 0)
				{
					dev.control_type = VGW_DM_ZWAVE_CONTROL_TYPE_WATT_THR_PER;
					if((atoi(arg_list[3]) >= 0) && (atoi(arg_list[3]) <= 100))
					{
						dev.watt_thr = (atoi(arg_list[3]));
						status = vgw_dev_mgr_zwave_control(&dev);
						if(status != VGW_DM_ZWAVE_SUCCESS)
						{
							printf("Failed to set wattage report in percent\n");
						}
						else
						{
							printf("Wattage report in percent set successfully\n");
						}		
					}
					else
						printf("Invalid argument\n");
				}
				else if(strncmp(arg_list[2], "set_wattage_rpt_thr", 19) == 0)
				{
					dev.control_type = VGW_DM_ZWAVE_CONTROL_TYPE_WATT_THR;
					if((atoi(arg_list[3]) >= 0) && (atoi(arg_list[3]) <= 32767))
					{
						dev.watt_thr = (atoi(arg_list[3]));
						status = vgw_dev_mgr_zwave_control(&dev);
						if(status != VGW_DM_ZWAVE_SUCCESS)
						{
							printf("Failed to set wattage report\n");
						}
						else
						{
							printf("Wattage report set successfully\n");
						}		
					}
					else
						printf("Invalid argument\n");
				}
				else if(strncmp(arg_list[2], "set_lock_config", 15) == 0)
				{
					dev.control_type = VGW_DM_ZWAVE_CONTROL_TYPE_LOCK_CONFIG;
					if((atoi(arg_list[3]) == 0) || (atoi(arg_list[3]) == 1))
					{
						dev.mode = (atoi(arg_list[3]));
						status = vgw_dev_mgr_zwave_control(&dev);
						if(status != VGW_DM_ZWAVE_SUCCESS)
						{
							printf("Failed to set lock configuration\n");
						}
						else
						{
							printf("Lock configuration set successfully\n");
						}		
					}
					else
						printf("Invalid argument\n");
				}
				else if(strncmp(arg_list[2], "set_partner_id", 14) == 0)
				{
					dev.control_type = VGW_DM_ZWAVE_CONTROL_TYPE_PARTNER_ID;
					if((atoi(arg_list[3]) >= 0) && (atoi(arg_list[3]) <= 255))
					{
						dev.partner_id = (atoi(arg_list[3]));
						status = vgw_dev_mgr_zwave_control(&dev);
						if(status != VGW_DM_ZWAVE_SUCCESS)
						{
							printf("Failed to set partner id configuration\n");
						}
						else
						{
							printf("Partner id configuration set successfully\n");
						}		
					}
					else
						printf("Invalid argument\n");
				}
				else 
					printf("Invalid argument\n");
			}
			else if(arg_num == 5)
			{
				strcpy(dev.dev_id, arg_list[1]);
				if(strncmp(arg_list[2], "set_diff_temp", 13) == 0)
				{
					dev.control_type = VGW_DM_ZWAVE_CONTROL_TYPE_DIFFERENTIAL;

					if(((atoi(arg_list[3]) == 0) || (atoi(arg_list[3]) == 1)) &&
								((atoi(arg_list[4]) > 1) && (atoi(arg_list[4]) <= 6)))
					{ 
						dev.mode = (uint8_t)(atoi(arg_list[3]));
						dev.temp = (uint8_t)(atoi(arg_list[4]));
						status = vgw_dev_mgr_zwave_control(&dev);
						if(status != VGW_DM_ZWAVE_SUCCESS)
						{
							printf("Failed to set differential temp and mode\n");
						}
						else
						{
							printf("Device differential temp and mode set successfully\n");
						}
					}
					else
						printf("Invalid argument\n");
				}
				else if(strncmp(arg_list[2], "set_temp_rpt_filter", 19) == 0)
				{
					dev.control_type = VGW_DM_ZWAVE_CONTROL_TYPE_TEMP_FILTER;

					if(((atoi(arg_list[3]) >= 0) && (atoi(arg_list[3]) <= 124)) &&
						(atoi(arg_list[4]) >= 0) && (atoi(arg_list[4]) <= 124))
					{ 
						dev.lower_filter = (uint8_t)(atoi(arg_list[3]));
						dev.upper_filter = (uint8_t)(atoi(arg_list[4]));
						status = vgw_dev_mgr_zwave_control(&dev);
						if(status != VGW_DM_ZWAVE_SUCCESS)
						{
							printf("Failed to set temp reporting filter\n");
						}
						else
						{
							printf("Device temp reporting filter set successfully\n");
						}
					}
					else
					{
						printf("Invalid argument\n");
					}	
				}
				else
					printf("Invalid argument\n");
			}
			else if(arg_num == 6)
			{
				strcpy(dev.dev_id, arg_list[1]);
				if(strncmp(arg_list[2], "set_temp", 8) == 0)
				{
					dev.control_type = VGW_DM_ZWAVE_CONTROL_TYPE_TSTAT_TEMP;
				
					if(((atoi(arg_list[4]) == 0) && (atoi(arg_list[5]) >= 2) && (atoi(arg_list[5]) <= 34)
									&& ((atoi(arg_list[3]) == 0) || (atoi(arg_list[3]) == 1))) ||
						((atoi(arg_list[4]) == 1) && (atoi(arg_list[5]) >= 35) && (atoi(arg_list[5]) <= 95)
										&& ((atoi(arg_list[3]) == 0) || (atoi(arg_list[3]) == 1))))
					{
						dev.mode = atoi(arg_list[3]);
						dev.unit = atoi(arg_list[4]);
						dev.temp = (int)atoi(arg_list[5]);
						status = vgw_dev_mgr_zwave_control(&dev);
						if(status != VGW_DM_ZWAVE_SUCCESS)
						{
							printf("Failed to set tstat temp\n");
						}
						else
						{
							printf("Device tstat temp set successfully\n");
						}
					}
					else
						printf("Invalid argument\n");
				}
				else
					printf("Invalid argument\n");
			}
			else
				printf("Invalid argument\n");
		}
        else if((strncmp((arg_list[0]), "get_params", 10) == 0) && (arg_num == 3))
		{
            strcpy(dev_status.dev_id, arg_list[1]);

			if(strncmp((arg_list[2]), "temp_rpt_thr", 12) == 0)
				dev_status.param_num = DEVICE_STATUS_CONFIG_TEMP_REPORTING_THRESHOLD;

			else if(strncmp((arg_list[2]), "hvac_settings", 13) == 0)
				dev_status.param_num = DEVICE_STATUS_CONFIG_HVAC_SETTINGS;

			else if(strncmp((arg_list[2]), "utility_lock", 12) == 0)
				dev_status.param_num = DEVICE_STATUS_CONFIG_UTILITY_LOCK_OR_CURR_OVERLOAD;
				
			else if(strncmp((arg_list[2]), "tstat_power_src", 15) == 0)
				dev_status.param_num = DEVICE_STATUS_CONFIG_TSTAT_POWER_SOURCE;

			else if(strncmp((arg_list[2]), "humidity_rpt_thr", 16) == 0)
				dev_status.param_num = DEVICE_STATUS_CONFIG_HIMIDITY_REPORTING_THRESHOLD;

			else if(strncmp((arg_list[2]), "aux_heat", 8) == 0)
				dev_status.param_num = DEVICE_STATUS_CONFIG_AUX_HEAT;

			else if(strncmp((arg_list[2]), "tstat_swing", 11) == 0)
				dev_status.param_num = DEVICE_STATUS_CONFIG_TSTAT_SWING;

			else if(strncmp((arg_list[2]), "diff_mode_and_temp", 18) == 0)
				dev_status.param_num = DEVICE_STATUS_CONFIG_TSTAT_DIFFERENTAIL_MODE_AND_TEMP;

			else if(strncmp((arg_list[2]), "tstat_recovery_mode", 19) == 0)
				dev_status.param_num = DEVICE_STATUS_CONFIG_TSTAT_RECOVERY_MODE;

			else if(strncmp((arg_list[2]), "temp_rpt_filter", 15) == 0)
				dev_status.param_num = DEVICE_STATUS_CONFIG_TEMP_REPORTING_FILTER;

			else if(strncmp((arg_list[2]), "fan_timer", 9) == 0)
				dev_status.param_num = DEVICE_STATUS_CONFIG_FAN_TIMER;

			else if(strncmp((arg_list[2]), "temp_calibration", 16) == 0)
				dev_status.param_num = DEVICE_STATUS_CONFIG_TEMP_CALIBRATION;

			else if(strncmp((arg_list[2]), "display_unit", 12) == 0)
				dev_status.param_num = DEVICE_STATUS_CONFIG_DISPLAY_UNITS;        	

			else if(strncmp((arg_list[2]), "battery", 7) == 0)
				dev_status.param_num = DEVICE_STATUS_BATTERY_LEVEL;
			
			else if(strncmp((arg_list[2]), "tstat_modes", 11) == 0)
				dev_status.param_num = DEVICE_STATUS_DIFFERENTIAL_MODES;

			else if(strncmp((arg_list[2]), "tstat_sw_ver", 12) == 0)
				dev_status.param_num = DEVICE_STATUS_TSTAT_SW_VERSION;

			else if(strncmp((arg_list[2]), "energy_cons", 11) == 0)
				dev_status.param_num = DEVICE_STATUS_ENERGY_CONSUMPTION;
			
			else if(strncmp((arg_list[2]), "current_overload_prot", 21) == 0)
				dev_status.param_num = DEVICE_STATUS_CONFIG_UTILITY_LOCK_OR_CURR_OVERLOAD;
			
			else if(strncmp((arg_list[2]), "led_status", 10) == 0)
				dev_status.param_num = DEVICE_STATUS_LED_AFTER_POWER_ON;
			
			else if(strncmp((arg_list[2]), "get_watt_report", 15) == 0)
				dev_status.param_num = DEVICE_STATUS_CONFIG_WATTAGE_CHANGE_RPT;
			
			else if(strncmp((arg_list[2]), "wattage_rpt_per_thr", 19) == 0)
				dev_status.param_num = DEVICE_STATUS_MIN_CHANGE_IN_WATTAGE_PERCENT;

			else if(strncmp((arg_list[2]), "wattage_rpt_thr", 15) == 0)
				dev_status.param_num = DEVICE_STATUS_MIN_CHANGE_IN_WATTAGE;
			
			else if(strncmp((arg_list[2]), "partner_id", 10) == 0)
				dev_status.param_num = DEVICE_STATUS_PARTNER_ID;
			
			else if(strncmp((arg_list[2]), "lock_config", 11) == 0)
				dev_status.param_num = DEVICE_STATUS_LOCK_CONFIG;

			else 
			{
				printf("Invalid parameter\n");
				continue;
			}
		
            status = vgw_dev_mgr_zwave_get(&dev_status);
			if(status != VGW_DM_ZWAVE_SUCCESS)
			{
				printf("Failed to get parameter for device %s\n", arg_list[1]);
			}
        }
		else if((strncmp((arg_list[0]), "get_params", 10) == 0) && (arg_num == 4))
		{
			if(strncmp((arg_list[2]), "temp_val", 8) == 0)
			{
				if((atoi(arg_list[3]) == 1) || (atoi(arg_list[3]) == 2))
				{
					dev_status.param_num = DEVICE_STATUS_SETPOINT_TEMP;
					dev_status.data = atoi(arg_list[3]);
				}
				else
				{ 
					printf("Invalid parameter\n");
					continue;
				}
			}
			else 
			{
				printf("Invalid parameter\n");
				continue;
			}
		}
		else if((strncmp((arg_list[0]), "get_all_params_tstat", 20) == 0) && (arg_num == 2))  
		{
			status = vgw_dev_mgr_zwave_tstat_get_all(arg_list[1]);
			if(status != VGW_DM_ZWAVE_SUCCESS)
			{
				printf("Failed to get all tstat reports for device %s\n", arg_list[1]);
			}		
        }
		else if((strncmp((arg_list[0]), "get_all_params_smartswitch", 26) == 0) && (arg_num == 2))  
		{
			status = vgw_dev_mgr_zwave_smartswitch_get_all(arg_list[1]);
			if(status != VGW_DM_ZWAVE_SUCCESS)
			{
				printf("Failed to get all smart switch reports for device %s\n", arg_list[1]);
			}		
        }

		else if(strncmp((arg_list[0]), "controller_update", 17) == 0)    
		{
			if(arg_num == 2)
			{
				strcpy(end_device_ota.file_path, arg_list[1]);
				if(access(end_device_ota.file_path, F_OK) != -1)
				{
					// Firmware file is present and print path of file 
					end_device_ota.rf_ota_Type = 1;
					end_device_ota.end_device_index = 0;
					status = vgw_dev_mgr_zwave_rf_ota(&end_device_ota);
					if(status == VGW_DM_ZWAVE_SUCCESS)
					{
						printf("controller OTA done successfully \n");
					}
					else
					{
						printf("controller OTA failed \n");
					}	
				}
				else
				{
					printf("Failed to access the firmware file\n");
					continue;
				}
			}
			else
			{
				printf("Invalid arguments\n");
				continue;
			}
		}
		else if(strncmp((arg_list[0]), "end_device_update", 17) == 0)    
		{
			if(arg_num == 3)
			{
				strcpy(end_device_ota.file_path, arg_list[2]);
				if(access(end_device_ota.file_path, F_OK) != -1)
				{
					 //Firmware file is present and print path of file 
					end_device_ota.rf_ota_Type = 0;
					end_device_ota.end_device_index = (uint32_t)atoi(arg_list[1]);
					status = vgw_dev_mgr_zwave_rf_ota(&end_device_ota);
                                        if(status == VGW_DM_ZWAVE_SUCCESS)
                                        {
                                                printf("end device OTA done successfully \n");
                                        }
                                        else
                                        {
                                                printf("end device OTA failed \n");
					}
				}
				else
				{
					printf("Failed to access the firmware file\n");
					continue;
				}
			}
			else
			{
				printf("Invalid arguments\n");
				continue;
			}
		}
		else if((strncmp((arg_list[0]), "add_to_group", 12) == 0) && (arg_num == 3))
		{
			if(isnum(arg_list[1]))
			{
				status = vgw_dev_mgr_zwave_add_to_group(atoi(arg_list[1]), arg_list[2]);
				if(status == VGW_DM_ZWAVE_SUCCESS)
				{
					printf("Device added to group successfully\n");
				}else{
					printf("Failed to add device in group\n");
				}
			}
			else
			{
				printf("Invalid group no\n");
			}
		}
               	else if((strncmp((arg_list[0]), "group_info", 12) == 0) && (arg_num == 1))
		{
			status = vgw_dev_mgr_zwave_group_info();
			if(status != VGW_DM_ZWAVE_SUCCESS)
			{
				printf("Failed to print group info\n");
			}
			
		}

		else if((strncmp((arg_list[0]), "remove_group", 12) == 0) && (arg_num == 2))
		{
			status = vgw_dev_mgr_zwave_remove_group(atoi(arg_list[1]));
			if(status == VGW_DM_ZWAVE_SUCCESS)
			{
				printf("Group removed successfully\n");
			}else{
				printf("Failed to remove group\n");
			}
		}
		else if((strncmp((arg_list[0]), "remove_from_group", 17) == 0) && (arg_num == 3))
		{
			status = vgw_dev_mgr_zwave_remove_from_group(atoi(arg_list[1]), arg_list[2]);
			if(status == VGW_DM_ZWAVE_SUCCESS)
			{
				printf("Device remove from group successfully\n");
			}else{
				printf("Failed to remove device from group\n");
			}
		}
		else if((strncmp((arg_list[0]), "control_group", 13) == 0) && (arg_num >= 3) && (arg_num <= 4))  
		{
			if(strncmp(arg_list[2], "ON", 2) == 0)
			{
				group_control.control_type = 1;
				group_control.device_action = 1;
                group_control.group_no = atoi(arg_list[1]);

				status = vgw_dev_mgr_zwave_control_group(&group_control);
				if(status != VGW_DM_ZWAVE_SUCCESS)
				{
					printf("Failed to ON device in group\n");
				}
				else
				{
					printf("Device ON successfully in group\n");
				}
			}
			else if(strncmp(arg_list[2], "OFF", 3) == 0)
			{
				group_control.control_type = 1;
				group_control.device_action = 0;
                group_control.group_no = atoi(arg_list[1]);
				status = vgw_dev_mgr_zwave_control_group(&group_control);
				if(status != VGW_DM_ZWAVE_SUCCESS)
				{
					printf("Failed to OFF device in group\n");
				}
				else
				{
					printf("Device OFF successfully in group\n");
				}
			}
			else
			{
				printf("Invalid argument\n");
			}
		}
		else
		{
			printf("Invalid command\n");
		}
		*/
	}
}
