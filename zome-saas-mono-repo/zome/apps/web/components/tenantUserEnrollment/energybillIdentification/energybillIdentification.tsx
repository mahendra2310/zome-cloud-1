import React, { useState, useEffect } from 'react';
import { ReactComponent as LoginImage } from './energybillIdentification.svg';
import { useRouter } from 'next/router';
import './energybillIdentification.module.less';
import Link from 'next/link';
import { ApiGet } from 'apps/web/services/helpers/API/ApiData';

const EnergybillIdentification = () => {

  const router = useRouter()
  const { meter_id } = router.query;
  const { deviceId } = router.query;

  console.log(meter_id,"meterid.............energy bill..");

  
  const moveTopage = async (e) => {
    if (e.target.value == "Yes") {

             router.push({
              pathname: '/TenantAdministratorUser',
              query: {
                        meter_id,
                        role : "TenantAdministratorUser",
                        deviceId
                  }
            })   

    } else 
    {
       router.push({
        pathname: '/tenantUser',
        query: {
                 meter_id,
                 role : "tenant",
                 deviceId
            }
      })  
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
                  <h6 className="child-text-color font-size-16 tracking-normal mt-3 ml-4">
                    Is your Name on the Energy bill ?
                  </h6>

                  <form action="">
                    <div className="flex items-center mb-4">
                      <input
                        id="disabled-radio-1"
                        type="radio"
                        value="Yes"
                        name="disabled-radio"
                        onChange={(e)=>{moveTopage(e)}}
                        className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 dark:focus:ring-blue-600 dark:ring-offset-gray-800  dark:bg-gray-700 dark:border-gray-600"
                      />
                      <label htmlFor="disabled-radio-1"  className="ml-2 text-xl font-medium text-gray-400 dark:text-gray-500">Yes</label>
                    </div>
                    <div className="flex items-center">
                      <input
                       value="No"
                        type="radio"
                        name="disabled-radio"
                        onChange={(e)=>{moveTopage(e)}}
                        className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 dark:focus:ring-blue-600 dark:ring-offset-gray-800  dark:bg-gray-700 dark:border-gray-600"/>
                      <label htmlFor="disabled-radio-2"  className="ml-2 text-xl font-medium text-gray-400 dark:text-gray-500">No</label>
                    </div>
                    <div className="mt-4 m-pb-1">
                  </div>
                  <div className="mt-5 m-pb-1">
                      <div className="same-button-style relative">
                        <Link href="/locationIdentification">
                          <button  className="next-button-style absolute right-0">Previous</button>
                        </Link>
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
export default EnergybillIdentification;
