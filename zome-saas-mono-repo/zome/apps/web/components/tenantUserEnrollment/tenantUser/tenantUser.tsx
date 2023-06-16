import React, { useState, useEffect } from 'react';
import { ReactComponent as LoginImage } from './tenantUser.svg';
import { useRouter } from 'next/router';
import './tenantUser.module.less';

const TenantUser = () => {
  const router = useRouter()
  const role = router.query.role
  const deviceId = router.query.deviceId

  const moveToNext = (e)=>{
    e.preventDefault()
    router.push({
      pathname: '/userIdentification',
      query: {
               meter_id  : router.query.meter_id,
               role,
               deviceId
          }
    }) 

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
                  
                 <div>
                    <p className='font-bold mb-8'>Only the person listed on the energy bill can be the home administrator ,  you will be given a normal user account</p>
                 </div>
                  <form action="">

                    <div className="mt-4 m-pb-1">
                    <div className="same-button-style relative">
                        <button
                          className="next-button-style absolute right-0"
                          onClick={moveToNext}
                        >
                          <span className="mr-3"> Submit </span>
                        </button>
                    </div>
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
export default TenantUser;
