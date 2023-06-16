import React from 'react';
import { Table, Tag, Space } from 'antd';

import './antdtable.module.less';

/* eslint-disable-next-line */
export interface AntdtableProps {}

export function Antdtable(props: any) {
  let i = 0;
  const columns = [
    // {
    //   title: 'Srno',

    //   key: 'name',

    //   Cell: (row: any) => {
    //     //console.log(row)
    //     return <div style={{ textAlign: 'center' }}>1</div>;
    //   },
    //   width: 70,
    // },
    {
      title: 'UserName',
      dataIndex: 'username',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'age',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'address',
    },
  ];

  const data = [
    // {
    //   key: '1',
    //   name: 'John Brown',
    //   age: 32,
    //   address: 'New York No. 1 Lake Park',
    //   tags: ['nice', 'developer'],
    // },
    // {
    //   key: '2',
    //   name: 'Jim Green',
    //   age: 42,
    //   address: 'London No. 1 Lake Park',
    //   tags: ['loser'],
    // },
    // {
    //   key: '3',
    //   name: 'Joe Black',
    //   age: 32,
    //   address: 'Sidney No. 1 Lake Park',
    //   tags: ['cool', 'teacher'],
    // },
  ];
  return (
    <div>
      {/* <h1>Welcome to antdtable!</h1> */}
      <div className="mt-10">
        <Table
          columns={columns}
          dataSource={props.data}
          bordered
          title={() => 'Users'}
        />
      </div>
    </div>
  );
}

export default Antdtable;
