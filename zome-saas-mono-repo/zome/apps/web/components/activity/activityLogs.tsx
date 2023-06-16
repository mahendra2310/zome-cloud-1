import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Table } from 'antd';
import CountDown from 'ant-design-pro/lib/CountDown';
import { ApiGet, ApiPost } from 'apps/web/services/helpers/API/ApiData';
import moment from 'moment';
const { Option } = Select;

export function Activity(props) {
  const [logs, setLogs] = useState([]);
  const [visible, setVisible] = useState(true);

  const handleChangeSubmit1 = async () => {
    await ApiGet('history')
      .then((res: any) => {
        setLogs(res?.data.reverse());
      })
      .catch((err) => {
        console.log('error in post data!!');
      });
  };

  useEffect(() => {
    handleChangeSubmit1();
  }, []);
  const columnsSupport = [
    {
      title: 'Activity',
      dataIndex: 'action_details',
      key: 'action_details',
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (row: any) => {
        return <>{moment(row).format('MM/DD/YYYY')}</>;
      },
    },
    {
      title: 'Time',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (row: any) => {
        return <>{moment(row).format('HH:mm:ss')}</>;
      },
    },
    {
      title: 'Control User',
      dataIndex: 'control',
      key: 'control',
    },
    {
      title: 'Indoor Temp',
      dataIndex: 'customFields',
      render: (row: any) => {
        return (
          <>
            {row['Thermostat temp'].toString().replace(/\D/g, '')}{' '}
            {row['Display Units'] ? row['Display Units'] : 'Fahrenheit'}
          </>
        );
      },
    },
  ];
  return (
    <>
      <div className="p-10 ant-table-mobile-view">
        <Table
          // title="Logs"
          columns={columnsSupport}
          dataSource={logs}
          bordered
          // pagination={true}
        />
      </div>
    </>
  );
}

export default Activity;
