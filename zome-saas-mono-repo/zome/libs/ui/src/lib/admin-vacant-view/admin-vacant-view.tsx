/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @typescript-eslint/no-empty-interface */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @nrwl/nx/enforce-module-boundaries */
/* eslint-disable react/jsx-no-useless-fragment */
import React, {useEffect , useState } from 'react';
import { Input, InputNumber, Modal, Table, Tooltip, message } from 'antd';
import './admin-vacant-view.module.less';
import { Form } from '@zome/ui';
import { ConsoleSqlOutlined } from '@ant-design/icons';
import { ApiGet , ApiPost } from '../../../../../apps/web/services/helpers/API/ApiData';

export interface AdminReportProps { }

var lowerRange = 62;
var upperRange = 82;

export function AdminVacantView(props: AdminReportProps) {
  // eslint-disable-next-line prefer-const

  const [deletePopup, setDeletePopup] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [tempVisible, setTempVisible] = useState(false);
  const [error, setError] = useState(false);
  const [hoverKey, setHoverKey] = useState<number | null | string>(null);
  const [vacantUnit , setVacantUnit] = useState([])
  const [deleteId , setDeleteId] = useState('')
  const [switchVisisble, setSwitchVisisble] = useState(false);
  const [toggle, setToggle] = useState('');
  const [mode , setMode] = useState('')
  const [tSetpointTemp , setTsetpointTemp] = useState('')
  const [tTemp , setTtemp] = useState('')
  const [tSetPointUnit , setTsetPointUnit] = useState('')
  const [tSetPointType , setTsetPointType] = useState('')
  const [allDetailsData, setAllDetailsData] = useState(null);
  const [allDetailsMsg, setAllDetailsMsg] = useState(false);
  const [allDetailsDate, setAllDetailsDate] = useState(null);
  const showPopconfirm = () => {
    setDeletePopup(true);
  };

  // When the user moves the arrow to the delete icon, the function below is executed.
  const handleMouseEnter = (key: number) => {
    setHoverKey(key);
  };
  
   // When the user moves the out arrow to the delete icon, the function below is executed.
  const handleMouseLeave = () => {
    setHoverKey(null);
  };

  useEffect(()=>{
    const fetchAllVacantUnit = async ()=>{
        await ApiGet("vacancyMode")
        .then((res:any)=>{
          setVacantUnit(res.data)
          console.log(vacantUnit)
        })
        .catch((error)=>{
          console.log(error)
        })
     }

     fetchAllVacantUnit()
  },[])

  const temperatureDetails = async(deviceID, deviceType)=>{
    
    if(deviceType == '256' || deviceType == 256){
      await ApiGet(`deviceForVacantView/${deviceID}`)
      .then((res: any) => {
        setSwitchVisisble(true)

        if (res.data.data.device_info['Power State'].includes('On')) {
          setToggle('toggle2');
        } else {
          setToggle('toggle1');
        }
      })
      .catch((error) => {
        console.log(error)
      })
      
    }else{
      await ApiGet(`deviceForVacantView/${deviceID}`)
      .then((res: any) => {
        setTempVisible(true)
        console.log(res.data.data)
        if(res.data.data.device_info["Thermostat mode"]== 'Auto' || res.data.data.device_info["Thermostat mode"]== 'auto'){
          setMode('Auto')
        }else if(res.data.data.device_info["Thermostat mode"]== 'cool' || res.data.data.device_info["Thermostat mode"]== 'Cool'){
          setMode('Cool')
        }else if(res.data.data.device_info["Thermostat mode"]== 'heat' || res.data.data.device_info["Thermostat mode"]== 'Heat'){
          setMode('Heat')
        }else{
          setMode('Off')
        }

        if(res.data.data.device_info["Thermostat setpoint temp"]){
          setTsetpointTemp(res.data.data.device_info["Thermostat setpoint temp"])
        }

        if(res.data.data.device_info["Thermostat temp"]){
          setTtemp(res.data.data.device_info["Thermostat temp"])
        }else{
          setTtemp('50')
        }

        if (res.data.data.device_info["Thermostat setpoint unit"]== "Fahrenheit") {
          setTsetPointUnit("Fahrenheit")
        } else {
          setTsetPointUnit("Celsius")
        }

        if (res.data.data.device_info["Thermostat setpoint type"]== "Cooling") {
          setTsetPointType("Cooling")
        } else {
          setTsetPointType("Heating")
        }

      })
      .catch((error) => {
        console.log(error)
        setTempVisible(false)
      })
      
    }
    
  }

  const DeviceDetails = async (deviceId , gatewayId)=>{
    const deviceInfo = {
      deviceId,
      gatewayId
    }
    await ApiPost("device-details",deviceInfo)
    .then((res:any)=>{
          setDetailsVisible(true)
          setAllDetailsData(res.data.data.deviceDetails);
          setAllDetailsMsg(res.data.data.msg);
          let d = new Date(res.data?.data?.deviceDetails?.updated_at);
          let month = [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
          ];
          //console.log('data', d);
          let updatedate = ` ${
            month[d.getMonth()]
          } ${d.getDate()},${d.getFullYear()} ${d.getHours()}:${
            d.getMinutes() <= 10 ? `0${d.getMinutes()}` : d.getMinutes()
          }:${d.getSeconds() <= 10 ? `0${d.getSeconds()}` : d.getSeconds()}`;
          setAllDetailsDate(updatedate);
          //console.log(updatedate);
          console.log(updatedate);
        })
        .catch((error)=>{
          setDetailsVisible(false)
          console.log(error)
        })
  }

 const columnsSupport = [
    {
      title: 'Property Name',
      dataIndex: 'property_name',
    },
    {
      title: 'Gateway Name',
      dataIndex: 'gateway_name',
    },
    {
      title: ' Apt Unit #',
      dataIndex: 'apt_unit',
    },
    {
      title: 'Device Type',
      dataIndex: 'device_type',
    },
    {
      title: 'Device ID',
      dataIndex: 'device_id',
    },
    {
      title: 'Current Value',
      dataIndex: 'current_value',
    },
    ,
    {
      title: 'Device Status',
      dataIndex: 'device_status',
    },
    {
      title: 'Action',
      dataIndex: '_id',
      render: (row, data) => {
        return (
          <>
            <div
              className="flex justify-around m-block"
              style={{ width: '100px' }}
            >
              <div className="cursor-pointer text-red-600 pr-2">
                <Tooltip placement="left" title="Take out of Vacancy Mode">
                  <img
                    src={hoverKey === data._id ? "/delete2.png": "/delete1.png"}
                    onClick={()=>deleteVacantUnit(data._id)}
                    width="30px"
                    height="30px"
                    className="transform hover:scale-125 transition-all duration-200"
                    onMouseEnter={() => handleMouseEnter(data._id)}
                    onMouseLeave={handleMouseLeave}
                  />
                </Tooltip>
              </div>

              <div className="cursor-pointer pr-2">
                {
                  data.device_type == "259" ? (
                    <div>
                      <Tooltip placement="right" title="Temperature">
                        <img
                          src="/temperature.png"
                          // className="w-7"
                          onClick={() => temperatureDetails(data.device_id,data.device_type)}
                          width="29px"
                          height="29px"
                        />
                      </Tooltip>
                    </div>
                  ) : data.device_type == "256" ? (
                    <div>
                      <Tooltip placement="left" title="Power on/off">
                        <img
                          src="/power.png"
                          // className="w-7"
                          onClick={() => temperatureDetails(data.device_id,data.device_type)}
                          width="29px"
                          height="29px"
                        />
                      </Tooltip>
                    </div>
                  ) : (
                    <div className="mr-4">
                      <h1 className="">--</h1>
                    </div>
                  )
                }

              </div>

              <div className="text-blue-600">
                <Tooltip placement="left" title="Device Details">
                  <img
                    src="https://cdn4.iconfinder.com/data/icons/top-search-7/128/_info_-about_information_help_notification_description-256.png"
                    // className="w-7"
                    onClick={() => DeviceDetails(data.device_id,data.gateway_uuid)}
                    width="29px"
                    height="29px"
                  />
                </Tooltip>
              </div>
            </div>
          </>
        );
      },
    },
  ];


  const deleteVacantUnit = (id)=>{
    setDeletePopup(true)
    setDeleteId(id)
    console.log(id,"deletedId")
  }

  
  const deleteOnOkay = async()=>{
    const data = {
      _id : deleteId
    }
    await ApiPost('/deleteVacantUnit',data)
    .then((res:any)=>{

      let updatedPropertylist = vacantUnit.filter(
        (eachproperty: any) => eachproperty.apartment_id != res.data._id
      );
      setVacantUnit(updatedPropertylist);
      console.log(res.data._id,"dataResponse from backend")
      message.success("Removed from ZOME’s Vacancy Mode")
    })
    .catch((err)=>{
      message.error("internal server error")
      console.log(err)
    })

    setDeletePopup(false)
  }

  return (
    <div>
      <Table columns={columnsSupport} dataSource={vacantUnit} />

      <div>
        <div
          className="border-4 border-x-4 p-10 w-50 rounded-lg"
          style={{ width: '60%' }}
        >
          <div>
            <h1>
              Set automated safety range: Low{' '}
              <span>
                <InputNumber
                  min={58}
                  max={85}
                  defaultValue={62}
                  onChange={(e) => {
                    if (e <= 57 || e >= 86) {
                      setError(true);
                    } else {
                      lowerRange = e;
                      setError(false);
                    }
                  }}
                />
              </span>{' '}
              °F &nbsp; &nbsp; High{' '}
              <InputNumber
                min={58}
                max={85}
                defaultValue={82}
                onChange={(e) => {
                  if (e <= 57 || e >= 86) {
                    setError(true);
                  } else {
                    upperRange = e;
                    setError(false);
                  }
                }}
              />
              °F
            </h1>
          </div>
          <div>
            <h1>
              Set time to trigger automated temperature return:{' '}
              <InputNumber
                min={5}
                max={300}
                defaultValue={60}
                onChange={(e) => {
                  if (e <= 5 || e >= 300) {
                    setError(true);
                  } else {
                    setError(false);
                  }
                }}
              />
              minutes
            </h1>
          </div>
          <div>
            <h1>
              Set steady state preferred temperature for vacant units:{' '}
              <InputNumber
                min={62}
                max={82}
                defaultValue={68}
                onChange={(e) => {
                  if (e <= 61 || e >= 83) {
                    setError(true);
                  } else {
                    setError(false);
                  }
                }}
              />
              °F High{' '}
            </h1>
          </div>
          <div>
            <button
              className="gateway-btn-style-admin white-text-color block cursor-pointer text-center content-end"
              onClick={(e) => {
                console.log(lowerRange);
                console.log(upperRange);

                if (lowerRange >= upperRange) {
                  setError(true);
                } else {
                  message.success("Automation Set Successfully!");
                  setError(false);
                }
              }}
            >
              <span className="mr-3">Save</span>
            </button>
          </div>
        </div>
        {error && (
          <div>
            <p style={{ marginBottom: '0', color: 'red' }}>
              *for set automated safety range minimum [58] and maximum [85]. LOW must be less than HIGH to set
            </p>

            <p style={{ marginBottom: '0', color: 'red' }}>
              *for set time to trigger automated temperature return minimum [5]
              and maximum [300] minute
            </p>

            <p style={{ marginBottom: '0', color: 'red' }}>
              *for Set steady state preferred temperature for vacant units
              minimum [62] and maximum [82]
            </p>
          </div>
        )}
      </div>

      <Modal
        title="Confirm Removal"
        visible={deletePopup}
        onOk={() => deleteOnOkay()}
        onCancel={() => setDeletePopup(false)}
        okText="Yes"
        cancelText="Cancel"
      >
        <p>
        Are you sure you want to take this unit out of ZOME’s Vacancy Mode?
        </p>
      </Modal>

      <Modal
      title="Device Details"
      visible={detailsVisible}
      onCancel={() => setDetailsVisible(false)}
      footer={null}
      width={600}
      >
        <div>
          <div>
            {/* {console.log(
              'datatatatatatatat---------------------------',
              allDetailsMsg && allDetailsMsg.toString() === null
            )} */}
            {allDetailsMsg?.toString() === null ||
            allDetailsMsg?.toString() === '' ||
            allDetailsMsg?.toString() === undefined ? (
              <div className="my-20">
                <div className="loading"></div>
              </div>
            ) : allDetailsMsg?.toString() === 'true' ? (
              <>
                {allDetailsData &&
                  Object?.keys(allDetailsData?.device_info).map((key, i) => (
                    <p key={i}>
                      <span className="font-bold"> {key} : </span>
                      <span>{allDetailsData?.device_info[key]}</span>
                    </p>
                  ))}{' '}
                <div className="flex justify-end text-xs mt-5">
                  <span className="font-bold"> Last updated at: </span>{' '}
                  <p> {allDetailsDate && allDetailsDate}</p>
                </div>
              </>
            ) : (
              <h1>Wait for two minutes. Fetching the device info...</h1>
            )}
          </div>
        </div>
      </Modal>

          <Modal
        //title="temprature"
        visible={tempVisible}
        // onOk={handelEditDevice}
        onCancel={() => setTempVisible(false)}
        //okText="delete"
        //cancelText="cancle"
        width={360}
        footer={null}
      >
          <div className="app-container">
          <div className="temperature-display-container bg-lime-200">
            <div
              className={`temperature-display bg-lime-200 `}
              style={{ background: '#abce65' }}
            >
              <div className="">
                <div className="mt-10 text-base">
                  <p>{
                      tSetPointType
                    }</p>
                </div>
                {' '}
               {
               tSetPointUnit == "Fahrenheit" ?
               `${parseInt(tSetpointTemp.toString().replace(/\D/g, ''))}`+ ' °F'
               : Math.floor((parseInt(tSetpointTemp.toString().replace(/\D/g, '')) * 1.8) + 32)+ ' °F'
              }
              {' '}
              <div className="mt-2 text-base">
                  <p>{
                      tSetPointUnit == "Fahrenheit" ?
                      `${parseInt(tTemp.toString().replace(/\D/g, ''))}`+ ' °F'
                      : Math.floor((parseInt(tTemp.toString().replace(/\D/g, '')) * 1.8) + 32)+ ' °F'
                    }</p>
                </div>
              </div>
            </div>
          </div>
          <div className="button-container ">
            <div></div>
            <button className="text-5xl font-weight-bold button" onClick={()=>setTempVisible(false)}>-</button>
            <button className="text-4xl font-weight-bold button" onClick={()=>setTempVisible(false)}>+</button>
          </div>
        </div>{' '}
        <>
          <div className="mt-10">
            <div className="md:w-4/6">
              <div className="flex items-center mt-2">
                <li className="nav-item mr-5 ">
                  <h1>Mode:</h1>
                </li>
                <div className="mr-3">
                  <input type="radio" name="time" value="OFF" checked={mode == 'Off'} onClick={()=>setTempVisible(false)}/>{' '}
                  <label htmlFor="time1">Off</label>
                </div>
                <div className="mr-3">
                  <input type="radio" name="time" value="AUTO" checked={mode == 'Auto'} onClick={()=>setTempVisible(false)}/>{' '}
                  <label htmlFor="time2">Auto</label>
                </div>
                <div className="mr-3">
                  <input type="radio" name="time" value="HEAT" checked={mode == 'Heat'} onClick={()=>setTempVisible(false)}/>{' '}
                  <label htmlFor="time2">Heat</label>
                </div>
                <div className="mr-3">
                  <input type="radio" name="time" value="COOL" checked={mode == 'Cool'} onClick={()=>setTempVisible(false)}/>{' '}
                  <label htmlFor="time3">Cool</label>
                </div>
              </div>
            </div>
          </div>
        </>
        <div className="flex justify-center">
          <button className="temp-set-btn text-white  block cursor-pointer text-center mb-10 mt-10" onClick={()=>setTempVisible(false)}>
            Set temperature
          </button>
        </div>
      </Modal>

      {toggle && (
        <Modal
          title="Smart Switch ON/OFF"
          visible={switchVisisble}
          onCancel={() => setSwitchVisisble(false)}
          footer={null}
          width={300}
        >
          {toggle === 'toggle1' ? (
            <>
              <div className="flex justify-around items-center">
                <div>
                  <label
                    htmlFor="toggle1"
                    className="toggleWrapper1"
                    onClick={() => setSwitchVisisble(false)}
                  >
                    <div className="toggle1 p-2"></div>
                  </label>{' '}
                </div>
                <div>
                  <h1>OFF</h1>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-around items-center">
                <div>
                  <label
                    htmlFor="toggle2"
                    className="toggleWrapper2"
                    onClick={() => setSwitchVisisble(false)}
                  >
                    <div className="toggle2"></div>
                  </label>
                </div>
                <div>
                  <h1>ON</h1>
                </div>
              </div>
            </>
          )}
        </Modal>
      )}
    </div>
  );
}

export default AdminVacantView;