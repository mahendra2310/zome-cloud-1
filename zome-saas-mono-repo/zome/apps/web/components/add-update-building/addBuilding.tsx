import React, { useEffect, useState } from 'react';

import { message, Modal } from 'antd';
import Link from 'next/link';
import { Radio } from 'antd';
import { ApiGet, ApiPost } from 'apps/web/services/helpers/API/ApiData';
import './add-update-building.module.less';
import { CheckCircleOutlined } from '@ant-design/icons';
import Select, { components, ControlProps } from 'react-select';

export function AddBuilding(props) {
  let [allBuilding, setBuildingData] = useState<any>();
  // let allBuilding:any = [];
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(true);
  const [name, setName] = useState('');
  const [BuildingId, setBuildingId] = useState('');
  const [block, setBlock] = useState('');
  const [address, setAddress] = useState('');
  const [profileError, setprofileError] = useState('');

  const getBuildingList = async () => {
    await ApiGet('property')
      .then((res: any) => {
        setBuildingData(res.data.data);
        if (res.data.data.length) {
          setBuildingId(res.data.data[0]._id);
        }
      })
      .catch((err) => {
        console.log('error in get data!!');
      });
  };

  useEffect(() => {
    // allBuilding = [];
    const getBuildingDetails = async (id) => {
      await ApiGet(`building/${id}`)
        .then((res: any) => {
          if (res.data.status) {
            setName(res.data.data.name);
            setBuildingId(res.data.data.meter_id);
            setBlock(res.data.data.latitude);
            setAddress(res.data.data.address);
          }
        })
        .catch((err) => {
          console.log('error in get data!!');
        });
    };
    //console.log(modal);
    // need to get dynamic id which will be pass throgh argument
    if (props.id) {
      getBuildingDetails(props.id);
    }
    getBuildingList();
  }, []);

  const handleaddBuilding = async (e) => {
    //  console.log("BuildingName, meterId, latitude, longitude, address, pincode, city, state, country, profileError,::",BuildingName, meterId, latitude, longitude, address, pincode, city, state, country, profileError)
    e.preventDefault();
    setprofileError('');
    if (!name) {
      setprofileError('Name can not be blank!');
      return false;
    }
    if (!BuildingId) {
      setprofileError('Building id can not be blank!');
      return false;
    }
    if (!block) {
      setprofileError('Block can not be blank!');
      return false;
    }
    if (!address) {
      setprofileError('Address No can not be blank!');
      return false;
    }

    let postData = {
      name: name,
      propertyId: BuildingId,
      block: block,
      address: address,
    };
    // console.log("postData::::",postData)
    setLoading(true);
    await ApiPost('building', postData)
      .then(async (res: any) => {
        if (res.data.status) {
          setprofileError('');
          props.visible(false);
          props.addBuildingSuccess();
          message.success("New Building created successfully");
        } else {
          setprofileError(res.data.message);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
  return (
    <>
      <Modal
        title={
          <>
            <div className="flex justify-start">Add Building</div>
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
                    <form
                      className="form"
                      onSubmit={(e) => handleaddBuilding(e)}
                    >
                      <input
                        type="text"
                        className="form-control block mb-5"
                        placeholder="Building Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />

                      <select
                        className="form-control block mb-5"
                        onChange={(e) => setBuildingId(e.target.value)}
                        required
                      >
                        <option value="">select property id</option>
                        {allBuilding &&
                          allBuilding.map((item) => (
                            <option value={item._id}>{item.name}</option>
                          ))}
                      </select>

                      <input
                        type="text"
                        className="form-control block mb-5"
                        placeholder="City"
                        value={block}
                        onChange={(e) => setBlock(e.target.value)}
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
                            onClick={(e) => handleaddBuilding(e)}
                          >
                            <span className="mr-3">Add Building</span>
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

export default AddBuilding;
