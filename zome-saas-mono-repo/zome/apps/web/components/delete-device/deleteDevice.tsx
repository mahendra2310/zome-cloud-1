import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Dialogbox } from '@zome/ui';
import { ApiDelete } from 'apps/web/services/helpers/API/ApiData';
import { Modal } from 'antd';
import { WarningOutlined } from '@ant-design/icons';

export function DeleteDevice(props) {
  const router = useRouter();
  const [deviceIdForRemove, setDeviceIdForRemove] = useState('');
  const [visible1, setVisible1] = useState(true);

  const handleCloseModal1 = () => {
    setVisible1(false);
    props.dataDeleteDevice(false);
  };
  //   const handleShowModal1 = (id) => {
  //     setVisible1(true);
  //     setDeviceIdForRemove(id);
  //   };
  const handelRemoveDevice = async () => {
    console.log('delete');
    const data = {
      deviceId: props.did,
      gatewayId: props.uid,
    };
    //console.log(data);
   
    await ApiDelete('device', data)
      .then((res) => {
        //console.log(res);
        props.setdatachange([...props.datachange, 'remove device']);
        props.dataDeleteDevice(false);
        setVisible1(false);
      })
      .catch((err) => {
        console.log(err);
      });
     
  };

  return (
    <>
      <Modal
        title={
          <h1 className="text-red-600 flex justify-content-between items-center">
            <div className="mr-3">
              <WarningOutlined />
            </div>
            <div className="mt-1">Remove!</div>
          </h1>
        }
        visible={visible1}
        // onOk={handelEditDevice}
        onCancel={() => (handleCloseModal1(), props.dataDeleteDevice(false))}
        okText="delete"
        cancelText="cancle"
        footer={null}
      >
        <p className="text-lg ">Are you sure you want to remove this device?</p>
        <div className="flex flex-row-reverse">
          <button
            className="remove-btn-style white-text-color cursor-pointer "
            onClick={() => handelRemoveDevice()}
          >
            Remove
          </button>
        </div>
      </Modal>
    </>
  );
}

export default DeleteDevice;
