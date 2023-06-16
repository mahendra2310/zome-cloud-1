import React, { useState, useEffect } from 'react';
import { ReactComponent as LoginImage } from './login.svg';
import {useRouter} from 'next/router';
import * as userUtil from '../../../services/utils/user.util';
import { message, Spin, Tooltip, Modal } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import './signupdevice.module.less';
import Link from 'next/link';
import * as localStoreUtil from '../../../services/utils/localstore.util';
import { ApiGet } from 'apps/web/services/helpers/API/ApiData';
import Scanner from '../../../pages/scanner/index';

const antIcon = (
  <LoadingOutlined style={{ fontSize: 20, color: 'white' }} spin />
);
const Signupdevice = () => {
  const [loading, setLoading] = useState(false);
  const [deviceId, setdeviceId] = useState<any>('');
  const [deviceIdError, setdeviceIdError] = useState('');
  const [isAvailable, setIsAvailable] = useState<any>();
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [AptName,setAptName] =useState([]);
  const[AptESID,setAptESID] = useState([]);
  const[flag,setFlag] = useState(false);
  const router = useRouter();
  const handleFlag = ()=>{
    flag==true ? setFlag(false) : setFlag(true)
  }
  useEffect(()=>{
    if(!router.isReady) return;
    setTimeout(() => {
      router.query.Id ? setdeviceId(router.query.Id) :setdeviceId("")
    }, 1000);
  },[router.isReady])
  const handleDeviceIdChange = async (e) => {
    setdeviceId(e.target.value);
  };

  const handleDeviceIdChangeSubmit = async (e) => {
    e.preventDefault();

    if (!deviceId) {
      setdeviceIdError('Device Id cannot be blank!');
      return false;
    } else {
      setLoading(true);
      await ApiGet(`check?deviceId=${deviceId}`)
        .then((res: any) => {
    
          if (res.data.isAvailable == true) {
           let apartment_name = res.data.aptName[0];
           let apartment_ESID = res.data.aptESID[0];
           AptName.push(apartment_name);
           AptESID.push(apartment_ESID);
            
            router.push({
              pathname: '/apartmentVerification',
              query:{
                Apartment_name: AptName,
                Apartment_ESID : AptESID,
                deviceId,
                apartment_id : res.data.apartment_id
               }
            });

            setIsAvailable(true);
            userUtil.setsignupDeviceId({ deviceId: deviceId });
            // router.push('/apartmentVerification');
            setLoading(false);
          } else if (res.data.status == 205) {            
            setdeviceIdError(res.data.msg);
            setTimeout(() => {
              setdeviceIdError("");
            }, 5000);
            setLoading(false);
            
          } else if(res.data.apartmentAssociated == false){
            setdeviceIdError(res.data.msg);
            setLoading(false);
           if(confirm("Your device is not associated with any apartment. Click OK to associate device.")){
            router.push({
              pathname: "/locationIdentification",
              query:{
                deviceId
               }
            });
           }else {
            setTimeout(() => {
              setdeviceIdError("");
            }, 5000);
           }
            // setTimeout(() => {
            //   router.push("/locationIdentification")
            // }, 7000);
          }
          
          else {
            setIsAvailable(false);
            setdeviceIdError(res.data.msg);
 
            // setTimeout(() => {
            //   router.push("/locationIdentification")
            // }, 7000);
            setLoading(false);
          }
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
        });
    }
  };
  console.log({ isAvailable });
  return (
    <>
      <section className="login-banner bg-white">
        <div className="">
          <div className="lg:flex md:flex  align-content">
            <div className="lg:w-4/6 md:w-1/2 m-pl-2 flex justify-center items-center banner-full-height ">
              <div className="login-banner-img ">
                <LoginImage className="login-banner-img" />
              </div>
            </div>
            <div className="lg:w-2/6 md:w-1/2 pl-8 pr-8 m-pl-2 m-login-banner">
              <div className="left">
                <div className="header device-text-style">
                  <h2 className="opensans-bold heading-title-text-color heading-title-size">
                    Welcome to ZOME
                  </h2><br/><br/>
                  <span className="child-text-color font-size-50 tracking-normal mt-3 mb-4">
                     
                  </span> 
                  <span className='text-xl' > Please Enter Device ID -- or -- <u><Link href={"/scanner"}>SCAN</Link></u> label</span>
                    <Tooltip placement="left" title="Click for Instructions">
                    <img
                      src="https://cdn-icons-png.flaticon.com/512/471/471664.png"
                    // className="w-7"
                      onClick={() => setDetailsVisible(true)}
                      width="20px"
                      height="20px"
                     />
                    </Tooltip>
                    
                  
                  {detailsVisible && 
                  <Modal
                      title="Instructions"
                      visible={detailsVisible}
                      onCancel={() => setDetailsVisible(false)}
                      footer={null}
                      width={600}
                    >
                      <div>
                        <img src='/instructions.png' alt='Instructions'></img>
                      </div>
                    </Modal>
                  }
                  <h5 className="text-red-600">{deviceIdError}</h5>
                </div>
                <form className="form">
                  <div className="device-true-icon-align">
                    <input
                      type="email"
                      className="form-control block mb-5"
                      placeholder="Device Id"
                      value={deviceId}
                      onChange={(e) => handleDeviceIdChange(e)}
                    />
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
                  <div className="mt-4 m-pb-1">
                    <div className="same-button-style space-x-3">
                      <Link href="/signupterm">
                        <button className="prives-button-style">
                          Previous
                        </button>
                      </Link>
                      <Link href="/signupterm">
                        <button
                          className="next-button-style"
                          onClick={(e) => handleDeviceIdChangeSubmit(e)}
                        >
                          <span className="mr-3"> Next </span>
                          {loading && loading === true ? (
                            <Spin indicator={antIcon} />
                          ) : null}
                        </button>
                      </Link>
                    </div>
                  </div>
                {flag==true && <div className='mt-4'><Scanner /></div>}
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
export default Signupdevice;
