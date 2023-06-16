/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @nrwl/nx/enforce-module-boundaries */
/* eslint-disable react/jsx-no-useless-fragment */
import React, { useEffect, useState } from 'react';
import {
  Table,
  Tag,
  Space,
  Tooltip,
  Modal,
  DatePicker,
  TimePicker,
  message,
  Checkbox,
} from 'antd';
import './admin-vacant.module.less';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import {
  AppstoreOutlined,
  DeleteOutlined,
  DownloadOutlined,
  TagOutlined,
} from '@ant-design/icons';
import { CSVLink, CSVDownload } from 'react-csv';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { ApiGet , ApiPost } from 'apps/web/services/helpers/API/ApiData';
import CsvDownload from 'react-json-to-csv';
import { getUserInfo } from 'apps/web/services/utils/user.util';
/* eslint-disable-next-line */
export interface AdminReportProps {}

export function AdminVacant(props: AdminReportProps) {
  // eslint-disable-next-line prefer-const
  let userRole = getUserInfo()?.role;
  const [selectedRowKeys, setSelectedRowKeys] = useState<any>([]);
  const [selectedRowKeysvacant, setSelectedRowKeysVacant] = useState<any>();
  const [confirmData, setConfirmData] = useState([]);
  const [report, setReport] = useState([]);
  const [visible, setVisible] = useState(false);
  const [visibleConfirm, setVisibleConfirm] = useState(false);
  const [visibleSchedule, setVisibleSchedule] = useState(false);
  const [selectedPropertyData, setSelectedPropertyData] = useState([]);

  const [checked, setChecked] = useState(false);

  const toggleChecked = () => {
    setChecked(!checked);
  };

  const onChange = (e: CheckboxChangeEvent) => {
    console.log('checked = ', e.target.checked);
    setChecked(e.target.checked);
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSelectedRowKeysChange = async (rowKeys: any) => {
    await setSelectedRowKeys(rowKeys);
  };
  const onSelectedRowKeysChangeForVacant = async (rowKeys: any) => {
    await setSelectedRowKeysVacant(rowKeys);
  };
  const format = 'HH:mm';

  const setPopup = ()=>{
    message.success("Units Successfully Entered ZOME’s Vacancy Mode")
    setVisibleConfirm(false)
  }

  useEffect(() => {
    const getReport = async () => {
      await ApiGet('/fetchAllProperty')
        .then((res: any) => {
          setReport(res.data);
        })
        .catch((err) => {
          console.log(err);
        });
    };

    handleRole() && getReport();
  }, []);


  const handleRole = () => {
    if (userRole == 'TENANT' || userRole == 'TenantAdministratorUser') {
      return false;
    } else if (userRole == 'tenant' || userRole == 'TenantAdministratorUser') {
      return false;
    } else {
      return true;
    }
  };
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectedRowKeysChange,
  };


  const rowSelectionvacant = {
    selectedRowKeysvacant,
    onChange: onSelectedRowKeysChangeForVacant,
    onSelect: (record, selected, selectedRows, nativeEvent) => {
      console.log('---------', record, selectedRows);
      let newData = [];
      selectedRows.map((re) => {
        newData.push(re.location);
      });
      setConfirmData(newData);
    },
    onSelectAll: (selected, selectedRows, changeRows) => {
      console.log('---------', selected, selectedRows);
      let newData = [];
      selectedRows.map((re) => {
        newData.push(re.location);
      });
      setConfirmData(newData);
    },
  };
  console.log('selected modal data...', confirmData);

  const columns = [
    {
      title: 'Property Name',
      dataIndex: 'propertyName',
      key: 'propertyName',
    },
    {
      title: 'Property Address',
      dataIndex: 'propertyAddress',
      key: 'propertyAddress',
    },
    {
      title: ' Units in Vacancy Mode',
      dataIndex: 'vacantUnits',
      key: 'vacantUnits',
    },
    {
      title: 'Total Vacant Units',
      dataIndex: 'totalUnits',
      key: 'totalUnits',
    },

  ];

  const deviceColumns = [
    {
      title: 'Property Name',
      dataIndex: 'propertyName',
      key: 'Property Name',
    },
    {
      title: 'Gateway Name',
      dataIndex: 'gatewayName',
      key: 'Gateway Name',
    },
    {
      title: 'Apt Unit #',
      dataIndex: 'AptName',
      key: 'Apt Unit #',
    },
    {
      title: 'Device Type',
      dataIndex: 'DeviceType',
      key: 'Device Type',
    },
    {
      title: 'Device ID',
      dataIndex: 'deviceId',
      key: 'Device ID',
    },
    {
      title: 'Current Value',
      dataIndex: 'currentValue',
      key: 'Current Value',
    },
    {
      title: 'Device Status',
      dataIndex: 'status',
      key: 'Device Status',
    }
  ];

  console.log(selectedRowKeys,"selectedRowKeysIds....from properties")

    const getDetailsOfSelectedProperty = async (selectedPropertiesIds) => {
    const data = {
      propertiesIds : selectedPropertiesIds
    }
    await ApiPost('/fetchAllDevicesByPropertyId',data)
    .then((res:any)=>{
      console.log(res.data,"dataResponse from backend")
      setSelectedPropertyData(res.data)
    })
    .catch((err)=>{
      console.log(err)
    })
    }


  const selectedProperties = ()=>{
    setVisible(true)
    getDetailsOfSelectedProperty(selectedRowKeys)
  }


  return (
    <>
      {selectedRowKeys?.length > 0 && (
        <>
          <div className="flex justify-between p-3 bg-gray-100">
            <div>
              <h1>Choose Properties with Vacant Units</h1>
            </div>
            <div className="mr-5 cursor-pointer">
              <div>
                <button
                  className="gateway-btn-style-admin white-text-color block cursor-pointer text-center content-end"
                  onClick={selectedProperties}
                >
                  Select
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={report}
        rowKey="_id"
      />
      <Modal
        title="Choose Unit(s) to Put in Vacancy Mode Now"
        centered
        visible={visible}
        footer={null}
        onOk={() => setVisible(false)}
        onCancel={() => setVisible(false)}
        width={'100%'}
        className="fullScreenModal"
      >
        <>
          <div className="p-7">
            {' '}
            <div>
              <Table
                rowSelection={rowSelectionvacant}
                columns={deviceColumns}
                dataSource={selectedPropertyData}
                rowKey="_id"
              />
            </div>
            {selectedRowKeysvacant?.length > 0 && (
              <div className="w-full flex justify-around">
                <button
                  className="gateway-btn-style-admin white-text-color block cursor-pointer text-center content-end"
                  onClick={() => setVisibleConfirm(true)}
                >
                  <span className="mr-3">Confirm</span>
                </button>
                <button
                  className="gateway-btn-style-admin white-text-color block cursor-pointer text-center content-end"
                  onClick={() => setVisibleSchedule(true)}
                >
                  <span className="mr-3">Schedule</span>
                </button>
              </div>
            )}
          </div>

          <Modal
            title="Confirm Unit(s) to Put in Vacancy Mode Now"
            centered
            visible={visibleConfirm}
            footer={null}
            onOk={() => setVisibleConfirm(false)}
            onCancel={() => setVisibleConfirm(false)}
            width={'30%'}
          >
            <div className="p-7">
              {' '}
              {selectedRowKeysvacant?.length > 0 && (
                <div className="w-full text-center">
                  <ol>
                    {confirmData.map((data, i) => {
                      return (
                        <li>
                          <h3>
                            
                          </h3>
                        </li>
                      );
                    })}
                  </ol>
                  <div className="w-full flex justify-center ">
                    <button
                      className="gateway-btn-style-admin white-text-color block cursor-pointer text-center content-end"
                      onClick={setPopup}
                    >
                      <span className="mr-3">Save</span>
                    </button>
                  </div>
                  <h4>
                     Click to commit these apartment units to enter into ZOME’s Vacancy Mode
                  </h4>
                </div>
              )}
            </div>
          </Modal>
          <Modal
            title="Schedule Vacancy Timing for Selected Device(s)"
            centered 
            visible={visibleSchedule}
            footer={null}
            onOk={() => setVisibleSchedule(false)}
            onCancel={() => setVisibleSchedule(false)}
            width={'50%'}
            >

              {/* logic for selecting devices */}
              <div className="w-full text-center">
                    <ol>
                      {confirmData.map((data, i) => {
                        return (
                          <li>
                            <h3>
                              
                            </h3>
                          </li>
                        );
                      })}
                    </ol>
              </div>

            <div className="p-7 text-center ">
              {checked ? <DatePicker.RangePicker showTime/> : <DatePicker showTime/>}
              <div className="w-full mt-10">
              <div className="w-full flex justify-center ">
              <Checkbox checked={checked} onChange={onChange}>
                {"End Date Known"}
              </Checkbox>
              </div>
              </div>
              {selectedRowKeysvacant?.length > 0 && (
                <div className="w-full mt-10">
                  <div className="w-full flex justify-center ">
                    <button
                      className="gateway-btn-style-admin white-text-color block cursor-pointer text-center content-end"
                      onClick={() => setVisibleSchedule(false)}
                    >
                      <span className="mr-3">Save</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </Modal>
        </>
      </Modal>
    </>
  );
}

export default AdminVacant;
