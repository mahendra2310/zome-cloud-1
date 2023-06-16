import React, { useState, useEffect } from 'react';
import { ReactComponent as LoginImage } from './login.svg';
import router from 'next/router';

import { Spin } from 'antd';
import './signup.module.less';
import Link from 'next/link';
import { ApiPost } from 'apps/web/services/helpers/API/ApiData';

import { PoweroffOutlined } from '@ant-design/icons';
import { Button, Space } from 'antd';

const ResetPasswordMain = () => {

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState('');
  const [message, setMessage] = useState(false);
  const [profileError, setprofileError] = useState('');
  const [loadings, setLoadings] = useState<boolean[]>([]);
  const [showForm,setShowForm] = useState(true);


  const handleEmail = (e) => {
    setEmail(e.target.value);
  };


  
  const sendLink = async (e) => {
    e.preventDefault();

    if (email === "") {
      setErrorMessage("Email is required!");
    } else if (!email.includes("@")) {
      setErrorMessage("Please include @ in your email.");
    } else {

        let data = {
          email : email
        }

        await ApiPost('sendpasswordlink', data)
        .then(async (res: any) => {
          console.log(res,"res-----")
          if(res.status == 201){   
            setEmail("");
            setErrorMessage("");
            setMessage(true)         
            setprofileError('')
            setShowForm(false);

            router.push({
              pathname:'/otpValidation',
              query:{
                email: email,
               }
           })

          }else if(res.status == 401)
          {
            setprofileError(res.message)
              setErrorMessage("Invalid user. You are not registered with us.")
            setTimeout(() => {
              setErrorMessage('')
            }, 4000);
          }
          else{
            setprofileError(res.message)
              setErrorMessage("Invalid User.  You are not registered with us.")
              setprofileError('')
            }  
          
        })
        .catch((err) => {
          // console.log(err);
        });
    }
}

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
                  {showForm == true && 
                  <h6 className="child-text-color font-size-16 tracking-normal mt-3 mb-4">
                    Please enter your registered email linked with Zome
                  </h6>
                  }
                  <h5 className="text-red-600">{errorMessage}</h5>
                  <h6 className="child-text-color font-size-16 tracking-normal mt-3 mb-4">
                {message ? <p style={{ color: "green", fontWeight: "bold" }}>OTP  has been sent to your</p> : ""}
                {message ? <p style={{ color: "green", fontWeight: "bold" }}> registered zome-email.</p> : ""}
                </h6>
                </div>
                {showForm == true && 
                <form className="form">

      
                  <input
                    type="email"
                    className="form-control block mb-5"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => handleEmail(e)}
                  />
                
                  <div className="new-account-text-rigth">
                    <Link href="/">Have an account? Sign in now</Link>
                  </div>
                  <div className="pt-5 m-pb-1">
                    <div className="same-button-style">
                      <>
                        <button
                          className="next-button-style"
                          onClick={(e) => sendLink(e)}
                       
                        >
                          Next
                        </button>
                      </>
                    </div>
                  </div>
                </form>
                  }
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
export default ResetPasswordMain

;
