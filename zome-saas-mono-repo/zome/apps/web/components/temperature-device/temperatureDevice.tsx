/* eslint-disable react/jsx-no-useless-fragment */
import React, { useEffect, useState } from 'react';

import { Tooltip, Modal, Form, Input, message } from 'antd';
import './temperatureDevice.moduel.less';
import { useAtom } from 'jotai';
import { mobilePopup } from '../../providers/UserProvider';
import { ApiPost } from 'apps/web/services/helpers/API/ApiData';

export function TemperatureDevice(props) {
  const [visible2, setVisible2] = useState(false);
  const [temperatureValue, setTemperatureValue] = useState(0);
  const [tValue, setValue] = useState(0);
  const [temperatureUnit, setTemperatureUnit] = useState('');
  const [tempratureDataChange, setTempratureDataChange] = useState(false);
  const [temperatureType, setTemperatureType] = useState(0);
  const [temperatureColor, setTemperatureColor] = useState('cold');
  const [newTempPoint, setNewTempPoint] = useState(35);
  const [dataChange, setDataChange] = useState([]);
  const [modePoint, setModePoint] = useState<any>();
  const [tempUpdateDate, setTempUpdateDate] = useState<any>();
  const [allTempData, setAllTempData] = useState(props?.tempratureAllData);
  const [row, setRow] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState(
    row['Thermostat mode']?.toString()?.toLowerCase() || 'off'
  );
  const [newMode, setNewMode] = useState(
    row['Thermostat mode']?.toString()?.toLowerCase() || 'off'
  );

  const [popup, setPopup] = useAtom(mobilePopup);

  const [newUnit, setNewUnit] = useState<any>();

  console.log('temperatureUnit', temperatureUnit);
  //console.log('object---', props.temperatureSetPoint);
  useEffect(() => {
    // handleShowModal2(
    //   props?.temperatureValue,
    //   props?.temperatureUnit,
    //   props?.temperatureType,
    //   props?.temperatureSetPoint,
    //   props?.deviceSetMode,
    //   props?.deviceNewUnit
    // );
    handleFastTemp(props.did);

    console.log('--------', allTempData);
  }, [dataChange]);

  // useEffect(()=>{
  //   if () {

  //   }
  //   handleFastTemp(props.did);
  // },[])

  const increaseTemperature = async () => {
    // console.log(
    //   'temp + before value = ',
    //   parseInt(temperatureValue.toString().replace(/\D/g, ''))
    // );
    if (newTempPoint === null || newTempPoint === undefined) {
      setNewTempPoint(35 + 1);
    } else {
      const newTemperature =
        parseInt(newTempPoint.toString().replace(/\D/g, '')) + 1;
      setNewTempPoint(newTemperature);
      if (newTemperature >= 95) {
        setNewTempPoint(95);
      } else {
        if (newTemperature >= 50) {
          setTemperatureColor('hot');
        }
      }
    }
  };

  const success = () => {
    message.success('Device temperature update successfully');
  };

  const decreaseTemperature = () => {
    // console.log(
    //   'temp - before value = ',
    //   parseInt(temperatureValue.toString().replace(/\D/g, ''))
    // );
    // console.log('temp - before value = ', temperatureValue);
    if (newTempPoint === null || newTempPoint === undefined) {
      setNewTempPoint(35 - 1);
    } else {
      const newTemperature =
        parseInt(newTempPoint.toString().replace(/\D/g, '')) - 1;
      setNewTempPoint(newTemperature);
      if (newTemperature < 35) {
        setNewTempPoint(35);
      } else {
        if (newTemperature < 50) {
          setTemperatureColor('cold');
        }
      }
    }
  };
  const handleShowModal2 = (
    temp = 50,
    unit = 1,
    type,
    setPoint = 35,
    setMode,
    setUnit,
    row
  ) => {
    // console.log('temp---------', temp);
    console.log('in temp');
    console.log('setUnit---------1 celsius', unit);
    setVisible2(true);
    setTemperatureValue(temp);
    setValue(temp);

    setTemperatureUnit(
      unit.toString().includes('Fahrenheit') || unit.toString().includes('1')
        ? '1'
        : '0'
    );
    setTemperatureType(type);
    setNewTempPoint(setPoint ? setPoint : 35);
    setModePoint(
      setMode.toString().includes('Heat') ||
        setMode.toString().includes('0') ||
        setMode.toString().includes('Heating')
        ? 0
        : 1
    );
    setNewUnit(setUnit);
    setRow(row);
    setNewMode(row['Thermostat mode']?.toString()?.toLowerCase());
    console.log('row------', row);
  };
  const handleCloseModal2 = () => {
    setVisible2(false);
    props.dataDeviceTemperature(false);
  };
  //console.log({ newTempPoint });
  const handleFastTemp = async (did) => {
    // if (type === 'Fahrenheit') {
    //   type = '1';
    // } else {
    //   type = '2';
    // }
    const data = {
      gatewayId: props.uid,
      deviceId: did,
      // typeValue: type !== 'undefined' ? type : '1',
    };
    //console.log(data);
    setLoading(true);
    await ApiPost('instant-temp', data)
      .then((res: any) => {
        console.log('All data from temp', res.data.data.data.device_info);
        if (
          res.data.data.data.device_info['Thermostat temp'] ||
          res.data.data.data.device_info['DeviceType'] == 259 ||
          res.data.data.data.device_info['DeviceType'] == '259'
        ) {
          console.log('object in if', res);
          handleShowModal2(
            res.data.data.data.device_info['Thermostat temp'] != undefined
              ? res.data.data.data.device_info['Thermostat temp']
              : 50,
            res.data.data.data.device_info['Thermostat setpoint unit1'] !=
              undefined
              ? res.data.data.data.device_info['Thermostat setpoint unit1']
              : 1,
            res.data.data.data.device_info['Thermostat mode'] != undefined
              ? res.data.data.data.device_info['Thermostat mode']
              : 'Cooling',
            res.data.data.data.device_info['Thermostat setpoint temp'] !=
              undefined
              ? res.data.data.data.device_info['Thermostat setpoint temp']
              : '',
            res.data.data.data.device_info['Thermostat mode'] != undefined
              ? res.data.data.data.device_info['Thermostat mode']
              : 'Cooling',
            res.data.data.data.device_info['Thermostat setpoint unit'] !==
              undefined
              ? res.data.data.data.device_info['Thermostat setpoint unit']
              : 'celsius',
            res.data.data.data.device_info
          );
          //setTemperatureValue(res.data.device_info['Thermostat temp']);
          let d = new Date(res.data.data.data.device_info['updatedAt']);
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
          setTempUpdateDate(updatedate);
        } else {
          setTemperatureValue(50);
        }
        setLoading(false);
        // setTemperatureValue(res.data.device_info['Thermostat temp'] != 'undefined' ? res.data.device_info['Thermostat temp'] : 50);
      })
      .catch((err) => {
        console.log('error in post temp data!!');
        setLoading(false);
      });
  };
  const handleSetTemp = async () => {
    // console.log('unit', temperatureUnit);
    // console.log('type', temperatureType);
    let newTempValue = '';
    if (temperatureUnit === '0') {
      if (newTempPoint) {
        newTempValue = Math.floor(
          ((parseInt(newTempPoint.toString().replace(/\D/g, '')) - 32) * 5) /
            9 +
            1
        ).toString();
      }
    } else {
      if (newTempPoint) {
        newTempValue = parseInt(
          newTempPoint.toString().replace(/\D/g, '')
        ).toString();
      }
    }
    const data = {
      deviceId: props.did,
      type:
        temperatureType.toString().includes('Heating') ||
        temperatureType.toString().includes('Heat') ||
        temperatureType.toString().includes('0')
          ? 0
          : temperatureType.toString().includes('Cooling') ||
            temperatureType.toString().includes('Cool') ||
            temperatureType.toString().includes('1')
          ? 1
          : temperatureType,
      unit: temperatureUnit.toString().includes('Fahrenheit')
        ? 1
        : temperatureUnit.toString().includes('Celsius')
        ? 0
        : temperatureUnit,
      value: newTempValue,
      gatewayId: props.uid,
    };
    //console.log(data);
    // console.log(data);
    await ApiPost('temperature', data)
      .then((res) => {
        //console.log(res);
        success();
        setVisible2(false);
        props.dataDeviceTemperature(false);
        props.getDevice(props.uid);
        setDataChange([...dataChange, 'add device']);
      })
      .catch((err) => {
        console.log('error in post temp data!!');
      });
  };

  const handleSetMode = async (Mode) => {
    setNewMode(Mode.toLowerCase());

    const data = {
      deviceId: props.did,
      gatewayId: props.uid,
      mode: Mode,
    };
    await ApiPost('set-mode', data)
      .then((res) => {
        //console.log(res);
        handleCloseModal2();
        props.dataDeviceTemperature(false);
        setPopup(false);
        setVisible2(false);
        // props.dataDeviceTemperature(false);
        console.log('calll--------');

        // props.getDevice(props.uid);
        // handleFastTemp(props.did);
        setDataChange([...dataChange, 'add device']);
      })
      .catch((err) => {
        console.log('error in post temp data!!');
      });
  };

  return (
    <>
      {loading && (
        <div>
          {/* <span>fetching details...</span> */}
          <div className="loader-container">
            <div className="flex flex-col justify-center w-full h-full">
              <button className="btn btn-ghost btn-lg self-center normal-case text-white">
                <div className="flex justify-between">
                  <div className="loading mt-5"></div>
                  <div className="ml-10">
                    {' '}
                    <span>fetching details...</span>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
      <Modal
        //title="temprature"
        visible={visible2}
        // onOk={handelEditDevice}
        onCancel={() => (
          handleCloseModal2(),
          props.dataDeviceTemperature(false),
          setPopup(false)
        )}
        //okText="delete"
        //cancelText="cancle"
        width={360}
        footer={null}
      >
        <div className="app-container" id="app-container">
          <div
            className="temperature-display-container"
            id="temperature-display-container"
          >
            <div className={`temperature-display ${temperatureColor}`}>
              {/* {temperatureValue ? temperatureValue : 0}
              {temperatureUnit === 0 ? <span>°C</span> : <span>°F</span>} */}
              <div className="" id="temperature-displaycold">
                <div className="mt-10 text-base" id="heating-text">
                  <p>
                    {row['Thermostat mode'] &&
                    (row['Thermostat mode'] !== 'Off' ||
                      row['Thermostat mode'] !== 'off')
                      ? modePoint == 1
                        ? 'cooling'
                        : modePoint == 0
                        ? 'heating'
                        : modePoint
                      : mode == 'cool'
                      ? 'cooling'
                      : mode == 'heat'
                      ? 'heating'
                      : mode == 'auto'
                      ? 'automatic'
                      : 'off'}
                  </p>
                </div>
                {allTempData?.device_info['Display Units'] ? (
                  <>
                    {!tempratureDataChange ? (
                      <>
                        {console.log('in upper condition celsius')}
                        {allTempData?.device_info['Display Units'] ==
                        'Celsius' ? (
                          <div>
                            {allTempData?.device_info['Display Units'] ? (
                              <>
                                {temperatureUnit === '1' ? (
                                  <>
                                    {' '}
                                    {newTempPoint ? (
                                      `${parseInt(
                                        newTempPoint
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
                                    {newTempPoint ? (
                                      `${Math.floor(
                                        ((parseInt(
                                          newTempPoint
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
                                {temperatureUnit === '1' ? (
                                  <>
                                    {' '}
                                    {newTempPoint ? (
                                      `${Math.floor(
                                        ((parseInt(
                                          newTempPoint
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
                                    {newTempPoint ? (
                                      `${parseInt(
                                        newTempPoint
                                          .toString()
                                          .replace(/\D/g, '')
                                      )}` + '°F'
                                    ) : (
                                      <>35 °F</>
                                    )}
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        ) : (
                          <div>
                            {allTempData?.device_info['Display Units'] ? (
                              <>
                                {temperatureUnit === '1' ? (
                                  <>
                                    {' '}
                                    {newTempPoint ? (
                                      `${parseInt(
                                        newTempPoint
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
                                    {newTempPoint ? (
                                      `${Math.floor(
                                        ((parseInt(
                                          newTempPoint
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
                                {temperatureUnit === '1' ? (
                                  <>
                                    {' '}
                                    {newTempPoint ? (
                                      `${Math.floor(
                                        ((parseInt(
                                          newTempPoint
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
                                    {newTempPoint ? (
                                      `${parseInt(
                                        newTempPoint
                                          .toString()
                                          .replace(/\D/g, '')
                                      )}` + '°F'
                                    ) : (
                                      <>35 °F</>
                                    )}
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        )}
                        {allTempData?.device_info['Display Units'] ==
                        'Celsius' ? (
                          <div className="mt-5 text-base">
                            <p>
                              {allTempData?.device_info['Display Units'] ? (
                                <>
                                  {temperatureUnit === '1' ? (
                                    <>
                                      {' '}
                                      {temperatureValue ? (
                                        `${parseInt(
                                          temperatureValue
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
                                      {temperatureValue ? (
                                        `${Math.floor(
                                          ((parseInt(
                                            temperatureValue
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
                                  {temperatureUnit === '1' ? (
                                    <>
                                      {' '}
                                      {temperatureValue ? (
                                        `${Math.floor(
                                          ((parseInt(
                                            temperatureValue
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
                                      {temperatureValue ? (
                                        `${parseInt(
                                          temperatureValue
                                            .toString()
                                            .replace(/\D/g, '')
                                        )}` + '°F'
                                      ) : (
                                        <>35 °F</>
                                      )}
                                    </>
                                  )}
                                </>
                              )}
                              {/* {temperatureValue
                      ? parseInt(
                          temperatureValue?.toString().replace(/\D/g, '')
                        )
                      : 0}{' '}
                    {(temperatureValue &&
                      temperatureValue.toString()?.includes('Fahrenheit')) ||
                    temperatureValue.toString()?.includes('1')
                      ? '°F'
                      : '°C'} */}
                            </p>
                          </div>
                        ) : (
                          <div className="mt-5 text-base">
                            <p>
                              {allTempData?.device_info['Display Units'] &&
                              allTempData?.device_info['Display Units'] ? (
                                <>
                                  {temperatureUnit === '1' ? (
                                    <>
                                      {' '}
                                      {temperatureValue ? (
                                        `${parseInt(
                                          temperatureValue
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
                                      {temperatureValue ? (
                                        `${Math.floor(
                                          ((parseInt(
                                            temperatureValue
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
                                  {temperatureUnit === '1' ? (
                                    <>
                                      {' '}
                                      {temperatureValue ? (
                                        `${Math.floor(
                                          ((parseInt(
                                            temperatureValue
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
                                      {temperatureValue ? (
                                        `${parseInt(
                                          temperatureValue
                                            .toString()
                                            .replace(/\D/g, '')
                                        )}` + '°F'
                                      ) : (
                                        <>35 °F</>
                                      )}
                                    </>
                                  )}
                                </>
                              )}
                              {/* {temperatureValue
                      ? parseInt(
                          temperatureValue?.toString().replace(/\D/g, '')
                        )
                      : 0}{' '}
                    {(temperatureValue &&
                      temperatureValue.toString()?.includes('Fahrenheit')) ||
                    temperatureValue.toString()?.includes('1')
                      ? '°F'
                      : '°C'} */}
                            </p>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        {allTempData?.device_info['Display Units'] ==
                        'Celsius' ? (
                          <div>
                            {allTempData?.device_info['Display Units'] &&
                            allTempData?.device_info['Display Units'] ? (
                              <>
                                {temperatureUnit === '1' ? (
                                  <>
                                    {' '}
                                    {newTempPoint ? (
                                      `${parseInt(
                                        newTempPoint
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
                                    {newTempPoint ? (
                                      `${Math.floor(
                                        ((parseInt(
                                          newTempPoint
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
                                {temperatureUnit === '1' ? (
                                  <>
                                    {' '}
                                    {newTempPoint ? (
                                      `${Math.floor(
                                        ((parseInt(
                                          newTempPoint
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
                                    {newTempPoint ? (
                                      `${parseInt(
                                        newTempPoint
                                          .toString()
                                          .replace(/\D/g, '')
                                      )}` + '°F'
                                    ) : (
                                      <>35 °F</>
                                    )}
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        ) : (
                          <div>
                            {allTempData?.device_info['Display Units'] &&
                            allTempData?.device_info['Display Units'] ? (
                              <>
                                {temperatureUnit === '1' ? (
                                  <>
                                    {' '}
                                    {newTempPoint ? (
                                      `${parseInt(
                                        newTempPoint
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
                                    {newTempPoint ? (
                                      `${Math.floor(
                                        ((parseInt(
                                          newTempPoint
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
                                {temperatureUnit === '1' ? (
                                  <>
                                    {' '}
                                    {newTempPoint ? (
                                      `${Math.floor(
                                        ((parseInt(
                                          newTempPoint
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
                                    {newTempPoint ? (
                                      `${parseInt(
                                        newTempPoint
                                          .toString()
                                          .replace(/\D/g, '')
                                      )}` + '°F'
                                    ) : (
                                      <>35 °F</>
                                    )}
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        )}
                        {allTempData?.device_info['Display Units'] ==
                        'Celsius' ? (
                          <div className="mt-5 text-base">
                            <p>
                              {allTempData?.device_info['Display Units'] &&
                              allTempData?.device_info['Display Units'] ? (
                                <>
                                  {temperatureUnit === '1' ? (
                                    <>
                                      {' '}
                                      {temperatureValue ? (
                                        `${parseInt(
                                          temperatureValue
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
                                      {temperatureValue ? (
                                        `${Math.floor(
                                          ((parseInt(
                                            temperatureValue
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
                                  {temperatureUnit === '1' ? (
                                    <>
                                      {' '}
                                      {temperatureValue ? (
                                        `${Math.floor(
                                          ((parseInt(
                                            temperatureValue
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
                                      {temperatureValue ? (
                                        `${parseInt(
                                          temperatureValue
                                            .toString()
                                            .replace(/\D/g, '')
                                        )}` + '°F'
                                      ) : (
                                        <>35 °F</>
                                      )}
                                    </>
                                  )}
                                </>
                              )}
                              {/* {temperatureValue
                      ? parseInt(
                          temperatureValue?.toString().replace(/\D/g, '')
                        )
                      : 0}{' '}
                    {(temperatureValue &&
                      temperatureValue.toString()?.includes('Fahrenheit')) ||
                    temperatureValue.toString()?.includes('1')
                      ? '°F'
                      : '°C'} */}
                            </p>
                          </div>
                        ) : (
                          <div className="mt-5 text-base">
                            <p>
                              {allTempData?.device_info['Display Units'] &&
                              allTempData?.device_info['Display Units'] ? (
                                <>
                                  {temperatureUnit === '1' ? (
                                    <>
                                      {' '}
                                      {temperatureValue ? (
                                        `${parseInt(
                                          temperatureValue
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
                                      {temperatureValue ? (
                                        `${Math.floor(
                                          ((parseInt(
                                            temperatureValue
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
                                  {temperatureUnit === '1' ? (
                                    <>
                                      {' '}
                                      {temperatureValue ? (
                                        `${Math.floor(
                                          ((parseInt(
                                            temperatureValue
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
                                      {temperatureValue ? (
                                        `${parseInt(
                                          temperatureValue
                                            .toString()
                                            .replace(/\D/g, '')
                                        )}` + '°F'
                                      ) : (
                                        <>35 °F</>
                                      )}
                                    </>
                                  )}
                                </>
                              )}
                              {/* {temperatureValue
                      ? parseInt(
                          temperatureValue?.toString().replace(/\D/g, '')
                        )
                      : 0}{' '}
                    {(temperatureValue &&
                      temperatureValue.toString()?.includes('Fahrenheit')) ||
                    temperatureValue.toString()?.includes('1')
                      ? '°F'
                      : '°C'} */}
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <div>
                      <>
                        {temperatureUnit === '1' ? (
                          <>
                            {' '}
                            {newTempPoint ? (
                              `${parseInt(
                                newTempPoint.toString().replace(/\D/g, '')
                              )}` + '°F'
                            ) : (
                              <> 35 °C </>
                            )}
                          </>
                        ) : (
                          // <>{`${temperatureValue}` + '°F'} </>
                          <>
                            {' '}
                            {newTempPoint ? (
                              `${Math.floor(
                                ((parseInt(
                                  newTempPoint.toString().replace(/\D/g, '')
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
                    </div>

                    <div className="mt-5 text-base">
                      <p>
                        <>
                          {temperatureUnit === '1' ? (
                            <>
                              {' '}
                              {temperatureValue ? (
                                `${parseInt(
                                  temperatureValue.toString().replace(/\D/g, '')
                                )}` + '°F'
                              ) : (
                                <> 35 °C </>
                              )}
                            </>
                          ) : (
                            // <>{`${temperatureValue}` + '°F'} </>
                            <>
                              {' '}
                              {temperatureValue ? (
                                `${Math.floor(
                                  ((parseInt(
                                    temperatureValue
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
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* {temperatureValue ? temperatureValue : temperatureValue } */}
            </div>
          </div>
          <div className="button-container " id="btn-plus-minus-container">
            {console.log('temperatureUnit', temperatureUnit)}
            <div></div>
            <button
              onClick={() => decreaseTemperature()}
              className="text-5xl font-weight-bold button"
            >
              -
            </button>
            <button
              onClick={() => increaseTemperature()}
              className="text-4xl font-weight-bold button"
            >
              +
            </button>
          </div>
        </div>{' '}
        {row['Thermostat mode'] &&
        row['Thermostat mode'] != 'Off' &&
        row['Thermostat mode'] != 'off' ? (
          <>
            <ul
              className="nav nav-pills mb-3 flex justify-start pr-3 pt-3 mt-4"
              id="pills-tab"
              role="tablist"
            >
              <li
                className="nav-item mr-5 "
                onClick={() => {
                  //setTemperatureColor('hot');
                }}
              >
                <h1>Unit :</h1>
              </li>
              {tempratureDataChange ? (
                (temperatureUnit && temperatureUnit === '1') ||
                temperatureUnit.toString().includes('Fahrenheit') ? (
                  <>
                    <li
                      className="nav-item mr-5"
                      onClick={() => {
                        //setTemperatureColor('hot');
                      }}
                    >
                      <button
                        className="temp-set-btn2 white-text-color block active"
                        onClick={() => setTemperatureUnit('0')}
                      >
                        °C
                      </button>
                    </li>
                    <li
                      className="nav-item"
                      onClick={() => {
                        //setTemperatureColor('cold');
                      }}
                    >
                      <button
                        className="temp-set-btn white-text-color block"
                        onClick={() => setTemperatureUnit('1')}
                      >
                        °F
                      </button>
                    </li>
                  </>
                ) : (
                  <>
                    <li
                      className="nav-item mr-5"
                      onClick={() => {
                        //setTemperatureColor('hot');
                      }}
                    >
                      <button
                        className="temp-set-btn white-text-color block active"
                        onClick={() => setTemperatureUnit('0')}
                      >
                        °C
                      </button>
                    </li>
                    <li
                      className="nav-item"
                      onClick={() => {
                        //setTemperatureColor('cold');
                      }}
                    >
                      <button
                        className="temp-set-btn2 white-text-color block"
                        onClick={() => setTemperatureUnit('1')}
                      >
                        °F
                      </button>
                    </li>{' '}
                  </>
                )
              ) : ((temperatureUnit && temperatureUnit === '1') ||
                  temperatureUnit.toString().includes('Fahrenheit')) &&
                allTempData?.device_info['Display Units'] !== 'Celsius' ? (
                <>
                  <li
                    className="nav-item mr-5"
                    onClick={() => {
                      //setTemperatureColor('hot');
                    }}
                  >
                    <button
                      className="temp-set-btn2 white-text-color block active"
                      onClick={() => {
                        setTemperatureUnit('0');
                        setTempratureDataChange(true);
                      }}
                    >
                      °C
                    </button>
                  </li>
                  <li
                    className="nav-item"
                    onClick={() => {
                      //setTemperatureColor('cold');
                    }}
                  >
                    <button
                      className="temp-set-btn white-text-color block"
                      onClick={() => {
                        setTemperatureUnit('1');
                        setTempratureDataChange(true);
                      }}
                    >
                      °F
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li
                    className="nav-item mr-5"
                    onClick={() => {
                      //setTemperatureColor('hot');
                    }}
                  >
                    <button
                      className="temp-set-btn white-text-color block active"
                      onClick={() => {
                        setTemperatureUnit('0');
                        setTempratureDataChange(true);
                      }}
                    >
                      °C
                    </button>
                  </li>
                  <li
                    className="nav-item"
                    onClick={() => {
                      //setTemperatureColor('cold');
                    }}
                  >
                    <button
                      className="temp-set-btn2 white-text-color block"
                      onClick={() => {
                        setTemperatureUnit('1');
                        setTempratureDataChange(true);
                      }}
                    >
                      °F
                    </button>
                  </li>{' '}
                </>
              )}
            </ul>
            <ul
              className="nav nav-pills mb-3 flex justify-start pr-3 pt-3 mt-4"
              id="pills-tab"
              role="tablist"
            >
              <li
                className="nav-item mr-5 "
                onClick={() => {
                  //setTemperatureColor('hot');
                }}
              >
                <h1>Type :</h1>
              </li>
              {(temperatureType && temperatureType === 1) ||
              temperatureType.toString().includes('Cooling') ||
              temperatureType.toString().includes('Cool') ? (
                <>
                  <li
                    className="nav-item mr-5"
                    onClick={() => {
                      setTemperatureColor('hot');
                    }}
                  >
                    <button
                      className="temp-set-btn2 white-text-color block active"
                      onClick={() => setTemperatureType(0)}
                    >
                      Heat
                    </button>
                  </li>
                  <li
                    className="nav-item"
                    onClick={() => {
                      setTemperatureColor('cold');
                    }}
                  >
                    <button
                      className="temp-set-btn white-text-color block"
                      onClick={() => setTemperatureType(1)}
                    >
                      Cool
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li
                    className="nav-item mr-5"
                    onClick={() => {
                      setTemperatureColor('hot');
                    }}
                  >
                    <button
                      className="temp-set-btn white-text-color block active"
                      onClick={() => setTemperatureType(0)}
                    >
                      Heat
                    </button>
                  </li>
                  <li
                    className="nav-item"
                    onClick={() => {
                      setTemperatureColor('cold');
                    }}
                  >
                    <button
                      className="temp-set-btn2 white-text-color block"
                      onClick={() => setTemperatureType(1)}
                    >
                      Cool
                    </button>
                  </li>{' '}
                </>
              )}
            </ul>
            <>
              <div className="mt-10" id="mode-checkbox">
                <div className="md:w-4/6">
                  <div className="flex items-center mt-2">
                    <li className="nav-item mr-5 ">
                      <h1>Mode:</h1>
                    </li>
                    <div className="mr-3">
                      <input
                        type="radio"
                        name="time"
                        value="OFF"
                        checked={newMode == 'off'}
                        onChange={(e) => handleSetMode(e.target.value)}
                      />{' '}
                      <label htmlFor="time1">Off</label>
                    </div>
                    <div className="mr-3">
                      <input
                        type="radio"
                        name="time"
                        value="AUTO"
                        checked={newMode == 'auto'}
                        onChange={(e) => handleSetMode(e.target.value)}
                      />{' '}
                      <label htmlFor="time2">Auto</label>
                    </div>
                    <div className="mr-3">
                      <input
                        type="radio"
                        name="time"
                        value="HEAT"
                        checked={newMode == 'heat'}
                        onChange={(e) => handleSetMode(e.target.value)}
                      />{' '}
                      <label htmlFor="time2">Heat</label>
                    </div>
                    <div className="mr-3">
                      <input
                        type="radio"
                        name="time"
                        value="COOL"
                        checked={newMode == 'cool'}
                        onChange={(e) => handleSetMode(e.target.value)}
                      />{' '}
                      <label htmlFor="time3">Cool</label>
                    </div>
                  </div>
                </div>
                {/* <div className="flex justify-center">
                {newTempPoint && newTempPoint !== tValue ? (
                  <button
                    onClick={() => handleSetMode()}
                    className="temp-set-btn text-white  block cursor-pointer text-center mb-10 mt-10"
                  >
                    Set Mode
                  </button>
                ) : null}
              </div> */}
              </div>
            </>
            <div className="flex justify-center" id="Set-temperatureContainer">
              {newTempPoint && newTempPoint !== tValue ? (
                <button
                  onClick={() => handleSetTemp()}
                  className="temp-set-btn text-white  block cursor-pointer text-center mb-10 mt-10"
                >
                  Set temperature
                </button>
              ) : null}
            </div>
            <div className="flex justify-end text-xs mt-5">
              <span className="font-bold"> Last updated at: </span>{' '}
              <p>{tempUpdateDate && tempUpdateDate}</p>
            </div>
          </>
        ) : (
          <>
            <div className="mt-10">
              <div className="md:w-4/6">
                <div className="flex items-center mt-2">
                  <li className="nav-item mr-5 ">
                    <h1>Mode:</h1>
                  </li>
                  <div className="mr-3">
                    <input
                      type="radio"
                      name="time"
                      value="OFF"
                      defaultChecked
                      onChange={(e) => handleSetMode(e.target.value)}
                    />{' '}
                    <label htmlFor="time1">Off</label>
                  </div>
                  <div className="mr-3">
                    <input
                      type="radio"
                      name="time"
                      value="AUTO"
                      onChange={(e) => handleSetMode(e.target.value)}
                    />{' '}
                    <label htmlFor="time2">Auto</label>
                  </div>
                  <div className="mr-3">
                    <input
                      type="radio"
                      name="time"
                      value="HEAT"
                      onChange={(e) => handleSetMode(e.target.value)}
                    />{' '}
                    <label htmlFor="time2">Heat</label>
                  </div>
                  <div className="mr-3">
                    <input
                      type="radio"
                      name="time"
                      value="COOL"
                      onChange={(e) => handleSetMode(e.target.value)}
                    />{' '}
                    <label htmlFor="time3">Cool</label>
                  </div>
                </div>
              </div>
              {/* <div className="flex justify-center">
                {newTempPoint && newTempPoint !== tValue ? (
                  <button
                    onClick={() => handleSetMode()}
                    className="temp-set-btn text-white  block cursor-pointer text-center mb-10 mt-10"
                  >
                    Set Mode
                  </button>
                ) : null}
              </div> */}
              <div
                className="flex justify-end text-xs mt-5"
                id="last-updatedAt"
              >
                <span className="font-bold"> Last updated at: </span>{' '}
                <p>{tempUpdateDate && tempUpdateDate}</p>
              </div>
            </div>
          </>
        )}
      </Modal>
    </>
  );
}

export default TemperatureDevice;
