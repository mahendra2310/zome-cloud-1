/* eslint-disable react/jsx-no-useless-fragment */
import React, { useEffect, useState } from 'react';
import { Table, Tag, Space, Tooltip } from 'antd';
import './admin-report.module.less';
import {
  AppstoreOutlined,
  DeleteOutlined,
  DownloadOutlined,
  TagOutlined,
} from '@ant-design/icons';
import { CSVLink, CSVDownload } from 'react-csv';
import { ApiGet } from 'apps/web/services/helpers/API/ApiData';
import CsvDownload from 'react-json-to-csv';
import { getUserInfo } from 'apps/web/services/utils/user.util';
/* eslint-disable-next-line */
export interface AdminReportProps {}

export function AdminReport(props: AdminReportProps) {
  let userRole = getUserInfo()?.role;
  const [selectedRowKeys, setSelectedRowKeys] = useState<any>();
  const [download, setDownload] = useState([]);
  const [report, setReport] = useState([]);

  const onSelectedRowKeysChange = async (rowKeys: any) => {
    console.log('rowKeys :  ', rowKeys);
    let allCsvdata = [];
    // if (props.gatewayData) await props.setSelectedRowKeys(rowKeys);

    await setSelectedRowKeys(rowKeys);
    for (let i = 0; i < rowKeys.length; i++) {
      for (let j = 0; j < rowKeys[i].gateway_devices.length; j++) {
        let csvData = {
          event_name: rowKeys[i].event_name,
          created_by: rowKeys[i].created_by,
          excluded_device: rowKeys[i].excluded_device,
          _id: rowKeys[i]._id,
          updated_by: rowKeys[i].updated_by,
          updated_at: rowKeys[i].updated_at,
          temprature_value: rowKeys[i].temprature_value,
          temprature_mode: rowKeys[i].temprature_mode,
          schedular_date: rowKeys[i].schedular_date,
          reset_done: rowKeys[i].reset_done,
          last_check: rowKeys[i].last_check,
          is_deleted: rowKeys[i].is_deleted,
          irc_request_id: rowKeys[i].irc_request_id,
          gateway_uuid: rowKeys[i].gateway_uuid,
          gateway_devices_id: rowKeys[i].gateway_devices[j]._id,
          set_temprature: rowKeys[i].gateway_devices[j].set_temprature,
          set_mod_request_id: rowKeys[i].gateway_devices[j].set_mod_request_id,
          gateway_devices_set_mod_request_id:
            rowKeys[i].gateway_devices[j].set_mod_request_id,
          gateway_devices_irc_request_id:
            rowKeys[i].gateway_devices[j].irc_request_id,
          get_mode: rowKeys[i].gateway_devices[j].get_mode,
          device_uuid: rowKeys[i].gateway_devices[j].device_uuid,
          device_type: rowKeys[i].gateway_devices[j].device_type,
          device_name: rowKeys[i].gateway_devices[j].device_name,
          gateway_devices_device_id: rowKeys[i].gateway_devices[j].device_id,
          currunt_mode_temprature_info_set_point_unit:
            rowKeys[i].gateway_devices[j].currunt_mode_temprature_info &&
            rowKeys[i].gateway_devices[j].currunt_mode_temprature_info[
              'set_point_unit'
            ],
          currunt_mode_temprature_info_set_point_type:
            rowKeys[i].gateway_devices[j].currunt_mode_temprature_info &&
            rowKeys[i].gateway_devices[j].currunt_mode_temprature_info[
              'set_point_type'
            ],
          currunt_mode_temprature_info_set_point_temp:
            rowKeys[i].gateway_devices[j].currunt_mode_temprature_info &&
            rowKeys[i].gateway_devices[j].currunt_mode_temprature_info[
              'set_point_temp'
            ],
          currunt_mode_temprature_info_set_point_mode:
            rowKeys[i].gateway_devices[j].currunt_mode_temprature_info &&
            rowKeys[i].gateway_devices[j]?.currunt_mode_temprature_info[
              'set_point_mode'
            ],
          final_temprature_info_set_point_unit:
            rowKeys[i].gateway_devices[j]?.previouse_temprature_info[
              'set_point_unit'
            ],
          final_temprature_info_set_point_type:
            rowKeys[i].gateway_devices[j]?.previouse_temprature_info[
              'set_point_type'
            ],
          final_temprature_info_set_point_temp:
            rowKeys[i].gateway_devices[j]?.previouse_temprature_info[
              'set_point_temp'
            ],
          final_temprature_info_set_point_mode:
            rowKeys[i].gateway_devices[j]?.previouse_temprature_info[
              'set_point_mode'
            ],
          previouse_temprature_info_set_point_unit:
            rowKeys[i].gateway_devices[j]?.final_temprature_info &&
            rowKeys[i].gateway_devices[j]?.final_temprature_info[
              'set_point_unit'
            ],
          previouse_temprature_info_set_point_type:
            rowKeys[i].gateway_devices[j]?.final_temprature_info &&
            rowKeys[i].gateway_devices[j]?.final_temprature_info[
              'set_point_type'
            ],
          previouse_temprature_info_set_point_temp:
            rowKeys[i].gateway_devices[j]?.final_temprature_info &&
            rowKeys[i].gateway_devices[j]?.final_temprature_info[
              'set_point_temp'
            ],
          previouse_temprature_info_set_point_mode:
            rowKeys[i].gateway_devices[j]?.final_temprature_info &&
            rowKeys[i].gateway_devices[j]?.final_temprature_info[
              'set_point_mode'
            ],
        };
        console.log('csvData', csvData);
        allCsvdata.push(csvData);
        // setDownload([...download, csvData]);
      }
    }

    setDownload(allCsvdata);
  };
  console.log('data----', download);
  //console.log(download);
  useEffect(() => {
    const getReport = async () => {
      await ApiGet('reports')
        .then((res: any) => {
          console.log(res);
          let columnData = [];
          res.data
            .slice()
            .reverse()
            .map((item) => {
              columnData.push({
                key: item,
                data: item,
                // createdAt:item.createdAt,
                // gateway_uuid:item.gateway_uuid,
                // gateway_name:item.gateway_name
              });
            });

          setReport(columnData);
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
    getCheckboxProps: (record) => ({
      disabled:
        selectedRowKeys?.length > 0
          ? record.key._id !== selectedRowKeys[0]._id && true
          : false,
    }),
  };
  // const csvData = [
  //   ['firstname', 'lastname', 'email'],
  //   ['Ahmed', 'Tomi', 'ah@smthing.co.com'],
  //   ['Raed', 'Labes', 'rl@smthing.co.com'],
  //   ['Yezzi', 'Min l3b', 'ymin@cocococo.com'],
  // ];
  const csvData = [['firstname', 'lastname', 'email']];

  const columns = [
    {
      title: 'Event Name',
      dataIndex: 'data',
      render: (row) => {
        return row?.event_name;
      },
    },
    // {
    //   title: 'Device Type',
    //   dataIndex: 'data',
    //   render: (row) => {
    //     return row?.gateway_devices[0]?.device_type;
    //   },
    // },
    {
      title: 'Schedular Date',
      dataIndex: 'data',
      render: (row) => {
        let d = new Date(row?.schedular_date);
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

        let updatedate = ` ${
          month[d.getMonth()]
        } ${d.getDate()},${d.getFullYear()} ${d.getHours()}:${
          d.getMinutes() <= 10 ? `0${d.getMinutes()}` : d.getMinutes()
        }:${d.getSeconds() <= 10 ? `0${d.getSeconds()}` : d.getSeconds()}`;

        return updatedate;
      },
    },
    {
      title: 'Status',
      key: 'tags',
      dataIndex: 'data',
      render: (row) => (
        <>
          {/* {tags.map((tag) => {
            let color = tag.length > 5 ? 'green' : 'red';
            if (tag === 'PENDING') {
              color = 'Orange';
            } */}

          {row?.reset_done === true ? (
            <Tag color="green" key="1">
              SUCCESS
            </Tag>
          ) : (
            <Tag color="yellow" key="1">
              PENDING
            </Tag>
          )}

          {/* })} */}
        </>
      ),
    },
  ];

  const data = [
    {
      key: '1',
      name: 'Thermostatdevice',
      age: 32,
      address: '01 july 2021',
      tags: ['FAIL'],
    },
    {
      key: '2',
      name: 'Smartswitch',
      age: 42,
      address: '01 june 2021',
      tags: ['SUCCESS'],
    },
    {
      key: '3',
      name: 'Thermostatdevice',
      age: 32,
      address: '02 june 2021',
      tags: ['PENDING'],
    },
  ];
  return (
    <>
      <div>
        {selectedRowKeys?.length > 0 && (
          <>
            <div className="flex justify-start p-3 bg-gray-100">
              <div className="mr-5 cursor-pointer">
                <Tooltip placement="top" title="Label">
                  <TagOutlined />
                </Tooltip>
              </div>
              <div className="mr-5 cursor-pointer">
                <Tooltip placement="top" title="Delete">
                  <DeleteOutlined />
                </Tooltip>
              </div>
              <div className="mr-5 cursor-pointer">
                <Tooltip placement="top" title="Dispatch Event">
                  <div>
                    <AppstoreOutlined />{' '}
                  </div>
                </Tooltip>
              </div>
              <div className="mr-5 cursor-pointer">
                <Tooltip placement="top" title="Download Report">
                  <div>
                    {/* <CSVLink data={[download]} className="text-black">
                      <DownloadOutlined />
                    </CSVLink>{' '} */}
                    <CsvDownload
                      data={download}
                      filename={
                        download.length > 1
                          ? 'events_report.csv'
                          : `${download[0]?.event_name}.csv`
                      }
                    >
                      <DownloadOutlined />
                    </CsvDownload>
                    {/* {download.map((data) => {
                      <CsvDownload data={data} filename={'events_report'} />;
                    })} */}
                  </div>
                </Tooltip>
              </div>
            </div>
          </>
        )}

        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={report}
        />
      </div>
    </>
  );
}

export default AdminReport;
