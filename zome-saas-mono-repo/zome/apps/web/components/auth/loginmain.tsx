/* eslint-disable react/jsx-no-useless-fragment */
import React, { useState, useEffect } from 'react';
import { ReactComponent as LoginImage } from './login.svg';
import router from 'next/router';
import { ApiPost } from '../../services/helpers/API/ApiData';
import * as authUtil from '../../services/utils/auth.util';
import * as userUtil from '../../services/utils/user.util';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import Link from 'next/link';
import './loginmain.module.less';

const antIcon = (
  <LoadingOutlined style={{ fontSize: 20, color: 'white' }} spin />
);

const axios = require('axios');

const Loginmain = () => {
  const [loading, setLoading] = useState(false);

  const [companyName, setCompanyName] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  useEffect(() => {
    if (!userUtil.getUserInfo()) {
      router.push('/');
    } else {
      router.push('/dashboard');
    }
  }, []);
  const handleChangeLogin = (e) => {
    if (e.target.type === 'email') {
      //console.log(e.target.value);
      setLoginEmail(e.target.value);
    } else if (e.target.type === 'text') {
      //console.log(e.target.value);
      setCompanyName(e.target.value);
    } else {
      setLoginPassword(e.target.value);
    }
  };

  //* testing purpose api call is here.....

  // useEffect(() => {
  //   const getTestData = async () => {
  //     axios
  //       .get('http://3.85.120.212:4000/test')
  //       .then((response) => {
  //         //console.log(response.data[0].name)
  //       })

  //       .catch((err) => {
  //         console.log('err', err);
  //       });
  //   };

  //   getTestData();
  // }, []);

  const handleChangeLoginSubmit = async (e) => {
    e.preventDefault();

    if (loginEmail === '' && loginPassword === '') {
      setLoginError('username or password can not be blank!');
    } else if (loginEmail === '') {
      setLoginError('username can not be blank!');
    } else if (loginPassword === '') {
      setLoginError('password can not be blank!');
    } else {
      e.preventDefault();
      var data = {
        userid: loginEmail,
        password: loginPassword,
        // companyName: companyName,
      };
      //console.log('data', data);
      setLoading(true);
      await ApiPost('login', data)
        //await ApiPost('login', data)
        .then(async (res: any) => {
          if (
            res.data.msg === 'User does not exist' ||
            res.data.msg === 'Invalid credentials'
          ) {
            setLoginError('invalid username or password!');
          } else {
            // authUtil.setToken(res.data.token);

            // localStorage.setItem('x-auth-token', res.data.token);
            //console.log(res.data);
            localStorage.clear();
            authUtil.setToken(res.data.token);
            userUtil.setUserInfo(res.data);
            userUtil.setTempPopup(false);
            //const _data = { ...res.data };
            //localStorage.setItem('userinfo', );
            //await localStorage.setItem('userinfo', JSON.stringify(res.data));
            router.push('/dashboard');
          }
          setLoading(false);
        })
        .catch((err) => {
          setLoading(false);
          console.log(err);
        });
    }
  };

  return (
    <>
      <section className="login-banner bg-white">
        <div className="">
          <div className="lg:flex md:flex  align-content">
            <div className="lg:w-4/6 md:w-1/2 m-pl-2 flex justify-center items-center banner-full-height">
              <div className="login-banner-img ">
                <LoginImage className="login-banner-img" />
              </div>
            </div>
            <div className="lg:w-2/6 md:w-1/2 pl-8 pr-8 m-pl-2 m-login-banner">
              <div className="mobile-view-center">
                <div className="left">
                  <div className="header">
                    <h2 className="opensans-bold heading-title-text-color heading-title-size">
                      Welcome to ZOME
                    </h2>
                    <br/><br/>
                    <h6 className="child-text-color font-size-16 tracking-normal mt-3 mb-4">
                      Log in to your account using email and password
                    </h6>
                    <h5 className="text-red-600">{loginError}</h5>
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
                      type="email"
                      className="form-control block mb-5"
                      placeholder="Email or username"
                      value={loginEmail}
                      onChange={(e) => handleChangeLogin(e)}
                    />
                    <input
                      type="password"
                      className="form-control block mb-1"
                      placeholder="Password"
                      value={loginPassword}
                      onChange={(e) => handleChangeLogin(e)}
                    />
                    <div className="new-account-text-rigth">
                      <Link href="/signupterm">create new account?</Link>
                    </div>

                    <div className="new-account-text-rigth">
                      <Link href="/resetPassword">forgot password?</Link>
                    </div>

                    <div className="new-account-text-rigth">
                      <Link href="/forgotUsename">forgot username?</Link>
                    </div>
                    {/* <p className="">
                    <a
                      href="#"
                      className="child-text-color text-xs flex justify-end cursor-pointer"
                    >
                      Forgot Password?
                    </a>
                  </p> */}
                    <div className="mt-4 m-pb-1 mobile-button-center">
                      <button
                        className="login-btn-style white-text-color block cursor-pointer text-center"
                        onClick={(e) => handleChangeLoginSubmit(e)}
                      >
                        <span className="mr-3"> LOGIN</span>
                        {loading && loading === true ? (
                          <Spin indicator={antIcon} />
                        ) : null}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
export default Loginmain;
