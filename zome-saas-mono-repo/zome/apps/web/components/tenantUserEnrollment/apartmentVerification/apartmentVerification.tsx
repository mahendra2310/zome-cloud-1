import React, { useState, useEffect } from 'react';
import { ReactComponent as LoginImage } from './apartment.svg';
import { useRouter } from 'next/router';
import './apartmentVerification.module.less';
import Link from 'next/link';
import { ApiGet } from 'apps/web/services/helpers/API/ApiData';


const ApartmentVerification = () => {

  const router = useRouter()
  const { Apartment_name } = router.query;
  const { Apartment_ESID } = router.query;
  const { deviceId } = router.query;

  const moveTopage = async (e) => {
    if (e.target.value == "Yes") {
      await ApiGet(`apartments/${Apartment_name}`)
        .then((res: any) => {

          if (!res.data.flag) {
            console.log(res.data.flag, "Here is meter id is not avaible")
          } else {
            console.log(res.data.flag, "Here is meter id is avaible")
            console.log(res.data, "res-----------");
            router.push({
              pathname: '/userIdentification',
              query: {
                meter_id: res.data.meter_number,
                Apartment_ESID: Apartment_ESID,
                Apartment_name,
                deviceId,
                role : "TenantAdministratorUser",
                apartment_id : router.query.apartment_id
              }
            });
          }

        })
        .catch((err) => {
          console.log('error in get data!!');
        });

    } else {
      router.push({
        pathname: '/locationIdentification',
        query: {
          deviceId
        }
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
                  <h6 className="child-text-color font-size-16 tracking-normal mt-3 ml-4">
                    <span> Are you living </span> <span className='font-bold'> {Apartment_name} ?</span>
                  </h6>

                  <form action="">
                    <div className="flex items-center mb-4">
                      <input
                        id="disabled-radio-1"
                        type="radio"
                        value="Yes"
                        name="disabled-radio"
                        onClick={(e) => { moveTopage(e) }}
                        className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 dark:focus:ring-blue-600 dark:ring-offset-gray-800  dark:bg-gray-700 dark:border-gray-600"
                      />
                      <label htmlFor="disabled-radio-1" className="ml-2 text-xl font-medium text-gray-400 dark:text-gray-500">Yes</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        value="No"
                        type="radio"
                        name="disabled-radio"
                        onClick={(e) => { moveTopage(e) }}
                        className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 dark:focus:ring-blue-600 dark:ring-offset-gray-800  dark:bg-gray-700 dark:border-gray-600" />
                      <label htmlFor="disabled-radio-2" className="ml-2 text-xl font-medium text-gray-400 dark:text-gray-500">No</label>
                    </div>
                    <div className="mt-10 m-pb-1">
                      <div className="same-button-style relative right-0">
                        <Link href="/signupdevice">
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
export default ApartmentVerification;
