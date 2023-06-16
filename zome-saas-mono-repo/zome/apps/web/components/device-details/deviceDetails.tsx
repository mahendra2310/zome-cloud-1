import React, { useEffect, useState } from 'react';

import { Modal } from 'antd';
import { ApiPost } from 'apps/web/services/helpers/API/ApiData';

export function DeviceDetails(props) {
  const [allDetailsData, setAllDetailsData] = useState(null);
  const [allDetailsMsg, setAllDetailsMsg] = useState(false);
  const [allDetailsDate, setAllDetailsDate] = useState(null);

  const [visible3, setVisible3] = useState(false);
  useEffect(() => {
    handleShowDetails();
  }, []);

  const showModal = () => {
    setVisible3(true);
  };
  const handleCloseModal3 = () => {
    setVisible3(false);
  };

  const handleShowDetails = async () => {
    setAllDetailsData(null);
    setAllDetailsMsg(null);
    // setDetailsButton('disable');
    // setDetailsId(id);
    // setTimeout(() => {
    //   setDetailsButton(null);
    // }, 120000);
    handleSmartSwithches(props.did);
    const data = {
      gatewayId: props.uid,
      deviceId: props.did,
    };
    showModal();
    //console.log(data);
    await ApiPost('device-details', data)
      .then((res: any) => {
        //console.log('device details--------------', res.data);
        setAllDetailsData(res.data.data.deviceDetails);
        setAllDetailsMsg(res.data.data.msg);
        //console.log(res.data.updated_at);
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
      .catch((err) => {
        console.log(err);
      });
  };

  const handleSmartSwithches = async (id) => {
    const data = {
      gatewayId: props.uid,
      deviceId: id,
    };
    showModal();
    //console.log(data)
    await ApiPost('send-matrices-switch', data)
      .then((res: any) => {
        //console.log('smart switch res', res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <>
      <Modal
        title="Device Details"
        visible={visible3}
        onCancel={() => (handleCloseModal3(), props.dataDeviceDetails(false))}
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
    </>
  );
}

export default DeviceDetails;
