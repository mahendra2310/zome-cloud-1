import React, { useEffect, useState } from 'react';

import { Modal } from 'antd';
import { ApiGet, ApiPost } from 'apps/web/services/helpers/API/ApiData';

export function SwitchDevice(props) {
  const [visible4, setVisible4] = useState(false);
  const [toggle, setToggle] = useState('');
  console.log(props);
  useEffect(() => {
    handleSwitchActivity();
    showModal4();
    // if (props.dataDeviceAction === '0' || props.dataDeviceAction === 0) {
    //   setToggle('toggle1');
    // } else if (props.dataDeviceAction === '1' || props.dataDeviceAction === 1) {
    //   setToggle('toggle2');
    // } else {
    //   setToggle('toggle1');
    // }
    toggle ? console.log(toggle) : console.log('object');
  }, []);

  const handleSwitchActivity = async () => {
    await ApiGet(`/smartswitch/${props.uid}/${props.did}`)
      .then((res: any) => {
        console.log(res.data.data.device['Power State']);
        if (res.data.data.device['Power State'].includes('Off')) {
          setToggle('toggle1');
        } else if (res.data.data.device['Power State'].includes('On')) {
          setToggle('toggle2');
        }
        // setToggle(() =>
        //   res.data.device['Power State'].includes('off', 'Off')
        //     ? 'toggle1'
        //     : res.data.device['Power State'].includes('on', 'On') && 'toggle2'
        // );
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const showModal4 = () => {
    setVisible4(true);
  };
  const handleCloseModal4 = () => {
    setVisible4(false);
  };

  const handleSmartSwitch = async (action) => {
    const data = {
      gatewayId: props.uid,
      deviceId: props.did,
      switchStatus: action,
    };
    console.log('data', data);
    console.log(data);
    await ApiPost('switch-activity', data)
      .then((res) => {
        //console.log(res);
        //setVisible4(false);
        // setToggle('')
        setTimeout(async () => {
          handleSwitchActivity();
        }, 10000);

      })
      .catch((err) => {
        console.log(err);
      });
  };
  return (
    <>
      {toggle && (
        <Modal
          title="Smart Switch ON/OFF"
          visible={visible4}
          onCancel={() => (handleCloseModal4(), props.dataDeviceDetails(false))}
          footer={null}
          width={300}
        >
          {toggle === 'toggle1' ? (
            <>
              <div className="flex justify-around items-center">
                <div>
                  <input
                    type="checkbox"
                    id="toggle1"
                    className="input1"
                    onClick={() => setToggle('toggle2')}
                  />
                  <label
                    htmlFor="toggle1"
                    className="toggleWrapper1"
                    onClick={() => handleSmartSwitch('1')}
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
                  <input
                    type="checkbox"
                    id="toggle2"
                    className="input1"
                    onClick={() => setToggle('toggle1')}
                  />
                  <label
                    htmlFor="toggle2"
                    className="toggleWrapper2"
                    onClick={() => handleSmartSwitch('0')}
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
    </>
  );
}

export default SwitchDevice;
