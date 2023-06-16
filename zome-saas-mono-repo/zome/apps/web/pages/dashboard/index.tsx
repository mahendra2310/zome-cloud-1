/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @nrwl/nx/enforce-module-boundaries */
/* eslint-disable react/jsx-no-useless-fragment */
/* eslint-disable eqeqeq */
/* eslint-disable no-sequences */
import React, { useEffect, useState, useContext } from 'react';
import './dashboard.moduel.less';
//import { ApiGet } from 'apps/web/services/helpers/API/ApiData';
import { Header, Sidebar, Tabledesign, Chart } from '@zome/ui';
import { useRouter } from 'next/router';
//import { ArrowLeftOutlined } from '@ant-design/icons';
import { Badge, Breadcrumb, message, Tabs, Tooltip } from 'antd';
import { ConsoleSqlOutlined, HomeOutlined } from '@ant-design/icons';
import * as userUtil from '../../services/utils/user.util';
import Link from 'next/link';
import axios from 'axios';

import 'rxjs/add/operator/map';

import { ApiGet, ApiPost } from '../../services/helpers/API/ApiData';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import AddDevice from 'apps/web/components/add-device/addDevice';
import DeleteDevice from 'apps/web/components/delete-device/deleteDevice';
import DeviceDetails from 'apps/web/components/device-details/deviceDetails';
import SwitchDevice from 'apps/web/components/switch-device/switchDevice';
import TemperatureDevice from 'apps/web/components/temperature-device/temperatureDevice';
import { getUserInfo } from 'apps/web/services/utils/user.util';
import Activity from 'apps/web/components/activity/activityLogs';
const { TabPane } = Tabs;
export function Index() {
  let userRole = getUserInfo()?.role;
  console.log(userRole,"userrole---------- ");
  

  const router = useRouter();
  const selectedPropertyResponse = router.query.data;
  //  console.log(response,"new..");
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('x-auth-token') : null;

  const tokenNotValid = () => {
    typeof window !== 'undefined' ? (
      router.push('/')
    ) : (
      <h1>not working router push</h1>
    );
  };
  const [apiCall, setApiCall] = useState(false);

  const [gateWayName, setGateWay] = useState<any>();
  const [uuId, setUUid] = useState('');
  const [gateName, setGateName] = useState('');
  const [gateLength, setGateLength] = useState('');
  const [searchData, setSearchData] = useState('');
  const [deviceData, setDeviceData] = useState([]);
  const [callAddDevice, setCallAddDevice] = useState(false);
  const [callDeleteDevice, setCallDeleteDevice] = useState(false);
  const [deviceIdForRemove, setDeviceIdForRemove] = useState('');
  const [callDeviceDetails, setCallDeviceDetails] = useState(false);
  const [deviceIdForDetails, setDeviceIdForDetails] = useState('');
  const [callSwitchDevice, setCallSwitchDevice] = useState(false);
  const [deviceIdForSwitchDevice, setDeviceIdForSwitchDevice] = useState('');
  const [callTemperatureDevice, setCallTemperatureDevice] = useState(false);
  const [newTempPoint, setNewTempPoint] = useState();
  const [allTempData, setAllTempData] = useState();
  const [newUnit, setNewUnit] = useState('');
  const [mode, setMode] = useState();
  const [dataChange, setDataChange] = useState([]);
  const [version, setVersion] = useState();
  const [
    deviceIdForTemperatureDevice,
    setDeviceIdForTemperatureDevice,
  ] = useState('');
  //console.log('-api-call', apiCall);
  //temperatureDevice
  const [temperatureValue, setTemperatureValue] = useState(35);
  const [tValue, setValue] = useState(0);
  const [temperatureUnit, setTemperatureUnit] = useState(0);
  const [temperatureType, setTemperatureType] = useState(0);
  const [deviceAction, setDeviceAction] = useState();
  const [meterResponse, setMeterResponse] = useState();
  // const [propertyflag, setPropertyFlag] = useState(false);
  const [getGatewayFlag, setGetGatewayFlag] = useState(false);
  const [searchFlag, setSearchFlag] = useState(false);
  const [deviceDataError, setDeviceDataError] = useState('');

  const getAllDetails = async (id, name) => {
    if (userRole == 'TENANT' || userRole == 'tenant' || userRole == 'TenantAdministratorUser') {
      await ApiGet(`device/${null}`)
        .then((res: any) => {
          console.log('res ----->', res);
          if (res?.data?.data?.msg == 'no device found') {
            setDeviceData([]);
          } else {
            setDeviceData(res.data.data);
          }
          setUUid(res.data.data[0].gateway_id);
          setGateName(name);
          getVersion(id);
        })
        .catch((err) => {
          console.log('error in get data!!');
        });
      console.log('-- after api');
    } else {
      await ApiGet(`device/${id}`)
        .then((res: any) => {
          console.log('res gatway', res);
          setDeviceData(res.data.data);
          setUUid(id);
          setGateName(name);
        })
        .catch((err) => {
          console.log('error in get data!!');
        });
    }
  };

  useEffect(() => {
    setTimeout(() => {
      if ((userRole == 'TENANT' || userRole == 'tenant' || userRole == 'TenantAdministratorUser') && !deviceData) {
        setDeviceDataError(
          'Something went wrong with your request! try after few minutes'
        );
      }
    }, 5000);
  }, [deviceData]);
  const getVersion = async (uuid) => {
    await ApiGet(`version/${uuid}`)
      .then((res: any) => {
        console.log(res);
        setVersion(res.data.data);
      })
      .catch((err) => {
        console.log('error in get data!!');
      });
  };
  useEffect(() => {
    //console.log('uid----', uuId);
    //console.log('gatewayname--', gateName);
    if (uuId !== '' && gateName !== '') {
      getAllDetails(uuId, gateName);
    }
    if (userRole == 'TENANT' || userRole == 'tenant' || userRole == 'TenantAdministratorUser') {
      getAllDetails(uuId, gateName);
    }
  }, [dataChange]);

  useEffect(() => {
    if (!getUserInfo()) {
      router.push('/');
    } else {
      router.push('/dashboard');
    }
    const getAllGateWay = async (value) => {
      // console.log('1');
      if (value) {
        // console.log('2');
        await ApiGet(`gateway?withstatus=${value}`)
          .then((res: any) => {
            if (res.data.msg == 'You are not associated with any gateway.') {
              setGateWay(res.data);
            } else {
              setGateWay(res.data.data);
            }
            // setPropertyFlag(false);
          })
          .catch((err) => {
            console.log('error in get data!!');
          });
      }
      // var config: any = {
      //   method: 'get',
      //   url:
      //     'https://kn4m1b8zj7.execute-api.us-east-1.amazonaws.com/dev/apigateway/zomecloud/api/v1/get-gateway',
      //   headers: {
      //     'x-auth-token':
      //       'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MGI1MGNiNzYxMzFiZDRlOGU0OWM5ZDgiLCJlbWFpbCI6InpvbWVfYW5hbHlzdEBnbWFpbC5jb20iLCJ1c2VyUm9sZSI6InN1cHBvcnQiLCJpYXQiOjE2MjM2NjM1Mzh9.o-9I0bJhhgByEkK3npRQJ2BuudCwjdaZ5LLauvSa7W4',
      //     'Content-Type': 'application/json',
      //   },
      // };

      // axios(config)
      //   .then(function (response) {
      //     console.log(JSON.stringify(response.data));
      //   })
      //   .catch(function (error) {
      //     console.log('-------', error);
      //   });
    };

    const data = {
      meterids: selectedPropertyResponse,
    };
    const getGatewaysByMeterId = async () => {
      await ApiPost('gateway-dashboard', data)
        .then((res: any) => {
          if (res.data.msg == 'You are not associated with any gateway.') {
            setGateWay(res.data);
          } else {
            setGateWay(res.data);
          }
        })
        .catch((err) => {
          console.log('error in get data!!');
        });
    };

    const getGatewaysByUser = async () => {
      await ApiGet('gateway-by-user')
          .then((res: any) => {
            setGateWay(res.data);
          })
          .catch((err) => {
            console.log('error in get data!!');
      });
    };

    if (handleRole()) {
      if (selectedPropertyResponse) {
        console.log("selectedPropertyResponse");
        console.log(selectedPropertyResponse);
        if (typeof selectedPropertyResponse === 'string' || selectedPropertyResponse instanceof String) {
          let string = new String(selectedPropertyResponse);
          let jsonparse = JSON.parse(string.valueOf());
          console.log(jsonparse);
          ApiPost('gateway-by-property',jsonparse)
          .then(async (res: any) => {
            console.log('res------------',  res.data);
            const queryData = res.data;
            setGateWay(queryData);
         })
         .catch((err) => {
           console.log(err);
          });
      }
      }
      if (!selectedPropertyResponse) {
        
        if (userRole == "property-owner" || userRole == "property-manager") {
          getGatewaysByUser();
        } else {
          getAllGateWay('false');
          setGetGatewayFlag(true);
        }
      }

      if (searchFlag == true) {
        setTimeout(() => {
          getAllGateWay('false');
        }, 2000);
        setSearchFlag(false);
      }

      // setTimeout(() => {
      //   if(!selectedPropertyResponse){
      //     getAllGateWay('false');
      //   }

      //   if(selectedPropertyResponse){
      //     getGatewaysByMeterId('true');
      //   }
      // }, 2000);
    } else {
        getAllGateWay('true');
    }

  }, []);

  const handleChangeSubmit = (id, name) => {
    setApiCall(true);
    setUUid(id);
    setGateName(name);
  };

  const handleChangeSubmitBack = () => {
    setApiCall(false);
    window.location.reload;
  };

  const handleSearchData = async (data) => {
    setSearchData(data);

    setGateWay([]);
    setTimeout(async () => {
      await ApiGet(`search?gatewayName=${data}`)
        .then((res: any) => {
          setTimeout(async () => {
            setGateWay(res.data.data);
            setGateLength(res.data.data?.length);
            setSearchFlag(true);
          }, 500);
        })
        .catch((err) => {
          console.log(err);
        });
    }, 1500);
  };

  const handleAddDevice = (gid: any) => {
    setCallAddDevice(true);
    setUUid(gid);
  };
  const handleDeleteDevice = (id, row) => {
    setCallDeleteDevice(true);
    setDeviceIdForRemove(id);
    setUUid(row.gateway_id);
  };
  const handleDeviceDetails = (id, row) => {
    setCallDeviceDetails(true);
    setDeviceIdForDetails(id);
    setUUid(row.gateway_id);
  };
  const handleSwitchDevice = (id, action, row) => {
    setCallSwitchDevice(true);
    setDeviceIdForSwitchDevice(id);
    setDeviceAction(action);
    setUUid(row.gateway_id);
  };
  const handleTemperatureDevice = (
    temp = 50,
    unit = 1,
    type,
    did,
    setpoint,
    mode,
    setUnit,
    row
  ) => {
    console.log('calll', row);
    setCallTemperatureDevice(true);
    setDeviceIdForTemperatureDevice(did);
    setNewTempPoint(setpoint);
    setMode(mode);
    setTemperatureValue(temp);
    setValue(temp);
    setTemperatureUnit(unit);
    setTemperatureType(type);
    setNewUnit(setUnit);
    setUUid(row.gateway_id);
    setAllTempData(row);

    userUtil.setTempPopup(true);
    //console.log({ callTemperatureDevice });
  };

  console.log('userRole --', userRole);

  const handleRole = () => {
    if (userRole == 'TENANT' || userRole == 'TenantAdministratorUser') {
      return false;
    } else if (userRole == 'tenant' || userRole == 'TenantAdministratorUser' ) {
      return false;
    } else {
      return true;
    }
  };
  const handleTab = (data) => {
    if (data == '1') {
      router.push('/dashboard');
    } else if (data == '2') {
      router.push('/activity');
    } else if (data == '3') {
      router.push('/profile');
    }
  };
  return (
    <>
      {token ? (
        <div>
          <Header data={handleSearchData} showSearch="true" />

          <div className="flex">
            <div className="s-layout">
              {handleRole() && <Sidebar />}
              <main
                className={`${
                  userRole == 'TENANT' || userRole == 'tenant' || userRole == 'TenantAdministratorUser'
                    ? 's-layout__content-full'
                    : 's-layout__content'
                } `}
              >
                {apiCall || userRole == 'TENANT' || userRole == 'tenant' || userRole == 'TenantAdministratorUser'? (
                  <>
                    <div className="container-fluid pt-20">
                      <div className="w-full">
                        <div className="font-weight-bold mt-5">
                          {userRole == 'TENANT' || userRole == 'tenant' || userRole == 'TenantAdministratorUser'? (
                            <Tabs
                              onTabClick={(data) => handleTab(data)}
                              defaultActiveKey="1"
                            >
                              <TabPane tab="Control" key="1"></TabPane>
                              <TabPane tab="Log" key="2"></TabPane>
                              <TabPane tab="Account" key="3"></TabPane>
                            </Tabs>
                          ) : (
                            <Breadcrumb>
                              <Breadcrumb.Item
                                onClick={() => handleChangeSubmitBack()}
                                className="cursor-pointer"
                              >
                                <HomeOutlined />
                                <span>Home</span>
                              </Breadcrumb.Item>
                              <Breadcrumb.Item className="cursor-pointer ">
                                <span>Device table</span>
                              </Breadcrumb.Item>
                              <Breadcrumb.Item className="cursor-pointer">
                                <span>{gateName}</span>
                              </Breadcrumb.Item>
                            </Breadcrumb>
                          )}
                        </div>
                        {deviceDataError && (
                          <p style={{ color: 'red' }}>{deviceDataError}*</p>
                        )}
                        <Tabledesign
                          uid={uuId}
                          name={gateName}
                          device={deviceData}
                          getDevice={() => getAllDetails(uuId, gateName)}
                          addDevice={handleAddDevice}
                          deleteDevice={handleDeleteDevice}
                          deviceDetails={handleDeviceDetails}
                          switchDevice={handleSwitchDevice}
                          temperatureDevice={handleTemperatureDevice}
                          version={version}
                        />
                      </div>
                      {callAddDevice === true ? (
                        <AddDevice
                          dataAddDevice={setCallAddDevice}
                          uid={uuId}
                          getDevice={getAllDetails}
                        />
                      ) : null}
                      {callDeleteDevice === true ? (
                        <DeleteDevice
                          uid={uuId}
                          did={deviceIdForRemove}
                          dataDeleteDevice={setCallDeleteDevice}
                          setdatachange={setDataChange}
                          datachange={dataChange}
                        />
                      ) : null}
                      {callDeviceDetails === true ? (
                        <DeviceDetails
                          uid={uuId}
                          did={deviceIdForDetails}
                          dataDeviceDetails={setCallDeviceDetails}
                        />
                      ) : null}
                      {callSwitchDevice === true ? (
                        <SwitchDevice
                          uid={uuId}
                          did={deviceIdForSwitchDevice}
                          dataDeviceDetails={setCallSwitchDevice}
                          dataDeviceAction={deviceAction}
                        />
                      ) : null}
                      {callTemperatureDevice === true ? (
                        <TemperatureDevice
                          uid={uuId}
                          did={deviceIdForTemperatureDevice}
                          dataDeviceTemperature={setCallTemperatureDevice}
                          temperatureType={temperatureType}
                          temperatureUnit={temperatureUnit}
                          tValue={tValue}
                          temperatureValue={temperatureValue}
                          temperatureSetPoint={newTempPoint}
                          deviceSetMode={mode}
                          deviceNewUnit={newUnit}
                          tempratureAllData={allTempData}
                        />
                      ) : null}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="font-weight-bold ml-8 mt-24">
                      <Breadcrumb>
                        <Link href="/dashboard">
                          <Breadcrumb.Item className="cursor-pointer">
                            <HomeOutlined />
                            <span>Home /</span>
                          </Breadcrumb.Item>
                        </Link>
                        <Breadcrumb.Item className="cursor-pointer"></Breadcrumb.Item>
                      </Breadcrumb>
                    </div>

                    <div className="container-fluid pt-10 mobile-view-top-space">
                      <div className="mobile-search">
                        <div>
                          <div className="relative flex w-full flex-wrap items-stretch">
                            <span className="z-10 h-full  absolute text-center text-blueGray-300 flex absolute bg-transparent rounded  items-center justify-center w-8 pl-3 py-3">
                              <FontAwesomeIcon
                                icon={faSearch}
                                className="search-icon-color"
                              />
                            </span>
                            <input
                              type="search"
                              placeholder="Search devices here"
                              className="search-inout-style px-3 py-3 relative bg-white rounded  outline-none focus:outline-none pl-10"
                              onChange={(e) => handleSearchData(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                      {gateWayName?.msg !==
                      'You are not associated with any gateway.' ? (
                        <div className="md:flex md:flex-wrap lg:flex lg:flex-wrap xl:flex xl:flex-wrap 2xl:flex 2xl:flex-wrap">
                          {gateLength && gateLength.toString() === '0' ? (
                            <h1>Not data found {searchData}</h1>
                          ) : (gateWayName && gateWayName.toString() === '') ||
                            gateWayName === [] ||
                            gateWayName === undefined ||
                            gateWayName === null ? (
                            <div className="loading"></div>
                          ) : (
                            gateWayName &&
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            gateWayName?.map((data: any, key) => {
                              return (
                                <>
                                  <div className="md:w-1/3 lg:w-1/4 xl:w-1/3 2xl:w-1/5 m-pl-0 m-pr-0 pl-5 md:pl-5 md:pr-5 pr-5">
                                    <div key={key} className="relative">
                                      <button
                                        className="gateway-btn-style white-text-color block cursor-pointer text-center mb-10 mr-4"
                                        onClick={(e) => (
                                          getAllDetails(
                                            data.gateway_uuid,
                                            data.gateway_name
                                          ),
                                          getVersion(data.gateway_uuid),
                                          setApiCall(true)
                                        )}
                                      >
                                        {data.gateway_name}
                                      </button>
                                      {data.status == 'ready' ? (
                                        <Tooltip placement="top" title="Ready ">
                                          <div
                                            className="online-ofline-icon"
                                            style={{
                                              backgroundColor:
                                                data.status == 'ready' &&
                                                '#00FF00',
                                            }}
                                          ></div>
                                        </Tooltip>
                                      ) : data.status == 'offline' ? (
                                        <Tooltip
                                          placement="top"
                                          title="Offline"
                                        >
                                          <div
                                            className="online-ofline-icon"
                                            style={{
                                              backgroundColor: '#FF0000',
                                            }}
                                          ></div>
                                        </Tooltip>
                                      ) : data.status == 'busy' ? (
                                        <Tooltip placement="top" title="Busy">
                                          <div
                                            className="online-ofline-icon"
                                            style={{
                                              backgroundColor:
                                                data.status == 'busy' &&
                                                '#FFFF00',
                                            }}
                                          ></div>
                                        </Tooltip>
                                      ) : (
                                        <Tooltip
                                          placement="top"
                                          title="Offline"
                                        >
                                          <div
                                            className="online-ofline-icon"
                                            style={{
                                              backgroundColor: '#FF0000',
                                            }}
                                          ></div>
                                        </Tooltip>
                                      )}
                                    </div>
                                  </div>
                                </>
                              );
                            })
                          )}
                        </div>
                      ) : (
                        <h1>{gateWayName?.msg}</h1>
                      )}
                    </div>
                  </>
                )}
              </main>
            </div>
          </div>
        </div>
      ) : (
        tokenNotValid()
      )}
    </>
  );
}

export default Index;
