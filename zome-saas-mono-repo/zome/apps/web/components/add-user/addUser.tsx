import React, { useEffect, useState } from 'react';

import { message, Modal } from 'antd';
import Link from 'next/link';
import { Radio } from 'antd';
import { ApiGet, ApiPost } from 'apps/web/services/helpers/API/ApiData';
import './adduser.module.less';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { getUserInfo } from 'apps/web/services/utils/user.util';
export function AddUser(props) {
  const [visible, setVisible] = useState(true);
  const [formType, setFormType] = useState('Property Manager');
  const [buildingId, setBuildingId] = useState('');
  const [fullName, setFullName] = useState('');
  const [roleId, setRoleId] = useState('property-manager');
  const [PropertyId, setPropertyId] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [deviceId, setDeviceID] = useState('');
  const [allPropertyId, setAllPropertyId] = useState([]);
  const [allBuildingId, setAllBuildingId] = useState([]);
  const [isAvailable, setIsAvailable] = useState<any>();
  let userRole = getUserInfo()?.role;

  const handleAddUser = async (e) => {
    e.preventDefault();
    console.info('object');
    let data = {};
    if (formType == 'Property Manager') {
      console.log(formType);
      data = {
        full_name: fullName,
        role: roleId,
        email: userEmail,
        username: userName,
        password: userPassword,
        building_id: buildingId,
        property_id: PropertyId,
        device_id: null,
      };
      console.log({ data });
    } else if (formType == 'Property Owner') {
      data = {
        full_name: fullName,
        role: roleId,
        email: userEmail,
        username: userName,
        password: userPassword,
        property_id: PropertyId,
        // buildingId: null,
        device_id: null,
      };
      console.log({ data });
    } else if (formType == 'Tenant User') {
      data = {
        fullName: fullName,
        role: roleId,
        email: userEmail,
        deviceId: null,
      };
      console.log({ data });
    }
  
    await ApiPost('single-user', data)
      .then(async (res: any) => {
        console.log('res---', res);
        if (res.data.msg) {
          message.error(res.data.msg);
        }else if (res.data.msg == "Please enter valid email address") {
          message.error(res.data.msg);
        }else if (res.data.msg == "Email already exists") {
          message.error(res.data.msg);
        }else if (res.data.msg == "Username already exists") {
          message.error(res.data.msg);
        }else if (res.data.msg == "Please select a property") {
          message.error(res.data.msg);
        }
        else {
          message.success('User created');
          props.visible(false);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const handleInitialFormType = async () =>{
    if(userRole == "property-manager"){
      setFormType("Tenant User")
    }
  }

  const getPropertyId = async () => {
    await ApiGet(`property`)
      .then((res: any) => {
        console.log(res);
        if (res.data.data) {
          setAllPropertyId(res.data.data);
        }
      })
      .catch((err) => {
        console.log('error in get data!!');
      });
  };
  const handlegetBuildingId = async (id) => {
    await ApiGet(`building?propertyId=${id}`)
      .then((res: any) => {
        if (res.data.data) {
          setAllBuildingId(res.data.data);
        }
      })
      .catch((err) => {
        console.log('error in get data!!');
      });
  };
  useEffect(() => {
    getPropertyId();
    handleInitialFormType();
  }, []);

  const handleCheckDeviceId = async (e) => {
    e.preventDefault();
    await ApiGet(`check?deviceId=${deviceId}`)
      .then((res: any) => {
        console.log(res);
        if (res.data.data.isAvailable) {
          handleAddUser(e);
        } else {
          setIsAvailable(false);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  console.log(isAvailable);

  const handleRole = () => {
    if (userRole == 'TENANT') {
      return false;
    } else if (userRole === 'tenant') {
      return false;
    } else if(userRole === 'property-owner' || userRole === 'property_owner'){
      return false;
    }
    else if(userRole === 'property-manager' || userRole === 'property_manager'){
      return false;
    }
    else {
      return true;
    }
  };

  
  const handleRolePropertyManager = () => {
    if (userRole == 'TENANT') {
      return false;
    } else if (userRole === 'tenant') {
      return false;
    } 
    else if(userRole === 'property-manager' || userRole === 'property_manager'){
      return false;
    }
    else {
      return true;
    }
  };

  return (
    <>
      <Modal
        title={
          <>
            <div className="flex justify-start">Add Users</div>
          </>
        }
        centered
        visible={visible}
        footer={null}
        // onOk={() => setVisible(false)}
        onCancel={
          () => props.visible(false)
          //  setShowExludeData(false),
          //  setShowTemprature(false),
          //  setTemp(0),
          //  setSelectedRowKeys1(null)
        }
        width={'100%'}
        className="fullScreenModal"
      >
        <div className="">
          <section className="login-banner bg-white">
            <div className="">
              <div className="lg:flex md:flex  align-content">
                {/* <div className="lg:w-4/6 md:w-1/2 m-pl-2 flex justify-center items-center banner-full-height ">
                  <div className="login-banner-img ">
                    <LoginImage className="login-banner-img" />
                  </div>
                </div> */}
                <div className="lg:w-2/6 md:w-1/2 pl-8 pr-8 m-pl-2 m-login-banner">
                  <div className="left">
                    <div className="header welcome-text-align">
                      {/* <h2 className="opensans-bold heading-title-text-color heading-title-size">
                        Add New User
                      </h2> */}
                      <Radio.Group
                        defaultValue="Property Manager"
                        buttonStyle="solid"
                      >
                        {handleRolePropertyManager() &&
                        <Radio.Button
                          value="Property Manager"
                          onChange={(e) => {
                            setFormType(e.target.value);
                            setRoleId('property-manager');
                          }}
                        >
                          Property Manager
                        </Radio.Button>
                        }
                        {handleRole() &&
                        <Radio.Button
                          value="Property Owner"
                          onChange={(e) => {
                            setFormType(e.target.value),
                              setRoleId('property-owner');
                          }}
                        >
                          Property Owner
                        </Radio.Button>
                           }
                        <Radio.Button
                          value="Tenant User"
                          onChange={(e) => {
                            setFormType(e.target.value);
                            setRoleId('tenant');
                          }}
                        >
                          Tenant User
                        </Radio.Button>
                      </Radio.Group>
                      <h6 className="child-text-color font-size-16 tracking-normal mt-3 mb-4">
                        {formType && formType}
                      </h6>
                      {/* //  <h5 className="text-red-600">{signupError}</h5> */}
                    </div>

                    <form
                      className="form"
                      onSubmit={(e) => handleAddUser(e)}
                      noValidate
                    >
                      <input
                        type="text"
                        className="form-control block mb-5"
                        placeholder="Full Name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                      <input
                        type="text"
                        className="form-control block mb-5"
                        placeholder="Role"
                        value={formType}
                        onChange={(e) => setRoleId(e.target.value)}
                        required
                        readOnly
                      />
                      {formType !== 'Tenant User' && (
                        <>
                          <input
                            type="email"
                            className="form-control block mb-5"
                            placeholder="Email"
                            value={userEmail}
                            onChange={(e) => setUserEmail(e.target.value)}
                            required
                          />
                          <input
                            type="text"
                            className="form-control block mb-5"
                            placeholder="UserName"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            required
                          />
                          <input
                            type="password"
                            className="form-control block mb-5"
                            placeholder="Password"
                            value={userPassword}
                            onChange={(e) => setUserPassword(e.target.value)}
                            required
                          />
                          {/* <input
                            type="text"
                            className="form-control block mb-5"
                            placeholder="PropertyId"
                            // value={userPassword}
                            // defaultValue={signupBasicInfo?.userPassword}
                            // onChange={(e) => handlePassword(e)}
                          /> */}
                          {formType == 'Property Owner' ? (
                            <>
                              <select
                                className="form-control block mb-5"
                                onChange={(e) => {
                                  setPropertyId(e.target.value);
                                  handlegetBuildingId(e.target.value);
                                }}
                                required
                              >
                                <option value="">select property id</option>

                                {allPropertyId?.map((i) => {
                                  return (
                                    <option value={i._id}>{i.name}</option>
                                  );
                                })}
                              </select>
                            </>
                          ) : (
                            <>
                              <select
                                className="form-control block mb-5"
                                onChange={(e) => {
                                  setPropertyId(e.target.value);
                                  handlegetBuildingId(e.target.value);
                                }}
                                required
                              >
                                <option value="">select property id</option>

                                {allPropertyId?.map((i) => {
                                  return (
                                    <option value={i._id}>{i.name}</option>
                                  );
                                })}
                              </select>
                            </>
                          )}
                        </>
                      )}
                      {formType == 'Property Manager' && (
                        <>
                          {/* <input
                         type="text"
                         className="form-control block mb-5"
                         placeholder="Buildings"
                         // value={userPassword}
                         // defaultValue={signupBasicInfo?.userPassword}
                         // onChange={(e) => handlePassword(e)}
                       /> */}
                          <select 
                            className="form-control block mb-5"
                            onChange={(e) => setBuildingId(e.target.value)}
                          >
                            <option value={""} >select building name id</option>
                            {allBuildingId?.map((i) => {
                              return <option value={i._id}>{i.name}</option>;
                            })}
                          </select>
                        </>
                      )}

                      {/* <div className="device-true-icon-align">
                        <input
                          type="text"
                          className="form-control block mb-5"
                          placeholder="DeviceId"
                          // value={userPassword}
                          // defaultValue={signupBasicInfo?.userPassword}
                          onChange={(e) => setDeviceID(e.target.value)}
                          required
                        />
                        <select
                            className="form-control block mb-5"
                            onChange={(e) => setDeviceID(e.target.value)}
                            required
                          >
                            <option value="">select device id</option>
                            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
                              return (
                                <option value={i}>device id :{i}</option>
                              );
                            })}
                          </select>

                        <div className="icon-center-input">
                          {isAvailable && isAvailable === undefined ? (
                            ''
                          ) : isAvailable === true ? (
                            <div className="icon-center-input">
                              <CheckCircleOutlined className="check-icon-color" />
                            </div>
                          ) : isAvailable === false ? (
                            <div className="icon-center-input-close">
                              <CloseCircleOutlined className="check-icon-color" />
                            </div>
                          ) : (
                            ''
                          )}
                        </div>
                      </div> */}

                      <div className="new-account-text-rigth">
                        {/* <Link href="/">Have an account? Sign in now</Link> */}
                      </div>
                      <div className="pt-5 m-pb-1">
                        <div className="same-button-style flex justify-center">
                          {/* <Link href="/"> */}
                          <button
                            className="login-btn-style white-text-color block cursor-pointer text-center"
                            type="submit"
                            //onClick={(e) => handleAddUser(e)}
                          >
                            <span className="mr-3">Add User</span>
                          </button>
                          {/* </Link> */}
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </Modal>
    </>
  );
}

export default AddUser;