import React, { useState, useEffect } from 'react';
import { ReactComponent as LoginImage } from './locationIdentification.svg';
import { useRouter } from 'next/router';
import './locationIdentification.module.less';
import Link from 'next/link';
import us_states from './../locationIdentification/us_states.json'
import { Select } from 'antd';
import { ApiGet } from 'apps/web/services/helpers/API/ApiData';
const { Option } = Select;

const LocationIdentification = () => {
  const router = useRouter();
  const [selectedProperty, setSelectedProperty] = useState<any>('');
  const [selctedState, setSelectedState] = useState();
  const [properties, setAllProperties] = useState([]);
  const [emptyError, setEmptyError] = useState('');

  const { deviceId } = router.query


  const onSubmit = (e) => {
    e.preventDefault();

    if (selctedState == undefined) {

      setEmptyError("please select state ")
      setTimeout(() => {
        setEmptyError("");
      }, 5000);
    }
    else if (selectedProperty.length == 0) {
      setEmptyError("please select a property ")
      setTimeout(() => {
        setEmptyError("");
      }, 5000);

    } else {
      try {
        console.log("i m here...in else")
        const [...property] = properties

        function getpropertyByMeterId(selectedProperty) {
          return property.filter(
            function (property) { return property.name == selectedProperty }
          );
        }

        var found = getpropertyByMeterId(selectedProperty);
        console.log(found[0].meter_id, "meterid found");

        const meter_id = found[0].meter_id
        router.push({
          pathname: '/energybillIdentification',
          query: {
            meter_id,
            deviceId
          }
        })
      } catch (error) {
        setEmptyError("Please select right property from the state")
        setTimeout(() => {
          setEmptyError("")
        }, 3000);
      }
    }
  }


  const getPropertyByState = async (selctedState) => {

    setSelectedState(selctedState);

    await ApiGet(`propertiesByState/${selctedState}`)
      .then((res: any) => {
        console.log(res.data, "response--------------")

        setAllProperties(res.data.findPropertyByState);
        console.log(properties, "props")
      })
      .catch((err) => {
        console.log(err);
      });
  }

  useEffect(() => {

    if (selctedState != undefined || selctedState != null) {
      console.log("i m here")
      getPropertyByState(selctedState);
    }


  }, [selctedState]);

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
                    Location Identification
                  </h6>

                  <form>
                    <h5 className="text-red-600">{emptyError}</h5>
                    <span className='text-xl mr-7'>State</span>
                    <Select
                      showSearch
                      // mode="tags"
                      style={{ width: '100%' }}
                      placeholder="select state"
                      onChange={
                        // (value) => setSelectedState(value);
                        (value) => getPropertyByState(value)
                      }

                      optionLabelProp="label"

                    >
                      {us_states?.map(i => {
                        return (
                          <Option value={i.name} key={i.value}>{i.name}</Option>
                        );
                      })}
                    </Select>

                    <span className='text-xl mr-7'>Property</span>
                    <Select
                      showSearch
                      // mode="tags"
                      style={{ width: '100%' }}
                      placeholder="select property"
                      onChange={
                        (value) => setSelectedProperty(value)
                      }

                      optionLabelProp="label"
                    >

                      {properties?.map(i => {
                        return (
                          <Option value={i.name} key={i.meter_id} >{i.name}</Option>
                        );
                      })}
                    </Select>


                    <div className="mt-4 m-pb-1">

                      <div className=" m-pb-1 flex justify-between">

                        <div className="same-button-style">
                          <Link href="/apartmentVerification">
                            <button className="next-button-style">Previous</button>
                          </Link>
                        </div>

                        <div className="same-button-style">
                          <button
                            className="next-button-style"
                            onClick={onSubmit}
                          >
                            <span className="mr-3"> Submit </span>
                          </button>
                        </div>

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
export default LocationIdentification;
