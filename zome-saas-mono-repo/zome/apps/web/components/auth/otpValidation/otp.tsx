import React, { useState, useEffect } from 'react';
import { ReactComponent as LoginImage } from './login.svg';
import router,{useRouter} from 'next/router';
import * as userUtil from '../../../services/utils/user.util';
import * as localStoreUtil from '../../../services/utils/localstore.util';
import { Spin } from 'antd';
import './signup.module.less';
import { ApiGet, ApiPost } from 'apps/web/services/helpers/API/ApiData';

const OtpMain = () => {
  const router = useRouter();
  const {
    query:{email} ,
  } = router;



  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [signupError, setSignupError] = useState('');

  useEffect(() => {
    localStoreUtil?.default.remove_data('signupBasicInfo');
  }, []);

  const handleOTP = (e) => {
    setOtp(e.target.value);
  };


  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    
    if (otp.length !== 4) {
      setSignupError('Please enter the 4 digit OTP.');
      return false;
    }
    // await ApiPost(`/${id}/${token}`, passdata)

    await ApiGet(`otpValidate/${email}/${otp}`)
    .then(async (res: any) => {
      console.log(res,"res-----")
      if(res.status == 201){   
        router.push({
          pathname:'/forgotPassword',
          query:{
            email: email,
           }
       })


      }else if(res.error.message == "jwt expired")
      {
       router.push("/tokenExpire")
       setTimeout(() => {
          setSignupError("Otp expired !!!")
       
        }, 4000);
      }else if(res.status == 204)
      {
        setTimeout(() => {
          setSignupError("Incorrect otp.")
       
        }, 4000);
      }
      else{
        // setprofileError(res.message)
        //   setErrorMessage("Invalid User")
        //   setprofileError('')
        }  
    })
    .catch((err) => {
      // console.log(err);
      setSignupError("Incorrect OTP !!! Please enter the same OTP sent over to your zome email address. ")
      setTimeout(() => {     
      }, 4000);
    });
  };

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
                <div className="header welcome-text-align">
                  <h2 className="opensans-bold heading-title-text-color heading-title-size">
                    Welcome to ZOME
                  </h2><br/><br/>
                  <h6 className="child-text-color font-size-16 tracking-normal mt-3 mb-4">
                  Please enter the 4 digit one-time password sent over to your zome email address.
                  </h6>
                  <h5 className="text-red-600">{signupError}</h5>
                </div>
                <form className="form">
                  <input
                    type="number"
                    className="form-control block mb-5"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => handleOTP(e)}
                  />
                  <div className="pt-5 m-pb-1">
                    <div className="same-button-style">
                      <>
                        <button
                          className="next-button-style"
                          onClick={(e) => handleOtpSubmit(e)}
                        >
                          Submit OTP
                        </button>
                      </>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
export default OtpMain;