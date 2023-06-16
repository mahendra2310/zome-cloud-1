import React, { useEffect, useState } from 'react';

import { Modal } from 'antd';
import Link from 'next/link';
import { Radio } from 'antd';
import { ApiGet, ApiPost, ApiPut } from 'apps/web/services/helpers/API/ApiData';
import './addproperty.module.less';
import { CheckCircleOutlined } from '@ant-design/icons';

export function EditProperty(props) {
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(true);
  const [propertyName, setPropertyName] = useState(props?.data?.name);
  const [meterId, setMeterId] = useState(props?.data?.meter_id);
  const [latitude, setLatitude] = useState(props?.data?.latitude);
  const [longitude, setLongitude] = useState(props?.data?.longitude);
  const [address, setAddress] = useState(props?.data?.address);
  const [pincode, setPincode] = useState(props?.data?.pincode);
  const [city, setCity] = useState(props?.data?.city);
  const [state, setState] = useState(props?.data?.state);
  const [country, setCountry] = useState(props?.data?.country);
  const [profileError, setprofileError] = useState('');

  

  const handleEditProperty = async (e) => {
    //  console.log("propertyName, meterId, latitude, longitude, address, pincode, city, state, country, profileError,::",propertyName, meterId, latitude, longitude, address, pincode, city, state, country, profileError)
    e.preventDefault();
    setprofileError('');
    if (!propertyName) {
      setprofileError('Property Name can not be blank!');
      return false;
    }
    if (!meterId) {
      setprofileError('Meter No can not be blank!');
      return false;
    }
    if (!latitude) {
      setprofileError('Latitude can not be blank!');
      return false;
    }
    if (!longitude) {
      setprofileError('Longitude can not be blank!');
      return false;
    }
    if (!address) {
      setprofileError('Address can not be blank!');
      return false;
    }

    if (!city) {
      setprofileError('City can not be blank!');
      return false;
    }
    if (!state) {
      setprofileError('State can not be blank!');
      return false;
    }
    if (!country) {
      setprofileError('Country can not be blank!');
      return false;
    }
    if (!pincode) {
      setprofileError('Pincode can not be blank!');
      return false;
    }
    let postData = {
      name: propertyName,
      meter_id: meterId,
      latitude: latitude,
      longitude: longitude,
      address: address,
      city: city,
      state: state,
      country: country,
      pincode: pincode,
    };
    // console.log("postData::::",postData)
    setLoading(true);
    setprofileError('');
      await ApiPut(`property/${props.data._id}`,postData)
      .then((res: any) => {
        // console.log('res:::', res.data);
        if (res.data.status) {
          props.visibleEdit(false);
          let resultData:any = {...postData};
          resultData._id = props.data._id;
          props.editPropertySuccess(resultData)
          // props.data(postData)
        }else{
          setprofileError(res.data.message);
        }
      })
      .catch((err) => {
        console.log('error in get data!!:',err);
      });
  };
  return (
    <>
      <Modal
        title={
          <>
            <div className="flex justify-start">Edit Property</div>
          </>
        }
        centered
        visible={visible}
        footer={null}
        // onOk={() => setVisible(false)}
        onCancel={
          () => props.visibleEdit(false)
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
                    <form
                      className="form"
                      onSubmit={(e) => handleEditProperty(e)}
                    >
                      <input
                        type="text"
                        className="form-control block mb-5"
                        placeholder="Property Name"
                        value={propertyName}
                        onChange={(e) => setPropertyName(e.target.value)}
                        required
                      />
                      <input
                        type="text"
                        className="form-control block mb-5"
                        placeholder="Meter No"
                        value={meterId}
                        onChange={(e) => setMeterId(e.target.value)}
                        required
                      />
                      <input
                        type="text"
                        className="form-control block mb-5"
                        placeholder="Latitude"
                        value={latitude}
                        onChange={(e) => setLatitude(e.target.value)}
                        required
                      />
                      <input
                        type="text"
                        className="form-control block mb-5"
                        placeholder="Longitude"
                        value={longitude}
                        onChange={(e) => setLongitude(e.target.value)}
                        required
                      />

                      <input
                        type="text"
                        className="form-control block mb-5"
                        placeholder="Address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                      />
                      <input
                        type="text"
                        className="form-control block mb-5"
                        placeholder="City"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                      />
                      <input
                        type="text"
                        className="form-control block mb-5"
                        placeholder="State"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        required
                      />
                      <input
                        type="text"
                        className="form-control block mb-5"
                        placeholder="Country"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        required
                      />
                      <input
                        type="text"
                        className="form-control block mb-5"
                        placeholder="Pincode"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        required
                      />

                      <div className="new-account-text-rigth">
                        {/* <Link href="/">Have an account? Sign in now</Link> */}
                      </div>
                      <div className="pt-5 m-pb-1">
                        <div className="same-button-style flex justify-center">
                          <h6 className="text-red-600">
                            {profileError && profileError}
                          </h6>
                          {/* <Link href="/"> */}
                          <button
                            className="login-btn-style white-text-color block cursor-pointer text-center"
                            type="submit"
                            onClick={(e) => handleEditProperty(e)}
                          >
                            <span className="mr-3">Edit Property</span>
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

export default EditProperty;
