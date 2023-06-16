/* eslint-disable @nrwl/nx/enforce-module-boundaries */
/* eslint-disable react/jsx-no-useless-fragment */
import React, { useState, useEffect } from 'react';
import './table.module.less';
import { Input, InputNumber, Modal, Tooltip } from 'antd';

import { Table } from 'antd';
import { ApiPut } from 'apps/web/services/helpers/API/ApiData';
import axios from 'axios';
import { getUserInfo } from 'apps/web/services/utils/user.util';
import * as localStoreUtil from '../../../../../apps/web/services/utils/localstore.util';
import isMobile from 'is-mobile';
import { useAtom } from 'jotai';
import { mobilePopup } from '../../../src/../../../apps/web/providers/UserProvider';
export interface TableProps {}

export function Tabledesign(props) {
  console.log('isMobile', isMobile());
  let TempPopup = localStoreUtil?.default.get_data('tempPopup');
  console.log('TempPopup', TempPopup);
  const [popup, setPopup] = useAtom(mobilePopup);

  const [tableData, setTableData] = useState(props.device);
  const [popUpState, setPopUpState] = useState(true);
  const [visible, setVisible] = useState(false);
  const [dataNotfetch, setDataNotfetch] = useState(false);
  useEffect(() => {
    setTableData(props.device);
    setPopup(true);
  }, [props.device]);

  const handelEditDeviceDesc = async (e, id) => {
    const data = {
      deviceId: id,
      description: e.target.value,
    };
    setTableData((prevState) => {
      for (let [index, item] of prevState.entries()) {
        if (String(item.device_id) === String(id)) {
          prevState[index].device_info['desc'] = e.target.value;
          break;
        }
      }
      // let temp=prevState.find(item=>item.deviceId==id)
      // prevState[i].device_info['desc'] = e.target.value;
      return [...prevState];
    });
    // console.log(tableData)
    await ApiPut('device-desc', data)
      .then((res) => {
        //console.log(res);
        //props.getDevice();
      })
      .catch((err) => {
        console.log(err);
      });
    // if (
    //   (e && e.charCode === 13) ||
    //   (e && e.type === 'keypress') ||
    //   (e && e.type === 'blur')
    // ) {
    //   console.log(data);
    //   await ApiPut('device-desc', data)
    //     .then((res) => {
    //       console.log(res);
    //       props.getDevice;
    //     })
    //     .catch((err) => {
    //       console.log(err);
    //     });
    // }
  };

  let i = 1;
  const columnsSupport = [
    {
      title: 'Device Name',
      dataIndex: 'device_info',
      render: (row) => {
        return (
          <>
            {row.DeviceName?.includes('Thermostat')
              ? 'RTCoA CT-200 Smart Thermostat'
              : row.DeviceName?.includes('Smartswitch')
              ? 'Aeotec Heavy Duty Smart Switch'
              : row.DeviceName?.includes('Extender')
              ? 'Aeotec Z-Wave Extender'
              : row.DeviceName}
          </>
        );
      },
    },
    {
      title: 'Device Description',
      dataIndex: 'device_info',
      render: (row, ii, i) => {
        return (
          <>
            {/* <div>
              {row?.desc ? (
                <>

                  <input
                    type="text"
                    //value={row?.desc}
                    defaultValue={row?.desc}
                    className="w-full border-2 border-grey-600"
                    onBlur={(e: any) =>
                      handelEditDeviceDesc(e, row['DeviceID'])
                    }
                    onKeyPress={(e: any) => {
                      if (e && e.charCode === 13)
                        handelEditDeviceDesc(e, row['DeviceID']);
                    }}
                  />
                </>
              ) : (
                '--'
              )}
            </div> */}
            <div>
              <>
                <Input
                  value={row.desc}
                  onChange={(e) => handelEditDeviceDesc(e, row['DeviceID'])}
                  type="text"
                />
              </>
            </div>
          </>
        );
      },
    },
    {
      title: 'Device Dsk',
      dataIndex: 'device_info',
      render: (row) => {
        return <>{row?.dsk ? row.dsk : '--'}</>;
      },
    },
    {
      title: 'Current Value',
      dataIndex: 'device_info',
      render: (row) => {
        return (
          <>
            {row.DeviceName?.includes('Thermostatdevice') ||
            row.DeviceName?.includes('Thermostat device') ? (
              <>
                <>
                  {row['Thermostat temp'] ? (
                    row['Display Units'] &&
                    row['Display Units'] == 'Fahrenheit' ? (
                      <>
                        {row['Thermostat setpoint unit1'] === 1 ||
                        row['Thermostat setpoint unit1'] === '1' ? (
                          <>
                            {' '}
                            {row['Thermostat temp'] ? (
                              `${parseInt(
                                row['Thermostat temp']
                                  .toString()
                                  .replace(/\D/g, '')
                              )}` + '°F'
                            ) : (
                              <> 35 °C </>
                            )}
                          </>
                        ) : (
                          // <>{`${temperatureValue}` + '°F'} </>
                          <>
                            {' '}
                            {row['Thermostat temp'] ? (
                              `${Math.floor(
                                ((parseInt(
                                  row['Thermostat temp']
                                    .toString()
                                    .replace(/\D/g, '')
                                ) -
                                  32) *
                                  5) /
                                  9 +
                                  1
                              )}` + '°C'
                            ) : (
                              <>35 °F</>
                            )}
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        {row['Thermostat setpoint unit1'] === 0 ||
                        row['Thermostat setpoint unit1'] === '0' ? (
                          <>
                            {' '}
                            {row['Thermostat temp'] ? (
                              `${Math.floor(
                                ((parseInt(
                                  row['Thermostat temp']
                                    .toString()
                                    .replace(/\D/g, '')
                                ) -
                                  32) *
                                  5) /
                                  9 +
                                  1
                              )}` + '°C'
                            ) : (
                              <> 35 °C </>
                            )}
                          </>
                        ) : (
                          // <>{`${temperatureValue}` + '°F'} </>
                          <>
                            {' '}
                            {row['Thermostat temp'] ? (
                              `${parseInt(
                                row['Thermostat temp']
                                  .toString()
                                  .replace(/\D/g, '')
                              )}` + '°F'
                            ) : (
                              <>35 °F</>
                            )}
                          </>
                        )}
                      </>
                    )
                  ) : (
                    '--'
                  )}
                </>

                {/* {row['Thermostat temp'] ? (
                  <>
                    {`${parseInt(
                      row['Thermostat temp']?.toString().replace(/\D/g, '')
                    )}`}{' '}
                    {(row['Thermostat setpoint unit'] &&
                      row['Thermostat setpoint unit']
                        .toString()
                        ?.includes('Fahrenheit')) ||
                    row['Thermostat setpoint unit'].toString()?.includes('1')
                      ? '°F'
                      : row['Thermostat setpoint unit'].toString()?.includes('0') &&  '°C'}
                  </>
                ) : (
                  '--'
                )} */}
              </>
            ) : row.DeviceName?.includes('Smartswitch') ||
              row.DeviceName?.includes('Smart switch') ? (
              row['Power State'] ? (
                row['Power State']
              ) : (
                'Off'
              )
            ) : row.DeviceName?.includes('extender') ||
              row.DeviceName?.includes('Zwave Range Extenderdevice') ? (
              'NA'
            ) : (
              '--'
            )}
          </>
        );
      },
    },
    {
      title: 'Device Type',
      dataIndex: 'device_info',
      render: (row) => {
        return row.DeviceName;
      },
    },
    {
      title: 'Device NodeID',
      dataIndex: 'device_info',
      render: (row) => {
        return row.DeviceNodeID;
      },
    },
    {
      title: 'Device ID',
      dataIndex: 'device_info',
      render: (row) => {
        return row.DeviceID;
      },
    },
    {
      title: 'Action',
      dataIndex: 'device_info',
      render: (row, data) => {
        return (
          <>
            <div className="flex justify-around m-block">
              <div
                onClick={() =>
                  props.deleteDevice(
                    row.DeviceID ? row.DeviceID : row['device id'],
                    data
                  )
                }
                className="cursor-pointer mr-3 text-red-600"
              >
                <Tooltip placement="left" title="Remove">
                  {/* <DeleteOutlined className="px-2 " /> */}

                  {/* <DeleteIcon style={{ width: '30px', height: '30px' }} /> */}
                  <img
                    src="https://t4.ftcdn.net/jpg/03/46/38/41/240_F_346384140_CSEbRk7NsnZ6Mo01cBc3vUfipngdjHWl.jpg"
                    className="w-10"
                  />
                </Tooltip>
              </div>

              {row.DeviceType === '259' || row.DeviceType === 259 ? (
                <div
                  onClick={() =>
                    props?.temperatureDevice(
                      row['Thermostat temp'] != undefined
                        ? row['Thermostat temp']
                        : 50,
                      row['Thermostat setpoint unit'] != undefined
                        ? row['Thermostat setpoint unit']
                        : 1,
                      row['Thermostat setpoint type'] != undefined
                        ? row['Thermostat setpoint type']
                        : 1,
                      row?.DeviceID,
                      row['Thermostat setpoint temp'] != undefined
                        ? row['Thermostat setpoint temp']
                        : '',
                      row['Thermostat setpoint type'] != undefined
                        ? row['Thermostat setpoint type']
                        : 'Cooling',
                      row['Thermostat setpoint unit'] !== undefined
                        ? row['Thermostat setpoint unit']
                        : 'celsius',
                      data
                    )
                  }
                  className="cursor-pointer mr-3 mt-2"
                >
                  <Tooltip placement="right" title="Temperature">
                    <img src="/temperature.png" className="w-7" />
                  </Tooltip>
                </div>
              ) : row.DeviceType === '256' || row.DeviceType === 256 ? (
                <div
                  className="mr-3 cursor-pointer  mt-2"
                  onClick={() =>
                    props.switchDevice(row.DeviceID, row.DeviceAction, data)
                  }
                >
                  <Tooltip placement="left" title="Power on/off">
                    {/* <PoweroffOutlined className="px-2" /> */}
                    <img src="/power.png" className="w-7" />
                  </Tooltip>
                </div>
              ) : (
                <div className="mr-4">
                  <h1 className="">--</h1>
                </div>
              )}

              <div className="mr-3 text-blue-600">
                <div
                  onClick={() => props.deviceDetails(row.DeviceID, data)}
                  className="cursor-pointer mt-2"
                >
                  <Tooltip placement="left" title="Details">
                    {/* <InfoCircleOutlined className="px-2" /> */}
                    <img
                      src="https://cdn4.iconfinder.com/data/icons/top-search-7/128/_info_-about_information_help_notification_description-256.png"
                      className="w-7"
                    />
                  </Tooltip>
                </div>
              </div>
            </div>
          </>
        );
      },
    },
  ];

  const columnsTenant = [
    {
      title: 'Device Name',
      dataIndex: 'device_info',
      render: (row) => {
        return (
          <>
            {row.DeviceName?.includes('Thermostat')
              ? 'RTCoA CT-200 Smart Thermostat'
              : row.DeviceName?.includes('Smartswitch')
              ? 'Aeotec Heavy Duty Smart Switch'
              : row.DeviceName?.includes('Extender')
              ? 'Aeotec Z-Wave Extender'
              : row.DeviceName}
          </>
        );
      },
    },

    {
      title: 'Device ID',
      dataIndex: 'device_info',
      render: (row) => {
        return row.DeviceID;
      },
    },
    {
      title: 'Action',
      dataIndex: 'device_info',
      render: (row, data) => {
        return (
          <>
            <div className="flex justify-around m-block">
              {isMobile() &&
                popup &&
                (row.DeviceType === '259' || row.DeviceType === 259
                  ? props?.temperatureDevice(
                      row['Thermostat temp'] != undefined
                        ? row['Thermostat temp']
                        : 50,
                      row['Thermostat setpoint unit'] != undefined
                        ? row['Thermostat setpoint unit']
                        : 1,
                      row['Thermostat setpoint type'] != undefined
                        ? row['Thermostat setpoint type']
                        : 1,
                      row?.DeviceID,
                      row['Thermostat setpoint temp'] != undefined
                        ? row['Thermostat setpoint temp']
                        : '',
                      row['Thermostat setpoint type'] != undefined
                        ? row['Thermostat setpoint type']
                        : 'Cooling',
                      row['Thermostat setpoint unit'] !== undefined
                        ? row['Thermostat setpoint unit']
                        : 'celsius',
                      data
                    )
                  : row.DeviceType === '256' || row.DeviceType === 256
                  ? props.switchDevice(row.DeviceID, row.DeviceAction, data)
                  : null)}
              {row.DeviceType === '259' || row.DeviceType === 259 ? (
                <div
                  onClick={() =>
                    props?.temperatureDevice(
                      row['Thermostat temp'] != undefined
                        ? row['Thermostat temp']
                        : 50,
                      row['Thermostat setpoint unit'] != undefined
                        ? row['Thermostat setpoint unit']
                        : 1,
                      row['Thermostat setpoint type'] != undefined
                        ? row['Thermostat setpoint type']
                        : 1,
                      row?.DeviceID,
                      row['Thermostat setpoint temp'] != undefined
                        ? row['Thermostat setpoint temp']
                        : '',
                      row['Thermostat setpoint type'] != undefined
                        ? row['Thermostat setpoint type']
                        : 'Cooling',
                      row['Thermostat setpoint unit'] !== undefined
                        ? row['Thermostat setpoint unit']
                        : 'celsius',
                      data
                    )
                  }
                  className="cursor-pointer mr-3 mt-2"
                >
                  <Tooltip placement="right" title="Temperature">
                    <img src="/temperature.png" className="w-7" />
                  </Tooltip>
                </div>
              ) : row.DeviceType === '256' || row.DeviceType === 256 ? (
                <div
                  className="mr-3 cursor-pointer  mt-2"
                  onClick={() =>
                    props.switchDevice(row.DeviceID, row.DeviceAction, data)
                  }
                >
                  <Tooltip placement="left" title="Power On/Off">
                    {/* <PoweroffOutlined className="px-2" /> */}
                    <img src="/power.png" className="w-7" />
                  </Tooltip>
                </div>
              ) : (
                <div className="mr-4">
                  <h1 className="">--</h1>
                </div>
              )}

              <div className="mr-3 text-blue-600">
                <div
                  onClick={() => props.deviceDetails(row.DeviceID, data)}
                  className="cursor-pointer mt-2"
                >
                  <Tooltip placement="left" title="Details">
                    {/* <InfoCircleOutlined className="px-2" /> */}
                    <img
                      src="https://cdn4.iconfinder.com/data/icons/top-search-7/128/_info_-about_information_help_notification_description-256.png"
                      className="w-7"
                    />
                  </Tooltip>
                </div>
              </div>
            </div>
          </>
        );
      },
    },
  ];
  useEffect(() => {
    setTimeout(() => {
      if (tableData?.length === 0) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    }, 180000);
  }, [tableData]);
  return (
    <>
      {tableData?.length === 0 && !visible ? (
        <div>
          {/* <span>fetching details...</span> */}
          <div className="loader-container">
            <div className="flex flex-col justify-center w-full h-full">
              <button className="btn btn-ghost btn-lg self-center normal-case text-white">
                <div className="flex justify-between">
                  <div className="loading mt-5"></div>
                  <div className="ml-10">
                    {' '}
                    <span>fetching devices...</span>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      ) : (
        tableData?.length === 0 &&
        visible && (
          <Modal
            title="Somthing went wrong with fetching devices"
            visible={visible}
            onCancel={() => {
              window.location.reload();
            }}
            footer={null}
            width={600}
          >
            <div>
              <div>
                <p className="text-emerald-300">
                  Our server is busy with other command please wait or try
                  later...
                </p>
              </div>
            </div>
          </Modal> 
        )
      )}
      <div>
        <div className="flex justify-end">
          <div className="mt-5"></div>
          <div>
            {getUserInfo()?.role === 'support' && (
              <button
                onClick={() => props.addDevice(props.uid)}
                className="gateway-btn-style white-text-color block cursor-pointer text-center mb-2 content-end ml-3"
              >
                Add Device
              </button>
            )}
          </div>
        </div>
        <div className="right-text-alignment">
          <i>
            <p>{props?.version?.ms_version}</p>
            <p>{props?.version?.image_version}</p>
          </i>
        </div>

        <div>
          <Table
            columns={
              getUserInfo()?.role === 'support'
                ? columnsSupport
                : getUserInfo()?.role === 'TENANT' || getUserInfo()?.role === 'tenant' || getUserInfo()?.role ===  'TenantAdministratorUser'
                ? columnsTenant
                : columnsSupport
            }
            dataSource={tableData}
            bordered
            pagination={isMobile() ? false : { showSizeChanger: false }}
            title={() =>
              props.name ? (
                <>
                  <span>{props.name + ' (' + props.uid + ') '}</span>
                </>
              ) : (
                ''
              )
            }
          />
        </div>
      </div>
    </>
  );
}

export default Tabledesign;
