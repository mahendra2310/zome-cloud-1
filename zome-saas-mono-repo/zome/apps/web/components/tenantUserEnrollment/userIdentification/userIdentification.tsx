import React, { useState, useEffect } from 'react';
import { ReactComponent as LoginImage } from './userIdentification.svg';
import { useRouter } from 'next/router';
import './userIdentification.module.less';
import Link from 'next/link';
import { ApiGet, ApiPost } from 'apps/web/services/helpers/API/ApiData';
import * as authUtil from '../../../services/utils/auth.util';
import * as userUtil from '../../../services/utils/user.util';
import { message, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const UserIdentification = () => {
  const [Apartments, setApartments] = useState([]);
  const [firstName, setFirstName] = useState<any>('');
  const [lastName, setLastName] = useState<any>('');
  const [meter_id, setMeter_id] = useState<any>()
  const [flag, setFlag] = useState(true)
  const [userName, setUserName] = useState<any>('')
  const [password, setPassword] = useState<any>("")
  const [energyCompanyName, setEnergyCompanyName] = useState<any>("")
  const [email, setEmail] = useState("")
  const [ESID, setESID] = useState<any>("")
  const [error, setError] = useState("")
  const [errorFlaG, setErrorFlaG] = useState(true)
  const [phone, setPhoneNumber] = useState("")
  const [selectedApartment, setSelectedApartment] = useState<any>('')
  const [loading, setLoading] = useState(false);
  const [flag2, setFlag2] = useState(true)
  const antIcon = (
    <LoadingOutlined style={{ fontSize: 20, color: 'white' }} spin />
  );


  const isNonWhiteSpace = /^\S*$/;
  const isEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  const isContainsSymbol = /^(?=.*[~`!@#$%^&*()--+={}\[\]|\\:;"'<>,.?/_₹]).*$/;
  const isContainsUppercase = /^(?=.*[A-Z]).*$/;
  const isContainsNumber = /^(?=.*[0-9]).*$/;
  const isValidLength = /^.{8,16}$/;
  const isContainsLowercase = /^(?=.*[a-z]).*$/;

  const router = useRouter();

  const role = router.query.role
  const deviceId = router.query.deviceId

  if (router.query.Apartment_name) {
    var Apartment_name = router.query.Apartment_name
  }

  useEffect(() => {
    if (!router.isReady) return;

    setFirstName(router.query.firstName);
    setLastName(router.query.lastName);

    if (router.query.meter_id) {
      setMeter_id(router.query.meter_id)
    }

    if (router.query.Apartment_ESID) {
      setFlag2(false)
      setSelectedApartment(router.query.apartment_id)
      setESID(router.query.Apartment_ESID)
    }

  }, [router.isReady]);


  const getAllApartments = async (meter_id) => {

    await ApiGet(`apartmentNames/${meter_id}`)
      .then((res: any) => {
        setApartments(res.data.findApartmentByMeterId);
      })
      .catch((err) => {
        console.log(err);
      });
  }


  useEffect(() => {

    if (meter_id != undefined) {
      getAllApartments(meter_id);
    }

  }, [meter_id]);


  useEffect(() => {

    if (selectedApartment) {

      const getESID = async () => {
        await ApiGet(`getesid/${selectedApartment}`)
          .then((res: any) => {
            if (res.data.msg == "esid id is available in the database") {
             // message.success("ESID updated successfully")
              setESID(res.data.esid);
            } else if (res.data.esid == "esid id is not available in the database") {
              message.error("esid id is not available in the database")
            } else {
              message.error("internal server error")
            }

          })
          .catch((err) => {
            console.log(err);
          });

      }
      getESID()
    }
  }, [selectedApartment])


  const nextValidation = async (e) => {
    e.preventDefault()

    if (selectedApartment.length <= 0) {
      setError("Apartment Name cannot be blank")
      setTimeout(() => {
        setError("")
      }, 3000); ``
      return
    }
    else if (firstName == "" || firstName == undefined || !isNonWhiteSpace.test(firstName) || firstName.length > 20 || isContainsSymbol.test(firstName)) {
      isNonWhiteSpace.test(firstName) ? firstName.length > 20 ? setError("first name only contain 20 characters") : isContainsSymbol.test(firstName) ? setError("special character is not allowed in the first name") : setError("first Name cannot be blank") : setError("blank space is not allowed in the first name")
      setTimeout(() => {
        setError("")
      }, 3000);
      return
    } else if (lastName == "" || lastName == undefined || !isNonWhiteSpace.test(lastName) || lastName.length > 40 || isContainsSymbol.test(lastName)) {
      isNonWhiteSpace.test(lastName) ? lastName.length > 40 ? setError("last name only contain 40 characters") : isContainsSymbol.test(lastName) ? setError("special character is not allowed in the last name") : setError("Last Name cannot be blank") : setError("blank space is not allowed in the last name");
      setTimeout(() => {
        setError("")
      }, 3000);
      return
    } else if (phone == "" || !isNonWhiteSpace.test(phone) || phone.length != 10) {
      isNonWhiteSpace.test(phone) ? (phone == "" ? setError("Phone Number cannot be blank") : setError("Please Provide valide Phone Number")) : setError("blank space is not allowed in the Phone Number");
      setTimeout(() => {
        setError("")
      }, 3000);
      return
    } else if (email == "" || !isEmail.test(email) || email.length > 60) {
      email == "" ? setError("Email cannot be blank") : isEmail.test(email) ? setError("Email cannot contain more than 60 character") : setError("Please enter valid email address");
      setTimeout(() => {
        setError("")
      }, 3000);
      return
    }

    setFlag(false)

    localStorage.setItem("selectedApartment", selectedApartment)
    localStorage.setItem("firstName", firstName)
    localStorage.setItem("lastName", lastName)
    localStorage.setItem("phone", phone)
    localStorage.setItem("email", email)
    localStorage.setItem("ESID", ESID)
    localStorage.getItem("userName") ? setUserName(localStorage.getItem("userName")) : null
    localStorage.getItem("password") ? setPassword(localStorage.getItem("password")) : null
    localStorage.getItem("energyCompanyName") ? setEnergyCompanyName(localStorage.getItem("energyCompanyName")) : null
  }

  useEffect(() => {
    const GetLocalStorageItem = async () => {

      setTimeout(() => {
        localStorage.getItem("selectedApartment") ? setSelectedApartment(localStorage.getItem("selectedApartment")) : null
        localStorage.getItem("firstName") ? setFirstName(localStorage.getItem("firstName")) : null
        localStorage.getItem("lastName") ? setLastName(localStorage.getItem("lastName")) : null
        localStorage.getItem("phone") ? setPhoneNumber(localStorage.getItem("phone")) : null
        localStorage.getItem("email") ? setEmail(localStorage.getItem("email")) : null
        localStorage.getItem("ESID") ? setESID(localStorage.getItem("ESID")) : null
        localStorage.getItem("userName") ? setUserName(localStorage.getItem("userName")) : null
        localStorage.getItem("password") ? setPassword(localStorage.getItem("password")) : null
        localStorage.getItem("energyCompanyName") ? setEnergyCompanyName(localStorage.getItem("energyCompanyName")) : null
      }, 2000);

    }

    GetLocalStorageItem()
  }, [])

  const previousButton = () => {
    setFlag(true)

    userName != "" ? localStorage.setItem("userName", userName) : ""
    password != "" ? localStorage.setItem("password", password) : ""
    energyCompanyName != "" ? localStorage.setItem("password", energyCompanyName) : ""

  }


  const nextValidationFinal = async (e) => {
    e.preventDefault()

    setEnergyCompanyName(energyCompanyName.trim())

    if(energyCompanyName == "" || energyCompanyName.length >40 || isContainsSymbol.test(energyCompanyName) || isContainsNumber.test(energyCompanyName)){
      energyCompanyName.length>40 ? setError("Energy company name can not exceed 40 characters") : energyCompanyName == "" ? setError("Energy company name cannot be blank") : isContainsSymbol.test(energyCompanyName) ? setError("special character is not allowed in the Energy company name") : isContainsNumber.test(energyCompanyName) ? setError("Number is not allowed in the Energy company name") : null
      setTimeout(() => {
        setError("")
      }, 3000);
      return
    }
    else if (userName == "" || !isNonWhiteSpace.test(userName) || isContainsSymbol.test(userName)) {
      userName == "" ? setError("User Name cannot be blank") : isContainsSymbol.test(userName) ? setError("special character is not allowed in the user name") : setError("blank space is not allowed in the userName")
      setTimeout(() => {
        setError("")
      }, 3000);
      return
    } else if (password == "" || !isNonWhiteSpace.test(password) || !isContainsUppercase.test(password) || !isContainsLowercase.test(password) || !isContainsNumber.test(password) || !isContainsSymbol.test(password) || !isValidLength.test(password)) {

      if (password == "") {
        setError("Password cannot be blank")
      } else if (!isNonWhiteSpace.test(password)) {
        setError("Password must not contain Whitespaces.")
      } else if (!isContainsUppercase.test(password)) {
        setError("Password must have at least one Uppercase Character.")
      } else if (!isContainsLowercase.test(password)) {
        setError("Password must have at least one Lowercase Character.")
      } else if (!isContainsNumber.test(password)) {
        setError( "Password must contain at least one Digit.")
      } else if (!isContainsSymbol.test(password)) {
        setError("Password must contain at least one Special Symbol.")
      } else if (!isValidLength.test(password)) {
        setError("Password must be 8-16 Characters Long")
      }
      setTimeout(() => {
        setError("")
      }, 3000);
      return
    } else {

      localStorage.removeItem("selectedApartment")
      localStorage.removeItem("firstName")
      localStorage.removeItem("lastName")
      localStorage.removeItem("phone")
      localStorage.removeItem("email")
      localStorage.removeItem("ESID")
      localStorage.removeItem("userName")
      localStorage.removeItem("password")
      localStorage.removeItem("energyCompanyName")

      const formData = {
        selectedApartment,
        firstName,
        lastName,
        phone,
        email,
        userName,
        password,
        role,
        deviceId,
        energyCompanyName
      }

      setLoading(true);
      await ApiPost('signup', formData)
        .then((res: any) => {
          console.log(res, "res======")
          if (res.data.msg == "Please enter all fields") {
            setLoading(false);
            setError("Please enter all fields")
            setTimeout(() => {
              setError("")
            }, 3000);
            return
          } else if (res.data.msg == "Email already exists") {
            setLoading(false);
            setError("Email already exists please try another email")
            setTimeout(() => {
              setError("")
            }, 3000);
            return
          } else if (res.data.msg == "Username already exists") {
            setLoading(false);
            setError("Username already exists please try another user name")
            setTimeout(() => {
              setError("")
            }, 3000);
            return
          } else if (res.data.msg == "User has been created") {
            setLoading(false);
            localStorage.clear();
            authUtil.setToken(res?.data?.token);
            userUtil.setUserInfo(res.data);
            message.success("user created successfully")
            router.push("/dashboard")
            return
          } else {
            setLoading(false);
            setError("User not created")
            setTimeout(() => {
              setError("")
            }, 3000);

            return
          }
        })
        .catch((err) => {
          setLoading(false);
          console.log(err);
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

                  {flag == true &&
                    <h6 className="child-text-color font-size-16 tracking-normal mt-3 ml-4">
                      User Identification
                    </h6>
                  }
                  {
                    flag2 ? null : <h1 className='mb-8'>Your Apartment is {Apartment_name}</h1>
                  }
                  <h4 className='text-red-900'>{errorFlaG && error}</h4>
                  <form>
                    {
                      flag == true ?
                        <span>
                          {
                            flag2 ? <select
                              className="form-control block mb-5"
                              value={selectedApartment}
                              onChange={(e) => { setSelectedApartment(e.target.value) }}
                              required
                            >
                              <option value="">select Apartment id</option>

                              {Apartments?.map((i) => {
                                return (
                                  <option value={i._id} key={i._id}>{i.name}</option>
                                );
                              })}
                            </select> : null
                          }

                          <br />

                          <div className="grid gap-6 mb-6 mt-1 md:grid-cols-2">
                            <div>
                              <label htmlFor="first_name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">First name</label>
                              <input
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                id="first_name"
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                placeholder="first_name"
                                required
                                name="firstName"
                              />
                            </div>
                            <div>
                              <label htmlFor="last_name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Last name</label>
                              <input type="text" id="last_name" value={lastName} onChange={(e) => setLastName(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Last Name" required />
                            </div>

                            <div>
                              <label htmlFor="phoneNumber" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Cell Phone #</label>
                              <input
                                type="number"
                                value={phone}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                id="phoneNumber"
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                placeholder="phone Number"

                              />
                            </div>

                            <div>
                              <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Email </label>
                              <input
                                type="text"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value) }}
                                id="email"
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                placeholder="Email"
                                required
                              />
                            </div>

                            <div>
                              <label htmlFor="ESID" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">ESID  </label>
                              <input
                                type="text"
                                value={ESID}
                                onChange={(e) => { setESID(e.target.value) }}
                                id="ESID"
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                placeholder="ESID"
                                disabled
                              />
                            </div>

                            <div>
                              <label htmlFor="meterNumber" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Meter Number </label>
                              <input
                                type="text"
                                value={meter_id}
                                id="meterNumber"
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                placeholder="meter Number"
                                onChange={(e) => setMeter_id(e.target.value)}
                                disabled
                              />
                            </div>

                          </div>

                        </span> :                        
                        <div>

                          <div>
                            <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Name of Energy Company </label>
                            <input
                              type="text"
                              value={energyCompanyName}
                              onChange={(e) => setEnergyCompanyName(e.target.value)}
                              id="password"
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                              placeholder="Name of Energy Company"
                              required
                            />
                          </div>

                          <div>
                            <label htmlFor="userName" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">User Name  </label>
                            <input
                              type="text"
                              value={userName}
                              onChange={(e) => setUserName(e.target.value)}
                              id="userName"
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                              placeholder="user name"
                              required
                            />
                          </div>

                          <div>
                            <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password </label>
                            <input
                              type="password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              id="password"
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                              placeholder="Password"
                              required
                            />
                          </div>
                        </div>
                    }

                    <div className="mt-4 m-pb-1">
                    {flag == true ? <div className="same-button-style">
                        <Link href={"/apartmentVerification"}>
                          <button
                            className="next-button-style mx-2"
                            onClick={() => { setFlag(false) }}
                          >
                            <span className="mr-3"> Previous </span>
                          </button>
                        </Link>
                        <button
                          className="next-button-style"
                          onClick={(e) => { nextValidation(e) }}
                        >
                          <span className="mr-3"> Next </span>
                        </button>
                      </div> :
                        <div className="same-button-style">
                          <button
                            className="next-button-style mx-2"
                            onClick={() => { previousButton() }}
                          >
                            <span className="mr-3">Previous</span>
                          </button>
                          <button
                            className="next-button-style"
                            onClick={(e) => { nextValidationFinal(e) }}
                          >
                            <span className="mr-3"> Submit</span>
                            {loading && loading === true ? (
                              <Spin indicator={antIcon} />
                            ) : null}
                          </button>
                        </div>}
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
export default UserIdentification;
