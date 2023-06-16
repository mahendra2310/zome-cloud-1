/* eslint-disable react/jsx-no-useless-fragment */
import React, { useState } from 'react';

import './admin-ui.module.less';
import {
  Layout,
  Menu,
  Breadcrumb,
  Table,
  Modal,
  Button,
  Switch,
  Tooltip,
  Card,
  Divider,
  Tabs,
  TimePicker,
} from 'antd';
import {
  UserOutlined,
  LaptopOutlined,
  NotificationOutlined,
  HomeOutlined,
  AppstoreOutlined,
  CloudDownloadOutlined,
  DeleteOutlined,
  TagOutlined,
  LeftSquareTwoTone,
  LeftOutlined,
} from '@ant-design/icons';
import {
  ApiGet,
  ApiPost,
} from '../../../../../apps/web/services/helpers/API/ApiData';
import AdminReport from '../admin-report/admin-report';
//import AdminVacant from '../admin-vacant/admin-vacant';
//import AdminVacantView from '../admin-vacant-view/admin-vacant-view';
import AdminBuilding from '../admin-building/admin-building';
import { getUserInfo } from 'apps/web/services/utils/user.util';
import AdminServer from '../admin-server-restart/admin-server-restart';
import AdminRetryMechanism from '../admin-retry-mechanism/admin-retry-mechanism';
const { TabPane } = Tabs;

const operations = <Button>Extra Action</Button>;

const { SubMenu } = Menu;
const { Content, Sider } = Layout;

export interface AdminUiProps {}

export function AdminUi(props) {
  let userRole = getUserInfo()?.role;

  const [selectedRowKeys, setSelectedRowKeys] = useState<any>([]);
  const [selectedRowKeys1, setSelectedRowKeys1] = useState<any>([]);
  const [rowData, setRowData] = useState<any>([]);
  const [rowData1, setRowData1] = useState<any>([]);
  const [gateWayName, setGateWayName] = useState<any>([]);
  const [excludeDeviceId, setExcludeDeviceId] = useState<any>([]);
  const [uuId, setUuid] = useState<any>([]);
  const [mode, setMode] = useState<any>('2');
  const [temp, setTemp] = useState(0);
  const [showFinalModal, setShowFinalModal] = useState(false);
  const [selectedDeviceIDs, setSelectedDeviceIDs] = useState<any>([]);

  const columns = [
    {
      title: 'Gateway Name',
      dataIndex: 'gateway_name',
      key: 'gateway_name',
    },
    {
      key: 'gateway_uuid',
      title: 'Gateway Uuid',
      dataIndex: 'gateway_uuid',
    },
    // {
    //   key: 'createdAt',
    //   title: 'Created Date',
    //   dataIndex: 'createdAt',
    //   render: (row) => {
    //     let d = new Date(row);
    //     let month = [
    //       'Jan',
    //       'Feb',
    //       'Mar',
    //       'Apr',
    //       'May',
    //       'Jun',
    //       'Jul',
    //       'Aug',
    //       'Sep',
    //       'Oct',
    //       'Nov',
    //       'Dec',
    //     ];

    //     let updatedate = ` ${
    //       month[d.getMonth()]
    //     } ${d.getDate()},${d.getFullYear()} ${d.getHours()}:${
    //       d.getMinutes() <= 10 ? `0${d.getMinutes()}` : d.getMinutes()
    //     }:${d.getSeconds() <= 10 ? `0${d.getSeconds()}` : d.getSeconds()}`;

    //     return updatedate;
    //   },
    // },
  ];

  const columns1 = [
    {
      title: 'Device Name',
      dataIndex: 'device_info',
      render: (row) => {
        return (
          <>
            {' '}
            {row.DeviceName?.includes('Thermostat')
              ? 'RTCoA CT-200 Smart Thermostat'
              : row.DeviceName?.includes('Smartswitch')
              ? 'Aeotec Heavy Duty Smart Switch'
              : row.DeviceName?.includes('Extender')
              ? 'Aeotec Z-Wave Extender'
              : row.DeviceName}{' '}
          </>
        );
      },
    },
    {
      title: 'Current Value',
      dataIndex: 'device_info',
      render: (row) => {
        {
          console.log('row', row);
        }
        return (
          <>
            {row.DeviceName?.includes('Thermostatdevice') ? (
              <>
                {row['Thermostat temp'] ? (
                  <>
                    {`${parseInt(
                      row['Thermostat temp']?.toString().replace(/\D/g, '')
                    )}`}{' '}
                    {row['Thermostat setpoint unit1'] === 0 ? '°C' : '°F'}
                  </>
                ) : (
                  '--'
                )}
              </>
            ) : row.DeviceName?.includes('Smartswitch') ? (
              'off'
            ) : row.DeviceName?.includes('extender') ? (
              'NA'
            ) : (
              '--'
            )}
          </>
        );
      },
    },
    // {
    //   title: 'Device Action',
    //   dataIndex: 'device_info',
    //   render: (row) => {
    //     return row.DeviceAction ? row.DeviceAction : '--';
    //   },
    // },
    {
      title: 'Device Type',
      dataIndex: 'device_info',
      render: (row) => {
        return row.DeviceType ? row.DeviceType : '--';
      },
    },
    {
      title: 'Device NodeID',
      dataIndex: 'device_info',
      render: (row) => {
        return row.DeviceNodeID ? row.DeviceNodeID : '--';
      },
    },
    {
      title: 'Device ID',
      dataIndex: 'device_info',
      render: (row) => {
        return row.DeviceID ? row.DeviceID : '--';
      },
    },
  ];
  const onSelectedRowKeysChange = async (rowKeys: any) => {
    //console.log('rowKeys :  ', rowKeys);
    setRowData(rowKeys);
    // if (props.gatewayData) await props.setSelectedRowKeys(rowKeys);
    await setSelectedRowKeys(rowKeys);
    // console.log(selectedRowKeys);
  };
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectedRowKeysChange,
  };
  const onSelectedRowKeysChange1 = async (rowKeys1: any) => {
    // console.log('rowKeys :  ', rowKeys1);

    setRowData1(rowKeys1);
    // if (props.gatewayData) await props.setSelectedRowKeys(rowKeys);
    await setSelectedRowKeys1(rowKeys1);
    // console.log(selectedRowKeys);
  };
  const rowSelection1 = {
    selectedRowKeys1,
    onChange: onSelectedRowKeysChange1,

    getCheckboxProps: (record: any) => ({
      disabled: record.device_info['DeviceType'] !== '259', // Column configuration not to be checked
      name: record.device_info['DeviceType'],
    }),
  };
  const [visible, setVisible] = useState(false);
  const [showTemprature, setShowTemprature] = useState(false);
  const [showExludeData, setShowExludeData] = useState(false);
  const [time, setTime] = useState<any>();
  const [deviceData, setDeviceData] = useState([]);

  const handleModalDevice = async (record, uid) => {
    //console.log('-----', uid);

    const data = {
      gatewayId: uid ? uid : [record.gateway_uuid],
    };

    await ApiPost('gateway/device', data)
      .then((res: any) => {
        console.log('object---', res);
        let columnData = [];
        res.data.data.map((item) => {
          item.map((rec) => {
            if (rec.device_info['DeviceType'].toString() === '259') {
              columnData.push({
                key: rec.device_id,
                device_info: rec.device_info,
                // createdAt:item.createdAt,
                // gateway_uuid:item.gateway_uuid,
                // gateway_name:item.gateway_name
              });
            }
          });
        });
        setDeviceData(columnData);
        setVisible(true);
      })
      .catch((err) => {
        console.log('error in get data!!');
      });
    // if (record.gateway_uuid !== null && record.gateway_uuid !== undefined) {
    //   await ApiGet(`device/${record.gateway_uuid}`)
    //     .then((res: any) => {
    //       //console.log('object---', res);
    //       let columnData = [];
    //       res.data.map((item) => {
    //         columnData.push({
    //           key: item.device_id,
    //           device_info: item.device_info,
    //           // createdAt:item.createdAt,
    //           // gateway_uuid:item.gateway_uuid,
    //           // gateway_name:item.gateway_name
    //         });
    //       });
    //       setDeviceData(columnData);
    //       setVisible(true);
    //     })
    //     .catch((err) => {
    //       console.log('error in get data!!');
    //     });
    // } else {
    //   let columnData = [];
    //   for (let i = 0; i < uid.length; i++) {
    //     await ApiGet(`device/${uid[i]}`)
    //       .then((res: any) => {
    //         //console.log('object---', res);

    //         res.data.map((item) => {
    //           columnData.push({
    //             key: item.device_id,
    //             device_info: item.device_info,
    //             // createdAt:item.createdAt,
    //             // gateway_uuid:item.gateway_uuid,
    //             // gateway_name:item.gateway_name
    //           });
    //         });

    //         setVisible(true);
    //       })
    //       .catch((err) => {
    //         console.log('error in get data!!');
    //       });
    //   }
    //   setDeviceData(columnData);
    // }
  };
  const handleExcludeDeviceData = () => {
    //console.log('array uid', rowData);
    //console.log('array did', rowData1);
    
    // Logic below tracks selected devices to show in Last confirm Modal implemented below 
    let allDeviceIds = [];
    for (let x = 0; x < deviceData.length; x ++){
      allDeviceIds.push(deviceData[x].key);
    }
    let selectedDeviceIds = allDeviceIds.filter(function(el) {
      return !rowData1.includes(el);
    });
    // Set Array of selected device IDs for use in display in Modal
    setSelectedDeviceIDs(selectedDeviceIds);

    if (rowData1.length === 0) {
      setExcludeDeviceId([]);
      setUuid(rowData);
      setShowTemprature(true);
    } else {
      setExcludeDeviceId(rowData1);
      setUuid(rowData);
      setShowTemprature(true);
    }
  };
  const handleTemperature = () => {
    setShowTemprature(false);
    //console.log(mode);
    //console.log(temp);
    setShowExludeData(true);
  };
  const handleSetPoint = async () => {
    //console.log('set-point');
    const data = {
      excludeDeviceId: JSON.stringify(excludeDeviceId),
      gatewayIds: JSON.stringify(rowData),
      // mode: mode,
      temprature: temp,
      minutes: time,
    };
    //console.log(data);
    setShowExludeData(false);
    setShowTemprature(false);
    setSelectedRowKeys1(null);
    setTemp(0);
    setVisible(false);

    await ApiPost('dispatchSetPoint', data)
      .then((res) => {
        //console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  // const handleTime = (e) => {
  //   //let data = e[0]._d.toString().slice(17, 25).to().getMinutes();
  //   // let time =
  //   //   e[0]._d.toString().slice(17, 25) - e[1]._d.toString().slice(17, 25);
  //   //console.log('---=-------', e[0]._d.toString().slice(17, 25));

  //   var startTime = e[0]._d;
  //   var endTime = e[1]._d;
  //   var difference = endTime.getTime() - startTime.getTime(); // This will give difference in milliseconds
  //   var resultInMinutes = Math.round(difference / 60000);

  //   setTime(resultInMinutes);
  // };

  // console.log("userRole.........",userRole)
  const handleRole = () => {
    if (userRole === 'property-owner' || userRole === 'property_owner') {
      return false;
    } else if (userRole === 'property-manager' || userRole === 'property_manager') {
      return false;
    } else {
      return true;
    }
  };

  const isUserManager = () => {
    if (userRole === "property-manager" || userRole === 'property_manager') {
      return true;
    } else {
      return false;
    }
  };

  const testCpower = () => {
    
    const currentTime = new Date();
    const twoMinAheadTime = new Date(currentTime.getTime() + 2*60000);
    const tenMinAheadTime = new Date(currentTime.getTime() + 10*60000);
    var startDateString = twoMinAheadTime.toDateString();
    var endDateçString = tenMinAheadTime.toDateString();


    let mockJSONData = JSON.stringify({'xmlData': {'DispatchEventResult': {'xmlns': 'http://schemas.datacontract.org/2004/07/VLinkService.Services.vLinkService', 'xmlns:i': 'http://www.w3.org/2001/XMLSchema-instance', 'DispatchEventList': {'DispatchEvent': {'DemandEventSourceType': '1', 'EndDate': 'Fri December 23, 2022 18:40', 'EventId': '11115', 'FacilityName': '2100 Crystal Drive - 2029818701', 'IsoId': '1', 'IsoName': 'PJM ISO', 'MeterId': '76523', 'MeterName': '06344688', 'ProductTypeId': '4', 'ProductTypeName': 'ILR', 'ProgramName': 'ILR Product Type', 'StartDate': 'Fri December 23, 2022 18:30', 'ZoneId': '141', 'ZoneName': 'ATSI'}}, 'ErrorCode': '000'}}, 'MeterId': '76523', 'ScheduleTime': 'Fri December 23, 2022 18:30'});
    mockJSONData['xmlData']['DispatchEventResult']['DispatchEventList']['DispatchEvent']['StartDate'] = twoMinAheadTime;
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost:30005/zomecloud/api/v1/cpower-mock");
    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        console.log(xhr.status);
        console.log(xhr.responseText);
      }};

    xhr.send(mockJSONData);
  };

  // Method to convert picker data into amount of minutes for dispatch setTime
  const setTimeWithPicker = (data) => {
    if (data != null) {
      let totalMin = 0;
      totalMin = data._d.getHours()*60 + data._d.getMinutes();
      console.log("total min", totalMin.toString());
      setTime(totalMin.toString());
    }
  }

  return (
    <div>

      <Tabs onTabClick={(data) => props.bred(data)}>
        {handleRole()  && (
          <TabPane tab="Dispatch Events" key="1">
            <Layout>
              <Content style={{ padding: '0 50px' }}>
                <Layout
                  className="site-layout-background"
                  style={{ padding: '24px 0' }}
                >
                  <Content style={{ padding: '0 24px', minHeight: 280 }}>
                    {selectedRowKeys?.length > 0 && (
                      // eslint-disable-next-line react/jsx-no-useless-fragment
                      <>
                        <div className="flex justify-end p-3 bg-gray-100">
                          <div className="mr-5 mt-2 cursor-pointer">
                            <Tooltip placement="top" title="Label">
                              <TagOutlined style={{ fontSize: '17px' }} />
                            </Tooltip>
                          </div>
                          {/* <div className="mr-5 cursor-pointer">
                          <Tooltip placement="top" title="Delete">
                            <DeleteOutlined style={{ fontSize: '17px' }} />
                          </Tooltip>
                        </div> */}
                          <div className="mr-5 cursor-pointer">
                            {/* <Tooltip placement="top" title="Dispatch Event"> */}
                            <div
                              onClick={() => {
                                handleModalDevice('', rowData);
                              }}
                            >
                              {/* <AppstoreOutlined />{' '} */}
                              <button className="gateway-btn-style-admin white-text-color block cursor-pointer text-center content-end">
                                Create Dispatch Event
                              </button>
                            </div>
                            {/* </Tooltip> */}
                          </div>
                        </div>
                      </>
                    )}
                    <div>
                      <p>✓ All Gateways</p>
                      <Table
                        rowSelection={rowSelection}
                        columns={columns}
                        dataSource={props.gatewayData}
                        style={{ cursor: 'pointer' }}
                        bordered
                      />
                    </div>
                  </Content>
                </Layout>
              </Content>
            </Layout>
          </TabPane>
        )}
        <TabPane tab="Reports" key="2">
          <AdminReport />
        </TabPane>
        {!isUserManager()  && (
        <TabPane tab="Buildings" key="3">
          <AdminBuilding />
        </TabPane>
        )}
        {!isUserManager()  && (
        <TabPane tab="Server" key="5">
          <AdminServer />
        </TabPane>
        )}
        {!isUserManager()  && (
        <TabPane
          tab="Retry Mechanism"
          key="6"
        >
          <AdminRetryMechanism />
        </TabPane>
        )}
      </Tabs>

      <Modal
        title={
          <>
            <div className="flex justify-start">
              <div className="mr-5">
                <Tooltip placement="bottom" title="Back">
                  <LeftOutlined
                    style={{ fontSize: '25px', cursor: 'pointer' }}
                    onClick={() => {
                      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                      showTemprature === true
                        ? setShowTemprature(false)
                        : showExludeData === true
                        ? (setShowExludeData(false), setShowTemprature(true))
                        : setVisible(false);
                    }}
                  />
                </Tooltip>
              </div>
              <div>
                <h1>
                  <strong className="">Devices</strong>
                </h1>{' '}
              </div>
            </div>
          </>
        }
        centered
        visible={visible}
        footer={null}
        onOk={() => setVisible(false)}
        onCancel={() => (
          setVisible(false),
          setShowExludeData(false),
          setShowTemprature(false),
          setTemp(0),
          setSelectedRowKeys1(null)
        )}
        width={'100%'}
        className="fullScreenModal"
      >
        <div className="p-7">
          {showTemprature ? (
            <>
              <div className="flex justify-center">
                <div className="md:w-2/5 shadow-md p-5">
                  {/* <div className="md:flex">
                    <div className="md:w-3/5 flex justify-end">
                      <h1 className="mb-0 pr-5">Mode :</h1>
                    </div>
                    <div className="md:w-4/6 pl-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="switch"
                          className="input"
                          onChange={() => {
                            mode === '2' ? setMode('3') : setMode('2');
                          }}
                        />
                        <label htmlFor="switch" className="label">
                          Toggle
                        </label>
                        <span className="pl-3">
                          {mode === '2' ? 'heat' : 'cool'}
                        </span>
                      </div>
                    </div>
                  </div> */}
                  {/* <div className="flex items-center">
                    <div className="flex justify-center items-center"></div>
                  </div> */}
                  <div className="md:flex pt-5">
                    <div className="md:w-3/5 flex justify-end">
                      <h1 className="mb-0">Temperature Change :</h1>
                    </div>
                    <div className="md:w-4/6">
                      <div className="flex items-center">
                        <div className="iconRoundFirst">
                          <p
                            onClick={() => {
                              setTemp(temp - 1);
                            }}
                          >
                            -
                          </p>
                        </div>
                        <div className="iconRound">
                          <span>{temp}</span>
                        </div>
                        <div className="iconRoundFirst">
                          <span
                            onClick={() => {
                              setTemp(temp + 1);
                            }}
                          >
                            +
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="md:flex pt-5">
                    <div className="md:w-3/5 flex justify-end">
                      <h1 className="mb-0 pr-5">Set-time :</h1>
                    </div>
                    <div className="md:w-4/6">
                      <div className="flex items-center mt-2">
                        {/* <TimePicker.RangePicker
                          onChange={(e: any) => handleTime(e)}
                        /> */}
                        <TimePicker 
                          format={"HH:mm"} 
                          onChange={(e: any) => setTimeWithPicker(e)}
                          showNow={false}
                          placeholder={"Hour | Min"}
                        />
                        {/*
                        <div className="mr-3">
                          <input
                            type="radio"
                            name="time"
                            value="5"
                            onChange={(e) => setTime(e.target.value)}
                          />{' '}
                          <label htmlFor="time1">5 min</label>
                        </div>
                        <div className="mr-3">
                          <input
                            type="radio"
                            name="time"
                            value="15"
                            onChange={(e) => setTime(e.target.value)}
                          />{' '}
                          <label htmlFor="time2">15 min</label>
                        </div>
                        <div className="mr-3">
                          <input
                            type="radio"
                            name="time"
                            value="30"
                            onChange={(e) => setTime(e.target.value)}
                          />{' '}
                          <label htmlFor="time3">30 min</label>
                      </div> */}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center pt-8">
                    <button
                      className="doneBtnStyle"
                      onClick={() => {
                        handleTemperature();
                      }}
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : showExludeData ? (
            <>
              <div className="flex justify-around">
                <div>
                  <Card
                    title="Confirm Devices for Curtailment Event"
                    bordered={false}
                    style={{ width: 400 }}
                  >
                    <h2>Excluded Devices: </h2>
                    {excludeDeviceId.length === 0 ? (
                      <h1>No device selected for exclusion</h1>
                    ) : (
                      excludeDeviceId?.map((data, key) => {
                        return (
                          <>
                            <div className="flex justify-center items-center">
                              <h1 className="mr-4">{++key}.</h1>
                              <p className="mt-2">{data}</p>
                            </div>
                          </>
                        );
                      })
                    )}
                    <Divider />
                    <div className="mt-5">
                      <div className="flex justify-center items-center">
                        <h1 className="mr-3">Temperature : </h1>
                        <span>{temp}</span>
                      </div>
                      {/* <div className="flex justify-center items-center">
                        <h1 className="mr-3">Mode : </h1>
                        <span>{mode === '2' ? 'heat' : 'cool'}</span>
                      </div> */}
                      <div className="flex justify-center items-center">
                        <h1 className="mr-3">Time duration : </h1>
                        <span>{time}</span>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
              <div className="flex justify-center mt-10">
                <button
                  className="doneBtnStyle "
                  onClick={() => {
                    handleSetPoint();
                    setShowFinalModal(true);
                  }}
                >
                  Confirm
                </button>
              </div>
            </>
          ) : (
            <>
              {' '}
              {selectedRowKeys1 !== null && selectedRowKeys1?.length > 0 ? (
                <>
                  <div className="flex justify-start p-3 bg-gray-100">
                    <div className="mr-5 cursor-pointer">
                      <Button
                        className="borderd"
                        onClick={() => {
                          handleExcludeDeviceData();
                        }}
                      >
                        Exclude
                      </Button>
                    </div>
                    <div className="mr-5 cursor-pointer">
                      <Button
                        className="borderd"
                        onClick={() => {
                          handleExcludeDeviceData();
                        }}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex justify-start p-3 bg-gray-100">
                  <div className="mr-5 cursor-pointer">
                    <Button className="borderd" disabled>
                      Exclude
                    </Button>
                  </div>
                  <div className="mr-5 cursor-pointer">
                    <Button
                      className="borderd"
                      onClick={() => {
                        handleExcludeDeviceData();
                      }}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
              <div>
              <p>✓ All Devices</p>
                <Table
                  columns={columns1}
                  rowSelection={rowSelection1}
                  dataSource={deviceData}
                  bordered
                />
              </div>
            </>
          )}
        </div>
      </Modal>
      <Modal
        title={
          <h1>Devices Selected for Configured Curtailment Scheduled</h1>
        }
        visible={showFinalModal}
        // onOk={handelEditDevice}
        onCancel={() => setShowFinalModal(false)}
        okText="Continue"
        cancelText="Continue"
        footer={null}
      >
        <div className="flex justify-center">
          <div>
        { selectedDeviceIDs.length === 0 ? (
            <h1>No device selected for curtailment.</h1>
        ) : 
        
        (
          selectedDeviceIDs?.map((data, key) => {
            return (
                 <>
                  <div className="flex justify-center items-center">
                      <h1 className="mr-4">{++key}.</h1>
                      <p className="mt-2">{data}</p>
                  </div>
                </>
              );
            })
          )}
          <button
            className="remove-btn-style white-text-color cursor-pointer "
            onClick={() => setShowFinalModal(false)}
          >
            Continue
          </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default AdminUi;
