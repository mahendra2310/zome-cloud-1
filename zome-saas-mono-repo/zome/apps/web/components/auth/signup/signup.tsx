import React, { useState, useEffect } from 'react';
import { ReactComponent as LoginImage } from './login.svg';
import router from 'next/router';
import * as userUtil from '../../../services/utils/user.util';
import * as localStoreUtil from '../../../services/utils/localstore.util';
import { Spin } from 'antd';
import './signup.module.less';
import Link from 'next/link';

const Signupmain = () => {
  let signupBasicInfo = localStoreUtil?.default.get_data('signupBasicInfo');
  console.log(signupBasicInfo);
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [signupError, setSignupError] = useState('');

  useEffect(() => {
    localStoreUtil?.default.remove_data('signupBasicInfo');
  }, []);

  const handleFullName = (e) => {
    // if (signupBasicInfo != undefined) {
    //   userUtil?.setsignupBasicInfo({
    //     fullName: '',
    //     userEmail: signupBasicInfo.userEmail,
    //     userName: signupBasicInfo.userName,
    //     userPassword: signupBasicInfo.userPassword,
    //   });
    // }
    setFullName(e.target.value);
  };

  const handleUsername = (e) => {
    // if (signupBasicInfo != undefined) {
    //   userUtil.setsignupBasicInfo({
    //     fullName: signupBasicInfo.fullName,
    //     userEmail: signupBasicInfo.userEmail,
    //     userName: '',
    //     userPassword: signupBasicInfo.userPassword,
    //   });
    // }
    setUserName(e.target.value);
  };

  const handleEmail = (e) => {
    // if (signupBasicInfo != undefined) {
    //   userUtil.setsignupBasicInfo({
    //     fullName: signupBasicInfo.fullName,
    //     userEmail: '',
    //     userName: signupBasicInfo.userName,
    //     userPassword: signupBasicInfo.userPassword,
    //   });
    // }
    setUserEmail(e.target.value);
  };
  const handlePhone = (e) => {
    // if (signupBasicInfo != undefined) {
    //   userUtil.setsignupBasicInfo({
    //     fullName: signupBasicInfo.fullName,
    //     userEmail: '',
    //     userName: signupBasicInfo.userName,
    //     userPassword: signupBasicInfo.userPassword,
    //   });
    // }
    setUserPhone(e.target.value);
  };

  const handlePassword = (e) => {
    // if (signupBasicInfo != undefined) {
    //   userUtil.setsignupBasicInfo({
    //     fullName: signupBasicInfo.fullName,
    //     userEmail: signupBasicInfo.userEmail,
    //     userName: signupBasicInfo.userName,
    //     userPassword: '',
    //   });
    // }
    setUserPassword(e.target.value);
  };

  const handleChangeSignupSubmit = async (e) => {
    e.preventDefault();
    if (!fullName) {
      setSignupError('Full Name can not be blank!');
      return false;
    }
    if (!userName) {
      setSignupError('User Name can not be blank!');
      return false;
    }
    if (!userEmail) {
      setSignupError('Email can not be blank!');
      return false;
    }
    if (!userPhone) {
      setSignupError('Phone number can not be blank!');
      return false;
    }
    if (userPhone.length !== 10) {
      setSignupError('Your phone number look like wrong!');
      return false;
    }
    if (!userPassword) {
      setSignupError('Password can not be blank!');
      return false;
    }
    let data = {
      fullName: fullName,
      userName: userName,
      userEmail: userEmail,
      userPhone: userPhone,
      userPassword: userPassword,
    };

    userUtil.setsignupBasicInfo(data);

    router.push('/signupdevice');
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
                    Signup
                  </h6>
                  <h5 className="text-red-600">{signupError}</h5>
                </div>
                <form className="form">
                  {/* <input
                    type="text"
                    className="form-control block mb-5"
                    placeholder="Company Name"
                    value={companyName}
                    onChange={(e) => handleChangeLogin(e)}
                  /> */}
                  <input
                    type="text"
                    className="form-control block mb-5"
                    placeholder="Full Name"
                    value={fullName}
                    defaultValue={signupBasicInfo?.fullName}
                    onChange={(e) => handleFullName(e)}
                  />
                  <input
                    type="text"
                    className="form-control block mb-5"
                    placeholder="User Name"
                    value={userName}
                    defaultValue={signupBasicInfo?.userName}
                    onChange={(e) => handleUsername(e)}
                  />
                  <input
                    type="email"
                    className="form-control block mb-5"
                    placeholder="Email"
                    value={userEmail}
                    defaultValue={signupBasicInfo?.userEmail}
                    onChange={(e) => handleEmail(e)}
                  />
                  <input
                    type="number"
                    className="form-control block mb-5"
                    placeholder="Mobile Number"
                    value={userPhone}
                    defaultValue={signupBasicInfo?.userPhone}
                    onChange={(e) => handlePhone(e)}
                  />
                  <input
                    type="password"
                    className="form-control block mb-1"
                    placeholder="Password"
                    value={userPassword}
                    defaultValue={signupBasicInfo?.userPassword}
                    onChange={(e) => handlePassword(e)}
                  />
                  <div className="new-account-text-rigth">
                    <Link href="/">Have an account? Sign in now</Link>
                  </div>
                  <div className="pt-5 m-pb-1">
                    <div className="same-button-style">
                      {/* <Link href="/">
                        <button className="prives-button-style">
                          Previous
                        </button>
                      </Link> */}
                      {/* <Link href="/signupdevice">
                        <button className="next-button-style">Next</button>
                      </Link> */}
                      <>
                        <button
                          className="next-button-style"
                          onClick={(e) => handleChangeSignupSubmit(e)}
                        >
                          Next
                        </button>
                      </>
                    </div>
                  </div>
                  {/* <div className="mt-4 m-pb-1">
                    <button
                      className="login-btn-style white-text-color block cursor-pointer text-center"
                      onClick={(e) => handleChangeSignupSubmit(e)}
                    >
                      <span className="mr-3"> LOGIN</span>
                      {loading && loading === true ? (
                        <Spin indicator={antIcon} />
                      ) : null}
                    </button>
                  </div> */}
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
export default Signupmain;
