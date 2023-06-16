/* eslint-disable no-sequences */
import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select  } from 'antd';
import CountDown from 'ant-design-pro/lib/CountDown';
import { ApiPost } from 'apps/web/services/helpers/API/ApiData';
import './add-device.module.less';
const { Option } = Select;
export function AddDevice(props) {
  const [dskName, setDskName] = useState('');
  const [dskDesc, setDskDesc] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [dskValidate, setDskvalidate] = useState(null);
  const [visible5, setVisible5] = useState(false);
  const [visible, setVisible] = useState(true);
  const [selectDeviceName, setSelectDeviceName] = useState('');
  const [loader, setLoader] = useState(false);
  const targetTime = new Date().getTime() + 120000;
  let [enabled,setEnabled] = useState(false);
  const [activeButton , setActiveButton] = useState("gateway-btn-style white-text-color block cursor-pointer text-center content-end");


  const showModal5 = () => {
    setVisible5(true);
    window.onbeforeunload = function () {
      return 'Data will be lost if you leave the page, are you sure?';
    };
  };

  const layout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 12 },
  };
  var dateUpdate = '';
  const validateMessages = {
    required: '${label} between 0 or 99999 digit!',
    types: {
      email: '${label} is not a valid email!',
      number: '${label} is not a valid number!',
    },
    number: {
      range: '${label} must be between ${min} and ${max}',
    },
  };
  const handleChangeSubmit1 = async () => {
    //console.log('start');
    if (dskName !== '' ? /^[0-9]{5}$/.test(dskName) : true) {
      setLoader(true);
      setDskvalidate('');
      const data = {
        dskId: dskName,
        description: dskDesc,
        gatewayId: props.uid,
      };
      //console.log('data----', data);
      await ApiPost('device', data)
        .then((res) => {
          setLoader(false);
          setDskName('');
          setDskDesc('');
          showModal5();
        })
        .catch((err) => {
          setLoader(false);
          console.log('error in post data!!');
        });
    } else {
      setDskvalidate('Please enter valid DSK id ');
    }
  };

  useEffect(() => {
    if(dskDesc != "" &&  selectDeviceName == "Smartswitch" || dskDesc != "" &&  selectDeviceName == "Thermostatdevice" || dskDesc != "" &&  selectDeviceName == "Extender"){
      setActiveButton("device-btn-style white-text-color block cursor-pointer text-center content-end")
      setEnabled(true);

    }else {
      setEnabled(false);
      setActiveButton("device-disable-btn-style white-text-color block cursor-pointer text-center content-end")
    }
  }, [selectDeviceName,dskDesc])
  
  return (
    <>
      {loader ? (
        <div>
          {/* <span>fetching details...</span> */}
          <div className="loader-container">
            <div className="flex flex-col justify-center w-full h-full">
              <button className="btn btn-ghost btn-lg self-center normal-case text-white">
                <div className="flex justify-between">
                  <div className="loading mt-5"></div>
                  <div className="ml-10">
                    {' '}
                    <span>Adding devices...</span>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <Modal
            title="Add New Device"
            centered
            visible={visible}
            onCancel={() => (setVisible(false), props.dataAddDevice(false))}
            width={400}
            footer={null}
          >
            <Form
              {...layout}
              name="nest-messages"
              validateMessages={validateMessages}
              initialValues={{
                ['dname']: deviceName,
              }}
            >
              <div className="">
                <Form.Item name={['device', 'name']} label="Select Device:">
                  <Select
                    placeholder="Select a option and change input text above"
                    onChange={(e: any) => {
                      {
                        e === 'Smartswitch' ? setDskName('') : null;
                      }
                      setSelectDeviceName(e);
                    }}
                    allowClear
                  >
                    <Option value="Thermostatdevice">Thermostatdevice</Option>
                    <Option value="Smartswitch" onClick={() => setDskName('')}>
                      Smartswitch
                    </Option>
                    <Option value="Extender">Extender</Option>
                  </Select>
                  <p className="text-red-500">*required</p>
                </Form.Item>
                {selectDeviceName === 'Thermostatdevice' ||
                selectDeviceName === 'Extender' ? (
                  <>
                    <Form.Item name={['dsk', 'name']} label="Dsk:">
                      <Input
                        value={dskName}
                        onChange={(e: any) => setDskName(e.target.value)}
                      />

                      {(dskValidate && dskValidate !== '') ||
                      dskValidate !== null ? (
                        <p className="text-red-500">{dskValidate}</p>
                      ) : (
                        <p className="text-green-500">*optional</p>
                      )}
                    </Form.Item>
                  </>
                ) : null}
                <Form.Item name={['dsk', 'desc']} label="Description:" >
                  <Input.TextArea
                    value={dskDesc}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onChange={(e: any) => setDskDesc(e.target.value)}
                  />
                <p className="text-red-500">*required</p>
                </Form.Item>
              </div>
              <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 8 }}>
                <button
                  className= {activeButton}
                  type="submit"
                  onClick={() => handleChangeSubmit1()}
                  disabled={!enabled}
                  >
                  Add Device
                </button>
              </Form.Item>
            </Form>
          </Modal>
          <div>
            <Modal
              title="Device is being added..."
              visible={visible5}
              footer={null}
              width={300}
            >
              <h1>You can not close this window until time is up</h1>
              <CountDown
                style={{ fontSize: 20 }}
                target={targetTime}
                onEnd={() => {
                  setVisible5(false),
                    setVisible(false),
                    props.dataAddDevice(false);
                }}
              />
            </Modal>
          </div>
        </>
      )}
    </>
  );
}

export default AddDevice;
