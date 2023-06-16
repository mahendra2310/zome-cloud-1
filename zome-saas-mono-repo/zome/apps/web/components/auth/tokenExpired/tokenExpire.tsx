import React, { useState, useEffect } from 'react';

import router from 'next/router';


import './signup.module.less';
import Link from 'next/link';
import { ReactComponent as LoginImage } from './login.svg';
const TokenExpireMain = () => {

  const [loading, setLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [message, setMessage] = useState(false);
  const [profileError, setprofileError] = useState('');

  const [showForm,setShowForm] = useState(true);


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
                { <p style={{ color: "red",  }}>OTP expired.</p> }
                { <p style={{ color: "red",  }}>Kindly proceed with the forgot password process again. </p> }
                  
                      <Link href="/resetPassword">forgot password?</Link>
                 
                  </h6>
                  }
                  <h5 className="text-red-600">{errorMessage}</h5>
                </div>
                
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
export default TokenExpireMain

;
