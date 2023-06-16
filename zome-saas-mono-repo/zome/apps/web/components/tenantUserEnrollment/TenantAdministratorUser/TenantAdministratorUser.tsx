import React, { useState, useEffect } from 'react';
import { ReactComponent as LoginImage } from './TenantAdministratorUser.svg';
import './TenantAdministratorUser.module.less';
import Link from 'next/link';
import { useRouter } from 'next/router';

const TenantAdministratorUser = () => {

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [emptyError, setEmptyError] = useState('');
  const router = useRouter();
  const isNonWhiteSpace = /^\S*$/;
  const isContainsSymbol =/^(?=.*[~`!@#$%^&*()--+={}\[\]|\\:;"'<>,.?/_₹]).*$/;
  const isContainsNumber = /^(?=.*[0-9]).*$/;


  const { meter_id } = router.query;
  const role = router.query.role
  const deviceId = router.query.deviceId

  
  const onSubmit = (e) => {
    e.preventDefault();

    if (firstName == "" || firstName == undefined || !isNonWhiteSpace.test(firstName) ||  firstName.length >20 || isContainsSymbol.test(firstName) || isContainsNumber.test(firstName)) {
      isNonWhiteSpace.test(firstName) ?  firstName.length>20 ? setEmptyError("First name only contain 20 characters") : isContainsSymbol.test(firstName) ? setEmptyError("special character is not allowed in the First name"): isContainsNumber.test(firstName) ? setEmptyError("Number is not allowed in the First name"):  setEmptyError("First Name cannot be blank") :  setEmptyError("blank space is not allowed in the First name")
      setTimeout(() => {
        setEmptyError("")
      }, 3000);
      return
    }
     else if (lastName == "" || lastName == undefined || !isNonWhiteSpace.test(lastName) || lastName.length >40 || isContainsSymbol.test(lastName) || isContainsNumber.test(lastName)) {
      isNonWhiteSpace.test(lastName) ? lastName.length>40 ? setEmptyError("Last name only contain 40 characters") : isContainsSymbol.test(lastName) ? setEmptyError("special character is not allowed in the Last name")  :  isContainsNumber.test(lastName) ? setEmptyError("Number is not allowed in the Last name"):  setEmptyError("Last Name cannot be blank")  : setEmptyError("blank space is not allowed in the Last name");
      setTimeout(() => {
        setEmptyError("")
      }, 3000);
      return

    } else {
        let data = {
          firstName ,
          lastName
        }

            router.push({
              pathname: '/userIdentification',
              query: {
                   firstName ,lastName ,meter_id,
                   role,
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

                  <form action="">
                  <h5 className="text-red-600">{emptyError}</h5>
                    <div className="grid gap-6 mb-6 mt-4 md:grid-cols-2">
                      <div>
                        <label htmlFor="first_name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">First name</label>
                        <input type="text" 
                        id="first_name" 
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                         placeholder="John"
                         onChange={(e)=>setFirstName(e.target.value)}
                          required 
                          />
                      </div>
                      <div>
                        <label htmlFor="last_name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Last name</label>
                        <input
                         type="text" 
                         id="last_name"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                           placeholder="Doe" 
                           onChange={(e)=>setLastName(e.target.value)}
                           required
                            />
                      </div>
                    </div>

                    <div className="mt-4 m-pb-1 flex flex-col space-y-9">
                      <div className='flex flex-col'>
                        <div className='block'>You will be designated as the Tenant Administrator User</div>
                        {/* <div>the home administrator</div> */}
                      </div>

                      <div className="same-button-style relative">
                          <button
                            className="next-button-style absolute right-0"
                            onClick={(e)=>{onSubmit(e)}}
                          >
                            <span className="mr-3"> Next </span>
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
export default TenantAdministratorUser;
